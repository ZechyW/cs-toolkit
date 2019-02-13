"""
Django Channels routing for the frontend
"""

from django.urls import re_path

from . import consumers, views

websocket_urlpatterns = [
    re_path(r"^ws/$", consumers.PubSubConsumer),
    re_path(r"", consumers.DropConsumer),
]
