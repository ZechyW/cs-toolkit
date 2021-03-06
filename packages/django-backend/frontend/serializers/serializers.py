"""
Django Channels serializers
"""

from rest_framework import serializers


class EchoSubscribeSerializer(serializers.Serializer):
    """
    For validating a subscription request over the WS connection
    """

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    type = serializers.CharField()
    username = serializers.CharField(max_length=200)

    @staticmethod
    def validate_type(value):
        if not value == "subscribe":
            raise serializers.ValidationError(
                "Client's initial message is not a subscription request."
            )
        return value


class EchoMessageSerializer(serializers.Serializer):
    """
    For validating an echo request
    """

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    type = serializers.CharField()
    message = serializers.CharField()

    @staticmethod
    def validate_type(value):
        if not value == "message":
            raise serializers.ValidationError("Client sent non-message request.")
        return value
