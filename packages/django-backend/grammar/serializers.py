"""
Grammar-related model serializers
"""

from rest_framework import serializers


class DerivationInputSerializer(serializers.Serializer):
    """
    For validating a derivation generation request.
    """

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    derivation_input = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField())
    )

    @staticmethod
    def validate_derivation_input(value):
        for lexical_item_skeleton in value:
            if (
                "text" not in lexical_item_skeleton
                or "language" not in lexical_item_skeleton
            ):
                raise serializers.ValidationError(
                    "Client sent invalid derivation input array."
                )

        return value
