# Copyright (C) 2023 CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from dateutil import parser as datetime_parser
import datetime
import json

from rest_framework import serializers

class EventSerializer(serializers.Serializer):
    scope = serializers.CharField(required=True)
    obj_name = serializers.CharField(required=False, allow_null=True)
    obj_id = serializers.IntegerField(required=False, allow_null=True)
    obj_val = serializers.CharField(required=False, allow_null=True)
    source = serializers.CharField(required=False, allow_null=True)
    timestamp = serializers.DateTimeField(required=True)
    count = serializers.IntegerField(required=False, allow_null=True)
    duration = serializers.IntegerField(required=False, default=0)
    project_id = serializers.IntegerField(required=False, allow_null=True)
    task_id = serializers.IntegerField(required=False, allow_null=True)
    job_id = serializers.IntegerField(required=False, allow_null=True)
    user_id = serializers.IntegerField(required=False, allow_null=True)
    org_id = serializers.IntegerField(required=False, allow_null=True)
    payload = serializers.CharField(required=False, allow_null=True)

class ClientEventsSerializer(serializers.Serializer):
    events = EventSerializer(many=True, default=[])
    timestamp = serializers.DateTimeField()
    _TIME_THRESHOLD = 100 # seconds

    def to_internal_value(self, data):
        request = self.context.get("request")
        org = request.iam_context['organization']
        org_id = org.id if org else None

        send_time = datetime_parser.isoparse(data["timestamp"])
        receive_time = datetime.datetime.now(datetime.timezone.utc)
        time_correction = receive_time - send_time
        last_timestamp = None

        for event in data["events"]:
            timestamp = datetime_parser.isoparse(event['timestamp'])
            if last_timestamp:
                t_diff = timestamp - last_timestamp
                if t_diff.seconds < self._TIME_THRESHOLD:
                    payload = event.get('payload', {})
                    if payload:
                        payload = json.loads(payload)

                    payload['working_time'] = t_diff.microseconds // 1000
                    payload['username'] = request.user.username
                    event['payload'] = json.dumps(payload)

            last_timestamp = timestamp
            event['timestamp'] = str((timestamp + time_correction).timestamp())
            event['source'] = 'client'
            event['org_id'] = org_id
            event['user_id'] = request.user.id

        return data
