"""
Handles `echo` topic PubSub connections
"""
from asgiref.sync import async_to_sync

from django.utils import timezone

from ..serializers import EchoSubscribeSerializer, EchoMessageSerializer


class EchoHandler:
    """
    Takes messages and broadcasts it to all channels connected to the "echo" channel
    layer group.
    """

    reserved_names = ["System"]
    usernames = []

    def __init__(self, consumer):
        self.subscribed = False
        self.username = None
        self.consumer = consumer

        setattr(self.consumer, "echo_new_user", self.echo_new_user)
        setattr(self.consumer, "echo_del_user", self.echo_del_user)
        setattr(self.consumer, "echo_message", self.echo_message)

    def disconnect(self):
        """
        The connection was closed.
        :return:
        """
        # Free the username
        if self.username:
            EchoHandler.usernames.remove(self.username)
            self.send_to_group(
                {"type": "echo.del_user", "del_user": self.username}
            )

    def handle(self, content):
        """
        Received some content with topic "echo" specified
        :param content:
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
        # Check the message as a whole
        serializer = EchoSubscribeSerializer(data=content)
        if not serializer.is_valid():
            # Kill the connection
            self.consumer.close()
            return

        # Check the specified username
        username = serializer.validated_data["username"]
        if (
            username in EchoHandler.usernames
            or username in EchoHandler.reserved_names
        ):
            # Sending to the consumer directly doesn't broadcast the message to
            # the entire group
            self.send_to_client(
                {
                    "topic": "echo",
                    "type": "error",
                    "message": "username-in-use",
                }
            )
            return

        # Mark username as used and subscribe to echo group
        EchoHandler.usernames.append(username)
        self.username = username
        self.consumer.groups.append("echo")
        async_to_sync(self.consumer.channel_layer.group_add)(
            "echo", self.consumer.channel_name
        )

        # Let everyone (including ourselves) know that the subscription was
        # successful
        self.send_to_group(
            {"type": "echo.new_user", "new_user": self.username}
        )

        self.subscribed = True

    def broadcast(self, content):
        """
        Broadcasts the given message to the entire room
        :param content:
        :return:
        """
        serializer = EchoMessageSerializer(data=content)
        if not serializer.is_valid():
            self.send_to_client(
                {"topic": "echo", "type": "error", "message": "invalid-data"}
            )
        else:
            self.send_to_group(
                {
                    "type": "echo.message",
                    "username": self.username,
                    "message": serializer.validated_data["message"],
                }
            )

    def send_to_group(self, message):
        """
        Sends a message to the "echo" channel layer group
        :param message:
        :return:
        """
        # Server-side communication does not need a PubSub topic
        assert "topic" not in message

        async_to_sync(self.consumer.channel_layer.group_send)("echo", message)

    def send_to_client(self, message):
        """
        Sends a message directly to the client channel
        :param message:
        :return:
        """
        # Communication with a client requires a PubSub topic to be specified
        assert "topic" in message

        self.consumer.send_json(message)

    # Channel layer group events

    def echo_new_user(self, event):
        """
        Receives channel layer group notifications for new users
        :param event:
        :return:
        """
        # Let the channel know
        self.send_to_client(
            {
                "topic": "echo",
                "type": "new_user",
                "timestamp": timezone.now().isoformat(),
                "new_user": event["new_user"],
                "all_users": EchoHandler.usernames,
            }
        )

    def echo_del_user(self, event):
        """
        Receives channel layer group notifications for leaving users
        :param event:
        :return:
        """
        # Let the channel know
        self.send_to_client(
            {
                "topic": "echo",
                "type": "del_user",
                "timestamp": timezone.now().isoformat(),
                "del_user": event["del_user"],
                "all_users": EchoHandler.usernames,
            }
        )

    def echo_message(self, event):
        """
        Receives channel layer group notifications for new messages
        :param event:
        :return:
        """
        # Echo back to our consumer
        self.send_to_client(
            {
                "topic": "echo",
                "type": "message",
                "timestamp": timezone.now().isoformat(),
                "username": event["username"],
                "message": event["message"],
            }
        )
