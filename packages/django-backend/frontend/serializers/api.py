"""
Serializers for API requests
"""
from rest_framework import serializers


class ApiRequestSerializer(serializers.Serializer):
    """
    For validating an API request made over a channels connection.
    """

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    method = serializers.CharField(max_length=100)
    url = serializers.CharField(max_length=200)
    payload = serializers.DictField(required=False)

    @staticmethod
    def validate_method(value):
        allowed_methods = ["get", "post", "put", "patch", "delete"]
        value = value.lower()
        if value not in allowed_methods:
            raise serializers.ValidationError("API request has invalid method.")
        return value
