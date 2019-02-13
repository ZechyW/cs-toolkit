from channels.exceptions import DenyConnection
from channels.generic.websocket import WebsocketConsumer


class DropConsumer(WebsocketConsumer):
    """
    A Consumer that closes any WebSocket connection it receives.
    """

    def connect(self):
        raise DenyConnection
