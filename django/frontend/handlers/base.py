"""
Base handler for PubSub connections.
"""


class Handler:
    def disconnect(self, code):
        """
        The Consumer's connection was closed.
        :param code:
        :return:
        """
        pass

    def handle(self, content):
        """
        Called when the handler should process some message with a given
        `topic` from a Consumer.
        :param content:
        :return:
        """
        pass
