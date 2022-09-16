import django_rq
from django.dispatch import Signal, receiver
import requests

from cvat.apps.engine.serializers import BasicUserSerializer
from cvat.apps.engine.models import Project
from cvat.apps.organizations.models import Organization

from .event_type import EventTypeChoice
from .models import Webhook, WebhookDelivery, WebhookTypeChoice

signal_update = Signal()
signal_create = Signal()
signal_delete = Signal()
signal_redelivery = Signal()
signal_ping = Signal()


def send_webhook(webhook, payload, delivery):
    response = None
    try:
        response = requests.post(webhook.target_url, json=payload)
        status_code = str(response.status_code)
    except requests.ConnectionError:
        status_code = "Failed to connect to target url"

    setattr(delivery, 'status_code', status_code)
    if response is not None:
        setattr(delivery, 'response', response.text)

    delivery.save()

def add_to_queue(webhook, payload, redelivery=False):
    delivery = WebhookDelivery.objects.create(
        webhook_id=webhook.id,
        event=payload["event"],
        status_code=None,
        changed_fields=",".join(list(payload.get("before_update", {}).keys())),
        redelivery=redelivery,
        request=payload,
        response="",
    )

    queue = django_rq.get_queue("webhooks")
    queue.enqueue_call(func=send_webhook, args=(webhook, payload, delivery))

    return delivery

def select_webhooks(project_id, org_id, event_name):
    selected_webhooks = []
    if org_id is not None:
        webhooks = Webhook.objects.filter(is_active=True, events__contains=event_name,
            type=WebhookTypeChoice.ORGANIZATION, organization=org_id)
        selected_webhooks += list(webhooks)

    if project_id is not None:
        webhooks = Webhook.objects.filter(is_active=True, events__contains=event_name,
            type=WebhookTypeChoice.PROJECT, organization=org_id, project=project_id)
        selected_webhooks += list(webhooks)

    return selected_webhooks

def payload(data, request):
    return {
        **data,
        "sender": BasicUserSerializer(request.user, context={"request": request}).data,
    }

def project_id(instance):
    if isinstance(instance, Project):
        return instance.id

    try:
        pid = getattr(instance, 'project_id', None)
        if pid is None:
            return instance.get_project_id()
        return pid
    except Exception:
        return None

def organization_id(instance):
    if isinstance(instance, Organization):
        return instance.id

    try:
        oid = getattr(instance, 'organization_id', None)
        if oid is None:
            return instance.get_organization_id()
        return oid
    except Exception:
        return None

@receiver(signal_update)
def update(sender, instance=None, old_values=None, **kwargs):
    event_name = f"{sender.basename}_updated"
    if event_name not in map(lambda a: a[0], EventTypeChoice.choices()):
        return

    serializer = sender.get_serializer_class()(
        instance=instance,
        context={"request": sender.request}
    )

    pid = project_id(instance)
    oid = organization_id(instance)

    if not any((oid, pid)):
        return

    data = {
        "event": event_name,
        sender.basename: serializer.data,
        "before_update": old_values,
    }

    for webhook in select_webhooks(pid, oid, event_name):
        data.update({"webhook_id": webhook.id})
        add_to_queue(webhook, payload(data, sender.request))

@receiver(signal_create)
def resource_created(sender, instance=None, **kwargs):
    event_name = f"{sender.basename}_created"

    pid = project_id(instance)
    oid = organization_id(instance)
    if not any((oid, pid)):
        return

    serializer = sender.get_serializer_class()(
        instance=instance,
        context={"request": sender.request}
    )

    data = {
        "event": event_name,
        sender.basename: serializer.data
    }

    for webhook in select_webhooks(pid, oid, event_name):
        data.update({"webhook_id": webhook.id})
        add_to_queue(webhook, payload(data, sender.request))


@receiver(signal_delete)
def resource_deleted(sender, instance=None, **kwargs):
    event_name = f"{sender.basename}_deleted"

    pid = project_id(instance)
    oid = organization_id(instance)
    if not any((oid, pid)):
        return

    serializer = sender.get_serializer_class()(
        instance=instance,
        context={"request": sender.request}
    )

    data = {
        "event": event_name,
        sender.basename: serializer.data
    }

    for webhook in select_webhooks(pid, oid, event_name):
        data.update({"webhook_id": webhook.id})
        add_to_queue(webhook, payload(data, sender.request))


@receiver(signal_redelivery)
def redelivery(sender, data=None, **kwargs):
    add_to_queue(sender.get_object(), data, redelivery=True)


@receiver(signal_ping)
def ping(sender, serializer=None, **kwargs):
    data = {"event": "ping", "webhook": serializer.data}
    delivery = add_to_queue(serializer.instance, payload(data, sender.request))
    return delivery
