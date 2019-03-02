class Handler:
    """
    Base handler for client connections.
    """

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
