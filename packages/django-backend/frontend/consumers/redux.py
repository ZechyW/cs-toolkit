import logging
import re
import zlib

from channels.generic.websocket import JsonWebsocketConsumer
from rest_framework import serializers

from .. import handlers

logger = logging.getLogger("cs-toolkit")


class ReduxConsumer(JsonWebsocketConsumer):
    """
    A Consumer that manages WebSocket connections, dispatching data
    to the various message handlers.
    Receives messages that look like FSAs (from Redux on the client side).
    (https://github.com/redux-utilities/flux-standard-action)

    Expects zlib compression on all incoming messages, and applies zlib
    compression to all outgoing messages.
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
        for message_type in self.handlers:
            self.handlers[message_type].disconnect(code)

    def receive(self, text_data=None, bytes_data=None, **kwargs):
        """
        Receives incoming zlib-compressed data and parses it as JSON.
        :param text_data:
        :param bytes_data:
        :param kwargs:
        :return:
        """
        if bytes_data:
            text_data = zlib.decompress(bytes_data).decode("utf-8")
            self.receive_json(self.decode_json(text_data), **kwargs)
        else:
            raise ValueError("No bytes section for incoming WebSocket frame!")

    def receive_json(self, content, **kwargs):
        """
        Handles the received JSON data.
        :param content:
        :param kwargs:
        :return:
        """
        logger.info("WebSocket RECV JSON {}".format(content))

        # Should we handle this data?
        serializer = ReduxSerializer(data=content)
        if not serializer.is_valid():
            return

        # Do we have a handler initialised?
        message_type = content["type"]
        payload = content["payload"]

        if message_type in self.handlers:
            self.handlers[message_type].handle(payload)
            return

        # If not, is one available in the `handlers` submodule?
        handler_name = self.get_handler_name(message_type)
        try:
            handler_class = getattr(handlers, handler_name)
        except AttributeError:
            # Nope
            logger.warning("Warning: No valid handler", handler_name)
            return

        # Yep: Instantiate it and handle the request
        handler = handler_class(self)
        self.handlers[message_type] = handler
        handler.handle(payload)

    @staticmethod
    def get_handler_name(message_type):
        """
        Returns a valid handler class name for the given topic.
        Converts to title case, strips all non-word characters, removes
        spaces, and adds "Handler" to the end.
        :param message_type:
        :return:
        """
        # Title case
        handler_name = message_type.title()
        # Replace everything that is not a word or space
        handler_name = re.sub(r"[^\w\s]", "", handler_name)
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
        # Communication with a client requires an action type to be specified
        assert "type" in message

        logger.info("WebSocket SEND JSON: type: {}".format(message["type"]))

        self.send_json(message)

    def send_json(self, content, close=False):
        """
        Encode the given content as JSON, zlib-compress it and send it to the
        client.
        """
        super().send(
            bytes_data=zlib.compress(
                self.encode_json(content).encode("utf-8")
            ),
            close=close,
        )


class ReduxSerializer(serializers.Serializer):
    """
    For validating a Redux action over the WS connection
    """

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    type = serializers.CharField()
    payload = serializers.DictField()
