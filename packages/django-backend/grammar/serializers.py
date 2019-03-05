"""
Grammar-related model serializers
"""

from rest_framework import serializers

from grammar.models import Derivation, DerivationRequest


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


class DerivationRequestSerializer(serializers.ModelSerializer):
    """
    For serializing a full DerivationRequest
    """

    class Meta:
        model = DerivationRequest
        fields = "__all__"


class DerivationSerializer(serializers.ModelSerializer):
    """
    For serializing a Derivation
    """

    class Meta:
        model = Derivation
        fields = ["id", "ended", "converged", "first_step"]

    id = serializers.CharField(read_only=True)
    first_step = serializers.StringRelatedField()
