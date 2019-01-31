"""
Handles `notify` topic PubSub connections.
Lets clients know when some Django model has changed.
"""
from asgiref.sync import async_to_sync
from rest_framework import serializers

from frontend.handlers.base import Handler


class NotifyHandler(Handler):
    """
    Handles subscriptions to Django model changes for the current Consumer.
    """

    def __init__(self, consumer):
        self.consumer = consumer
        self.in_group = False
        self.watched_models = []

        setattr(self.consumer, "notify_change", self.notify_change)
        setattr(self.consumer, "notify_delete", self.notify_delete)

    def handle(self, content):
        """
        Received some content with topic `notify`
        :param content:
        :return:
        """
        # Check message format
        serializer = NotifySubscribeSerializer(data=content)
        if not serializer.is_valid():
            return

        # Subscribe to the given model
        model = serializer.validated_data["model"]
        if model not in self.watched_models:
            self.watched_models.append(model)

        # And the layer group
        if not self.in_group:
            async_to_sync(self.consumer.channel_layer.group_add)(
                "notify", self.consumer.channel_name
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
                    "topic": "notify",
                    "type": "change",
                    "model": model,
                    "data": event.get("data"),
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


class NotifySubscribeSerializer(serializers.Serializer):
    """
    For validating a subscription request to a given model
    """

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    type = serializers.CharField()
    model = serializers.CharField(max_length=200)

    @staticmethod
    def validate_type(value):
        if not value == "subscribe":
            raise serializers.ValidationError(
                "Message is not a subscription request."
            )
        return value
