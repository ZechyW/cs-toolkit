import logging

from autobahn.twisted import WebSocketClientFactory, WebSocketClientProtocol
from autobahn.twisted.websocket import connectWS
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from twisted.internet.defer import ensureDeferred

logger = logging.getLogger("cs-toolkit")


class ReactDevConsumer(AsyncWebsocketConsumer):
    """
    Proxies any connection it receives to the React dev server at
    `localhost:<REACT_PORT>`.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Proxied WS client factory
        self.factory = None

    async def connect(self):
        # The URL path is available within `self.scope`
        upstream_url = "ws://localhost:{}{}".format(
            settings.REACT_PORT, self.scope["path"]
        )

        # Create the proxy WS client
        self.factory = ReactDevFactory(url=upstream_url, consumer=self)
        connectWS(self.factory)

        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        """
        Received some WS data from the browser
        :param text_data:
        :param bytes_data:
        :return:
        """
        if text_data is not None:
            payload = text_data
            isBinary = False
        elif bytes_data is not None:
            payload = bytes_data
            isBinary = True
        else:
            # Should not happen
            logger.warning("ReactDevConsumer.receive called with no data.")
            return

        logger.debug("ReactDevConsumer RECV {}".format(payload))
        self.factory.proxy.sendMessage(payload, isBinary)

    async def send(self, text_data=None, bytes_data=None, close=False):
        if text_data is not None:
            payload = text_data
        else:
            payload = bytes_data
        logger.debug("ReactDevConsumer SEND: {}".format(payload))
        await super().send(text_data, bytes_data, close)


class ReactDevProtocol(WebSocketClientProtocol):
    """
    Autobahn protocol for proxying WS messages to/from the React dev server.
    """

    def onOpen(self):
        # Store this protocol instance on the factory for later use
        self.factory.proxy = self

    def onMessage(self, payload, isBinary):
        """
        Received some WS data from the React dev server; forward it on to
        the Consumer.
        :param payload:
        :param isBinary:
        :return:
        """
        logger.debug("ReactDevProtocol RECV: {}".format(payload))
        if isBinary:
            ensureDeferred(self.factory.consumer.send(bytes_data=payload))
        else:
            ensureDeferred(
                self.factory.consumer.send(text_data=payload.decode("utf8"))
            )


class ReactDevFactory(WebSocketClientFactory):
    """
    Autobahn factory for generating clients that proxy WS messages to/from the
    React dev server.
    """

    protocol = ReactDevProtocol

    def __init__(self, consumer, *args, **kwargs):
        # Hold references to the Channels consumer and the proxy autobahn
        # protocol
        self.consumer = consumer
        self.proxy = None
        super().__init__(*args, **kwargs)
