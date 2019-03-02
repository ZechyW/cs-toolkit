from pprint import pprint

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from grammar.serializers import DerivationInputSerializer


class GenerateDerivation(APIView):
    """
    Handle POST requests for a generated derivation.
    """

    # noinspection PyUnusedLocal,PyShadowingBuiltins
    def post(self, request, format=None):
        # The minimum we need to return to the user is a list of Derivations
        # that correspond to the posted lexical array.

        serializer = DerivationInputSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
