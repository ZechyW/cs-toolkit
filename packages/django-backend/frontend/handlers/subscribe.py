"""
Handles `notify` topic PubSub connections.
Lets clients know when some Django model has changed.
"""
import logging

from asgiref.sync import async_to_sync
from rest_framework import serializers

import frontend.subscribe_models
from frontend.handlers import base

logger = logging.getLogger("cs-toolkit")


class SubscribeRequestHandler(base.Handler):
    """
    Handles subscriptions to Django model changes for the current Consumer.
    Handles client requests with `type` set to "SubscribeRequest", and adds
    clients to the "notify" channel layer group.
    """

    def __init__(self, consumer):
        self.consumer = consumer
        self.in_group = False
        self.watched_items = []

        setattr(self.consumer, "notify_change", self.notify_change)
        setattr(self.consumer, "notify_delete", self.notify_delete)

    def handle(self, content):
        """
        Received some content with `type` set to "SubscribeRequest"
        :param content:
        :return:
        """
        # Check message format
        serializer = SubscribeRequestSerializer(data=content)
        if not serializer.is_valid():
            logger.warning(
                "SubscribeRequest made without specifying a valid model name."
            )
            return self.send_error({"error": serializer.errors})

        # Check the model name provided.
        model = serializer.validated_data["model"]
        try:
            Model = getattr(frontend.subscribe_models, model)
        except AttributeError:
            logger.warning(
                "SubscribeRequest made for invalid model: {}".format(model)
            )
            return self.send_error({"model": model, "error": "Invalid model."})

        # Check if a valid instance id was specified
        item_id = serializer.validated_data.get("id")

        if item_id is None:
            item = model
        else:
            item = "{}:{}".format(model, item_id)
            if not Model.objects.filter(id=item_id).exists():
                return self.send_error(
                    {
                        "model": model,
                        "id": item_id,
                        "error": "Model {} does not have any objects with ID "
                        "{}.".format(model, item_id),
                    }
                )

        if item not in self.watched_items:
            self.watched_items.append(item)

        # And the layer group
        if not self.in_group:
            async_to_sync(self.consumer.channel_layer.group_add)(
                "notify", self.consumer.channel_name
            )

        # Send back the full dataset as an initial response
        if item_id is None:
            payload = {"model": model, "data": Model.get_all_serialized_data()}
        else:
            payload = {
                "model": model,
                "id": item_id,
                "data": Model.objects.get(id=item_id).serialized_data,
            }

        self.consumer.send_to_client(
            {"type": "subscribe/acknowledge", "payload": payload}
        )

    def send_error(self, error_payload):
        """
        Sends an error message back to the client
        :return:
        """
        self.consumer.send_to_client(
            {
                "type": "subscribe/error",
                "payload": error_payload,
                "error": True,
            }
        )

    def notify_change(self, event):
        """
        Receives channel layer group notifications for changes to the model
        objects
        :param event:
        :return:
        """
        model = event.get("model")
        item_id = event.get("id")

        try:
            Model = getattr(frontend.subscribe_models, model)
        except AttributeError:
            logger.warning(
                "Subscribe:notify_change called with invalid model: {}"
                "".format(model)
            )
            return

        data = Model.objects.get(id=item_id).serialized_data

        # Model-level subscriptions
        if model in self.watched_items:
            self.consumer.send_to_client(
                {
                    "type": "subscribe/change",
                    "payload": {"model": model, "data": data},
                }
            )

        # Instance-level subscriptions
        item = "{}:{}".format(model, item_id)
        if item in self.watched_items:
            self.consumer.send_to_client(
                {
                    "type": "subscribe/change",
                    "payload": {"model": model, "id": item_id, "data": data},
                }
            )

    def notify_delete(self, event):
        """
        Receives channel layer group notifications for changes to the model
        objects
        :param event:
        :return:
        """
        model = event.get("model")
        item_id = event.get("id")

        try:
            Model = getattr(frontend.subscribe_models, model)
        except AttributeError:
            logger.warning(
                "Subscribe:notify_delete called with invalid model: "
                "{}".format(model)
            )
            return

        data = Model.objects.get(id=item_id).serialized_data

        # Model-level subscriptions
        if model in self.watched_items:
            self.consumer.send_to_client(
                {
                    "type": "subscribe/delete",
                    "payload": {"model": model, "data": data},
                }
            )

        # Instance-level subscriptions
        item = "{}:{}".format(model, item_id)
        if item in self.watched_items:
            self.consumer.send_to_client(
                {
                    "type": "subscribe/delete",
                    "payload": {"model": model, "id": item_id, "data": data},
                }
            )


class SubscribeRequestSerializer(serializers.Serializer):
    """
    For validating a subscription request to a given model
    """

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    model = serializers.CharField(max_length=200)
    id = serializers.CharField(max_length=200, required=False)
