from django.urls import re_path, path
from . import views

# All requests that were not previously resolved are routed through
# `views.frontend`
urlpatterns = [
    # Bare URL (e.g., `http://localhost:8080`)
    path("", views.frontend),
    # URLs that end in a filename (as opposed to endpoints, which might
    # still get resolved after APPEND_SLASH is done.)
    re_path(r"^.*/?[^/]+[.][^/]+$", views.frontend),
    # `sockjs-node/*` is used by the React dev server for hot reloads
    re_path(r"^sockjs-node", views.frontend),
]
