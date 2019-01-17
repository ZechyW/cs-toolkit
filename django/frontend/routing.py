"""
Django Channels routing for the frontend
"""

from django.conf.urls import url

from . import consumers

websocket_urlpatterns = [url(r"^ws/echo/$", consumers.EchoConsumer)]
