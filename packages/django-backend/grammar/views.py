from pprint import pprint

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class GenerateDerivation(APIView):
    """
    Handle POST requests for a generated derivation.
    """

    def post(self, request, format=None):
        pprint(request.data)

        return Response("Beep Boop")
