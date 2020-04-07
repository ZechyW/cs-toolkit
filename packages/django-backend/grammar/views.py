import itertools
import json
import logging
from typing import List

from django.utils import timezone
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from lexicon.models import LexicalItem
from .models import Derivation, DerivationRequest, SyntacticObject
from .serializers import (
    DerivationInputSerializer,
    DerivationRequestSerializer,
    DerivationSerializer,
    SyntacticObjectSerializer,
)
from .tasks import derivation_actor
from .util import get_derivation_by_lexical_array

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
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        derivation_input = serializer.validated_data["derivation_input"]

        # Find fully specified LexicalItems for the given input array.
        lexical_item_sets = []
        for lexical_skeleton in derivation_input:
            lexical_item_set = LexicalItem.objects.filter(
                text=lexical_skeleton["text"], language=lexical_skeleton["language"],
            )

            # Reject request if there are invalid items
            if len(lexical_item_set) == 0:
                return Response(
                    {"derivation_input": ["Lexical array contained invalid items."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # If not add it to the list and keep going
            lexical_item_sets.append(lexical_item_set)

        # Spread the potential LexicalItems for each input item into
        # `itertools.product` to get the list of all potential lexical arrays.
        lexical_arrays = itertools.product(*lexical_item_sets)

        # Retrieve/create corresponding Derivations.
        derivations = []
        lexical_array: List[LexicalItem]
        for lexical_array in lexical_arrays:
            derivations.append(get_derivation_by_lexical_array(lexical_array))

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

        # Request processing of all the Derivations.
        for derivation in derivations:
            derivation_request.derivations.add(derivation)
            derivation_actor.send(str(derivation.first_step.id))

        # Serialise and return DerivationRequest
        serializer = DerivationRequestSerializer(derivation_request)

        return Response(serializer.data, status=status.HTTP_200_OK)


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
