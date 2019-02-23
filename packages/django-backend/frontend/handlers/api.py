"""
Handles `api` topic PubSub connections.
Lets clients perform REST API operations over a channel.
"""
import logging

from django.conf import settings
from rest_framework.test import APIClient

from frontend.handlers.base import Handler
from ..serializers.api import ApiRequestSerializer

logger = logging.getLogger("cs-toolkit")


class ApiRequestHandler(Handler):
    """
    Handles REST API requests for the current Consumer.
    """

    def __init__(self, consumer):
        self.consumer = consumer
        self.client = APIClient(HTTP_HOST="localhost:" + settings.DJANGO_PORT)

    def handle(self, content):
        """
        Received some content with topic `api`.
        Process it via our test APIClient and return the results.

        https://stackoverflow.com/questions/4576290/can-django-test-client
        -be-used-for-api-calls-in-production

        :param content:
        :return:
        """
        # Check the API request
        serializer = ApiRequestSerializer(data=content)
        if not serializer.is_valid():
            return self.consumer.send_to_client(
                {"topic": "api", "type": "error", "message": "invalid-request"}
            )

        # Make request
        method = serializer.validated_data["method"]
        url = serializer.validated_data["url"]
        payload = serializer.validated_data.get("payload", None)
        logger.info("API {}:{}:{}".format(method, url, payload))

        response = getattr(self.client, method)(url, data=payload, follow=True)

        # Return to client
        # API response
        to_client = {
            "topic": "api",
            "type": "response",
            "status_code": response.status_code,
        }
        if response.get("Content-Type") == "application/json":
            to_client["content"] = response.json()
        else:
            to_client["content"] = content

        # Original request params
        to_client.update({"method": method, "url": url})
        if payload is not None:
            to_client["payload"] = payload

        self.consumer.send_to_client(to_client)
