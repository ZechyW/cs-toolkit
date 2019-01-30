"""
Django Channels consumers for the frontend
"""
import logging
import re

from channels.generic.websocket import JsonWebsocketConsumer

from .serializers import PubSubSerializer
from . import handlers

logger = logging.getLogger("cs-toolkit")


class WebSocketConsumer(JsonWebsocketConsumer):
    """
    A Consumer that manages WebSocket Pub/Sub connections, dispatching data
    to the various topic handlers
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.handlers = {}

    def disconnect(self, code):
        """
        The WS connection was closed.  Let all handlers know.
        :param code:
        :return:
        """
        for topic in self.handlers:
            self.handlers[topic].disconnect(code)

    def receive_json(self, content, **kwargs):
        """
        Received raw JSON data over the WebSocket
        :param content:
        :param kwargs:
        :return:
        """
        logger.info("WebSocket RECV JSON {}".format(content))

        # Should we handle this data?
        serializer = PubSubSerializer(data=content)
        if not serializer.is_valid():
            return

        # Do we have a handler initialised?
        topic = content["topic"]
        if topic in self.handlers:
            self.handlers[topic].handle(content)
            return

        # If not, is one available in the `handlers` submodule?
        handler_name = self.get_handler_name(topic)
        try:
            handler_class = getattr(handlers, handler_name)
        except AttributeError:
            # Nope
            logger.warning("Warning: No valid handler", handler_name)
            return

        # Yep: Instantiate it and handle the request
        handler = handler_class(self)
        self.handlers[topic] = handler
        handler.handle(content)

    @staticmethod
    def get_handler_name(topic):
        """
        Returns a valid handler class name for the given topic.
        Strips all non-word characters, converts to title case, removes spaces,
        and adds "Handler" to the end.
        :param topic:
        :return:
        """
        # Replace everything that is not a word or space
        handler_name = re.sub(r"[^\w\s]", "", topic)
        # Title case
        handler_name = handler_name.title()
        # Remove spaces
        handler_name = re.sub(r"\s+", "", handler_name)
        # Add "Handler"
        return handler_name + "Handler"

    def send_to_client(self, message):
        """
        Called by handlers to send messages directly on the client channel.
        :param message:
        :return:
        """
        # Communication with a client requires a PubSub topic to be specified
        assert "topic" in message

        self.send_json(message)
