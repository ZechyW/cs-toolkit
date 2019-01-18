"""
Django Channels consumers for the frontend
"""

import datetime

from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer

from .serializers import SubscribeSerializer, EchoSerializer


class EchoConsumer(JsonWebsocketConsumer):
    """
    A Consumer that takes WebSocket data and echoes it back to all connected clients.
    All the Channels are added to the "echo" group.
    """

    reserved_names = ["System"]
    usernames = []
    timestamp_format = "{:%d %b, %H:%M}"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.subscribed = False
        self.group_name = "echo"
        self.username = None

    def disconnect(self, code):
        """
        The WebSocket connection was closed
        :param code:
        :return:
        """
        # Free the username
        if self.username:
            EchoConsumer.usernames.remove(self.username)
            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {"type": "echo_del_user", "del_user": self.username},
            )

    def receive_json(self, content, **kwargs):
        """
        Received JSON data over the WebSocket
        :param content:
        :param kwargs:
        :return:
        """
        if not self.subscribed:
            # Initial request
            self.subscribe(content)
        else:
            # Send message to room group
            self.broadcast(content)

    def subscribe(self, content):
        """
        Tries to perform an initial subscription with user-provided data
        :param content:
        :return:
        """
        # All Channels will belong in a single group, so set it here to make sure any
        # validation passes
        content["group"] = self.group_name
        serializer = SubscribeSerializer(data=content)
        if not serializer.is_valid():
            # Kill the connection
            self.close()
        else:
            # Subscribe to the given group, if the username is valid
            username = serializer.validated_data["username"]
            if (
                username in EchoConsumer.usernames
                or username in EchoConsumer.reserved_names
            ):
                return self.send_json(
                    {"type": "echo_error", "message": "username-in-use"}
                )
            else:
                # Mark username as used and subscribe to echo group
                EchoConsumer.usernames.append(username)
                self.username = username
                self.groups.append(self.group_name)
                async_to_sync(self.channel_layer.group_add)(
                    self.group_name, self.channel_name
                )

                # Let everyone (including ourselves) know that the subscription was
                # successful
                async_to_sync(self.channel_layer.group_send)(
                    self.group_name,
                    {"type": "echo_new_user", "new_user": self.username},
                )

                self.subscribed = True

    def broadcast(self, content):
        """
        Broadcasts the given message to the entire room
        :param content:
        :return:
        """
        serializer = EchoSerializer(data=content)
        if not serializer.is_valid():
            self.send_json({"type": "echo_error", "message": "invalid-data"})
        else:
            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {
                    "type": "echo_message",
                    "username": self.username,
                    "message": serializer.validated_data["message"],
                },
            )

    def echo_new_user(self, event):
        """
        Receives channel layer group notifications for new users
        :param event:
        :return:
        """
        # Let the channel know
        self.send_json(
            {
                "type": event["type"],
                "timestamp": EchoConsumer.timestamp_format.format(
                    datetime.datetime.now()
                ),
                "new_user": event["new_user"],
                "all_users": EchoConsumer.usernames,
            }
        )

    def echo_del_user(self, event):
        """
        Receives channel layer group notifications for leaving users
        :param event:
        :return:
        """
        # Let the channel know
        self.send_json(
            {
                "type": event["type"],
                "timestamp": EchoConsumer.timestamp_format.format(
                    datetime.datetime.now()
                ),
                "del_user": event["del_user"],
                "all_users": EchoConsumer.usernames,
            }
        )

    def echo_message(self, event):
        """
        Receives channel layer group messages of type "echo_message"
        :param event:
        :return:
        """
        # Echo back to all channels in the group
        self.send_json(
            {
                "type": event["type"],
                "timestamp": EchoConsumer.timestamp_format.format(
                    datetime.datetime.now()
                ),
                "username": event["username"],
                "message": event["message"],
            }
        )
