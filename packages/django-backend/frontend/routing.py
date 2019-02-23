"""
Django Channels routing for the frontend
"""

from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"^redux/$", consumers.ReduxConsumer),
    # React dev server (for auto-reload)
    re_path(r"^sockjs-node", consumers.ReactDevConsumer),
    # Default: Drop all other WS connections
    re_path(r"", consumers.DropConsumer),
]
