"""
Django Channels consumers for the frontend
"""

import datetime
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class EchoConsumer(WebsocketConsumer):
    """
    A Consumer that takes WebSocket data and echoes it back to all connected clients
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.group_name = "echo_group"

    def connect(self):
        # Join channel layer group
        async_to_sync(self.channel_layer.group_add)(
            self.group_name, self.channel_name
        )

        self.accept()

    def disconnect(self, code):
        # Leave channel layer group
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name
        )

    def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.group_name, {"type": "echo_message", "message": message}
        )

    def echo_message(self, event):
        """
        Receives channel layer group messages of type "echo_message"
        :param event:
        :return:
        """
        # Echo back to all channels in the group
        self.send(
            text_data=json.dumps(
                {
                    "type": event["type"],
                    "timestamp": "{:%Y-%m-%d %H:%M:%S}".format(
                        datetime.datetime.now()
                    ),
                    "message": event["message"],
                }
            )
        )
