"""
Grammar-related model serializers
"""

from rest_framework import serializers
from rest_framework_recursive.fields import RecursiveField

from lexicon.serializers import LexicalItemSerializer
from .models import (
    Derivation,
    DerivationRequest,
    DerivationStep,
    SyntacticObject,
    SyntacticObjectValue,
)


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
            "last_completion_time",
        ]

    id = serializers.UUIDField()
    # noinspection PyArgumentList
    derivations = serializers.PrimaryKeyRelatedField(
        read_only=True, many=True, pk_field=serializers.UUIDField()
    )


class SyntacticObjectValueSerializer(serializers.ModelSerializer):
    """
    For serializing a SyntacticObjectValue
    """

    class Meta:
        model = SyntacticObjectValue
        fields = ["text", "current_language", "feature_string"]


class SyntacticObjectSerializer(serializers.ModelSerializer):
    """
    For serializing a SyntacticObject
    """

    class Meta:
        model = SyntacticObject
        fields = ["id", "name", "value", "children"]

    id = serializers.UUIDField()
    value = SyntacticObjectValueSerializer()
    children = RecursiveField(many=True)


class DerivationStepSerializer(serializers.ModelSerializer):
    """
    For serializing a derivational chain (essentially a List of
    DerivationSteps)
    """

    class Meta:
        model = DerivationStep
        fields = [
            "id",
            "status",
            "root_so",
            "lexical_array_tail",
            "crash_reason",
        ]

    id = serializers.UUIDField()
    root_so = SyntacticObjectSerializer()
    lexical_array_tail = serializers.ListField(child=LexicalItemSerializer())
    crash_reason = serializers.CharField(required=False)

    def to_representation(self, obj):
        """
        Only add `crash_reason` if the DerivationStep is actually crashed.
        :param obj:
        :return:
        """
        data = super().to_representation(obj)
        # data is your serialized instance

        if obj.status != DerivationStep.STATUS_CRASHED:
            data.pop("crash_reason")

        return data


class DerivationSerializer(serializers.ModelSerializer):
    """
    For serializing a Derivation
    """

    class Meta:
        model = Derivation
        fields = [
            "id",
            "first_step",
            "converged_count",
            "crashed_count",
            "converged_chains",
            "crashed_chains",
        ]

    id = serializers.UUIDField()
    first_step = serializers.StringRelatedField()
    converged_chains = serializers.ListField(
        child=serializers.ListField(child=DerivationStepSerializer())
    )
    crashed_chains = serializers.ListField(
        child=serializers.ListField(child=DerivationStepSerializer())
    )
