"""
Handles `notify` topic PubSub connections.
Lets clients know when some Django model has changed.
"""
import logging

from asgiref.sync import async_to_sync
from rest_framework import serializers

import frontend.models
from . import base

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
        self.watched_models = []

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
            return self.send_error("No model specified.")

        # Try to subscribe to the given model
        model_name = serializer.validated_data["model"]
        try:
            model = getattr(frontend.models, model_name)
        except AttributeError:
            logger.warning(
                "SubscribeRequest made with invalid model name: {}".format(
                    model_name
                )
            )
            return self.send_error("Invalid model.")

        if model_name not in self.watched_models:
            self.watched_models.append(model_name)

        # And the layer group
        if not self.in_group:
            async_to_sync(self.consumer.channel_layer.group_add)(
                "notify", self.consumer.channel_name
            )

        # Send back the full dataset as an initial response
        self.consumer.send_to_client(
            {
                "type": "subscribe/acknowledge",
                "payload": {
                    "model": model_name,
                    "data": model.get_all_serialized_data(),
                },
            }
        )

    def send_error(self, error_text):
        """
        Sends an error message back to the client
        :return:
        """
        self.consumer.send_to_client(
            {"type": "subscribe/error", "payload": error_text, "error": True}
        )

    def notify_change(self, event):
        """
        Receives channel layer group notifications for changes to the model
        objects
        :param event:
        :return:
        """
        model = event.get("model")
        if model in self.watched_models:
            self.consumer.send_to_client(
                {
                    "type": "subscribe/change",
                    "payload": {"model": model, "data": event.get("data")},
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
        if model in self.watched_models:
            self.consumer.send_to_client(
                {
                    "topic": "notify",
                    "type": "delete",
                    "model": model,
                    "data": event.get("data"),
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
