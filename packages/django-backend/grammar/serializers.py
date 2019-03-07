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
        if not value:
            raise serializers.ValidationError(
                "Derivation input array must not be empty."
            )

        for lexical_item_skeleton in value:
            if (
                "text" not in lexical_item_skeleton
                or "language" not in lexical_item_skeleton
            ):
                raise serializers.ValidationError(
                    "Derivation input array contained invalid items."
                )

        return value


class DerivationRequestSerializer(serializers.ModelSerializer):
    """
    For serializing a full DerivationRequest
    """

    class Meta:
        model = DerivationRequest
        fields = [
            "id",
            "raw_lexical_array",
            "derivations",
            "creation_time",
            "created_by",
            "completion_time",
        ]

    id = serializers.UUIDField()
    # noinspection PyArgumentList
    derivations = serializers.PrimaryKeyRelatedField(
        read_only=True, many=True, pk_field=serializers.UUIDField()
    )


class DerivationSerializer(serializers.ModelSerializer):
    """
    For serializing a Derivation
    """

    class Meta:
        model = Derivation
        fields = ["id", "status", "first_step"]

    id = serializers.UUIDField()
    first_step = serializers.StringRelatedField()
