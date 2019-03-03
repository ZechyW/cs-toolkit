import itertools
import json
import logging
from pprint import pprint

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from grammar.models import (
    Derivation,
    DerivationStep,
    LexicalArrayItem,
    DerivationRequest,
)
from grammar.serializers import DerivationInputSerializer
from lexicon.models import LexicalItem
from lexicon.serializers import LexicalItemSerializer

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

        # Create new DerivationRequest.
        derivation_request = DerivationRequest.objects.create(
            raw_lexical_array=json.dumps(serializer.data["derivation_input"])
        )

        # Find fully specified LexicalItems for the given input array.
        lexical_item_sets = []
        for lexical_skeleton in serializer.data["derivation_input"]:
            lexical_item_set = LexicalItem.objects.filter(
                text=lexical_skeleton["text"],
                language=lexical_skeleton["language"],
            )
            lexical_item_sets.append(lexical_item_set)

        # Spread the potential LexicalItems for each input item into
        # `itertools.product` to get the list of all potential lexical arrays.
        lexical_arrays = itertools.product(*lexical_item_sets)

        # Retrieve/create corresponding Derivations.
        for lexical_array in lexical_arrays:
            # We have to add `.filter()` once per lexical item/order pair,
            # because of the way ManyToMany filtering works.
            existing = Derivation.objects
            for [idx, lexical_item] in enumerate(lexical_array):
                existing = existing.filter(
                    first_step__lexical_array_items__lexical_item=lexical_item,
                    first_step__lexical_array_items__order=idx,
                )

            if len(existing) > 0:
                derivation_request.derivations.add(existing.get())
            else:
                derivation_request.derivations.add(
                    create_derivation(lexical_array)
                )

        return Response("OK", status=status.HTTP_200_OK)


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
    return derivation
