"""
Grammar-related model serializers
"""
import json

from rest_framework import serializers
from rest_framework_recursive.fields import RecursiveField

from lexicon.serializers import LexicalItemSerializer
from .models import (
    Derivation,
    DerivationRequest,
    DerivationStep,
    SyntacticObject,
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


class SyntacticObjectSerializer(serializers.ModelSerializer):
    """
    For serializing a SyntacticObject
    """

    class Meta:
        model = SyntacticObject
        fields = [
            "id",
            "text",
            "current_language",
            "is_copy",
            "feature_string",
            "deleted_feature_string",
            "name",
            "children",
        ]

    id = serializers.UUIDField()
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
            "rule_errors",
            "generator_metadata",
        ]

    id = serializers.UUIDField()
    root_so = SyntacticObjectSerializer()
    lexical_array_tail = serializers.ListField(child=LexicalItemSerializer())
    crash_reason = serializers.CharField(required=False)

    rule_errors = serializers.SerializerMethodField("add_rule_errors")
    generator_metadata = serializers.SerializerMethodField("add_generator_metadata")

    @staticmethod
    def add_rule_errors(obj):
        """
        Parse the list of Rule error messages for this DerivationStep and
        add it to the serialisation.
        :param obj:
        :return:
        """
        return list(json.loads(obj.rule_errors_json))

    @staticmethod
    def add_generator_metadata(obj):
        """
        Parse the Generator metadata object for this DerivationStep and add
        it to the serialisation.
        :param obj:
        :return:
        """
        if obj.generator_metadata_json:
            return dict(json.loads(obj.generator_metadata_json))
        else:
            return {}

    def to_representation(self, obj):
        """
        Custom serialization handling
        :param obj:
        :return:
        """
        data = super().to_representation(obj)
        # data is your serialized instance

        # Only add `crash_reason` if the DerivationStep is actually crashed.
        if obj.status != DerivationStep.STATUS_CRASHED:
            data.pop("crash_reason")

        return data


class DerivationSerializer(serializers.ModelSerializer):
    """
    For serializing a Derivation
    TODO: Remove actual chain data, which can be very expensive to update over the wire
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
            "complete",
        ]

    id = serializers.UUIDField()
    first_step = serializers.StringRelatedField()
    converged_chains = serializers.ListField(
        child=serializers.ListField(child=DerivationStepSerializer())
    )
    crashed_chains = serializers.ListField(
        child=serializers.ListField(child=DerivationStepSerializer())
    )


class DerivationChainSerializer(serializers.ModelSerializer):
    """
    For serializing all the derivational chains associated with a Derivation
    """

    class Meta:
        model = Derivation
        fields = ["id", "converged_chains", "crashed_chains"]

    id = serializers.UUIDField()
    converged_chains = serializers.ListField(
        child=serializers.ListField(child=DerivationStepSerializer())
    )
    crashed_chains = serializers.ListField(
        child=serializers.ListField(child=DerivationStepSerializer())
    )
