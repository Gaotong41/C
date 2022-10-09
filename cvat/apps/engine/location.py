# Copyright (C) 2022 CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from cvat.apps.engine.models import Location
from cvat.apps.engine.utils import DjangoEnum, StrEnum

class StorageType(DjangoEnum, StrEnum):
    TARGET = 'target_storage'
    SOURCE = 'source_storage'

def get_location_configuration(obj, field_name, use_settings=False):
    location_conf = dict()
    if use_settings:
        storage = getattr(obj, field_name)
        if storage is None:
            location_conf['location'] = Location.LOCAL
        else:
            location_conf['location'] = storage.location
            sid = storage.cloud_storage_id
            if sid:
                location_conf['storage_id'] = sid
    else:
        # obj is query_params
        # FIXME when ui part will be done
        location_conf['location'] = obj.get('location', Location.LOCAL)
        # try:
        #     location_conf['location'] = obj['location']
        # except KeyError:
        #     raise ValidationError("Custom settings were selected but no location was specified")

        sid = obj.get('cloud_storage_id')
        if sid:
            location_conf['storage_id'] = int(sid)

    return location_conf
