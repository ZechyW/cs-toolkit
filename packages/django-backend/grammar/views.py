import itertools
import json
import logging

from django.db.models import Count
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from lexicon.models import LexicalItem
from .models import (
    Derivation,
    DerivationRequest,
    DerivationStep,
    LexicalArrayItem,
    SyntacticObject,
)
from .serializers import (
    DerivationInputSerializer,
    DerivationRequestSerializer,
    DerivationSerializer,
    SyntacticObjectSerializer,
)
from .tasks import process_derivation_step

logger = logging.getLogger("cs-toolkit")


class GenerateDerivation(APIView):
    """
    Handle POST requests to generate a derivation.

    The minimum we need to return to the user is a list of Derivations that
    correspond to the posted lexical array.
    """

    # noinspection PyUnusedLocal,PyShadowingBuiltins
    def post(self, request, format=None):
        # Validate request
        serializer = DerivationInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        derivation_input = serializer.validated_data["derivation_input"]

        # Create new DerivationRequest.
        if request.user.is_authenticated:
            username = request.user.username
        else:
            username = None

        derivation_request = DerivationRequest.objects.create(
            raw_lexical_array=json.dumps(derivation_input),
            creation_time=timezone.now(),
            created_by=username,
        )

        # Find fully specified LexicalItems for the given input array.
        lexical_item_sets = []
        for lexical_skeleton in derivation_input:
            lexical_item_set = LexicalItem.objects.filter(
                text=lexical_skeleton["text"],
                language=lexical_skeleton["language"],
            )
            lexical_item_sets.append(lexical_item_set)

        # Spread the potential LexicalItems for each input item into
        # `itertools.product` to get the list of all potential lexical arrays.
        lexical_arrays = itertools.product(*lexical_item_sets)

        # Retrieve/create corresponding Derivations.
        derivations = []
        for lexical_array in lexical_arrays:
            # We have to add `.filter()` once per lexical item/order pair,
            # because of the way ManyToMany filtering works.
            # We also add a count annotation to make sure we don't pick up
            # any Derivations that start with the same lexical items,
            # but whose lexical arrays continue after.
            existing = Derivation.objects.annotate(
                count=Count("first_step__lexical_array_items")
            ).filter(count=len(lexical_array))
            for [idx, lexical_item] in enumerate(lexical_array):
                existing = existing.filter(
                    first_step__lexical_array_items__lexical_item=lexical_item,
                    first_step__lexical_array_items__order=idx,
                )

            if len(existing) > 0:
                derivations.append(existing.get())
            else:
                derivations.append(create_derivation(lexical_array))

        # Request processing of all the Derivations.
        for derivation in derivations:
            derivation_request.derivations.add(derivation)
            process_derivation_step.send(derivation.first_step.id.hex)

        # Serialise and return DerivationRequest
        serializer = DerivationRequestSerializer(derivation_request)

        return Response(serializer.data, status=status.HTTP_200_OK)


def create_derivation(lexical_array):
    """
    Given an array of LexicalItems, create a corresponding Derivation
    :param lexical_array:
    :return:
    """
    # Start with a DerivationStep
    first_step = DerivationStep.objects.create()
    for [idx, lexical_item] in enumerate(lexical_array):
        LexicalArrayItem.objects.create(
            derivation_step=first_step, lexical_item=lexical_item, order=idx
        )

    # Create and return a Derivation
    derivation = Derivation.objects.create(first_step=first_step)
    first_step.derivations.add(derivation)
    return derivation


class DerivationList(generics.ListAPIView):
    queryset = Derivation.objects.all()
    serializer_class = DerivationSerializer


class DerivationDetail(generics.RetrieveAPIView):
    queryset = Derivation.objects.all()
    serializer_class = DerivationSerializer


class SyntacticObjectList(generics.ListAPIView):
    queryset = SyntacticObject.objects.all()
    serializer_class = SyntacticObjectSerializer


class SyntacticObjectDetail(generics.RetrieveAPIView):
    queryset = SyntacticObject.objects.all()
    serializer_class = SyntacticObjectSerializer
