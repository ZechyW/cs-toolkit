"""
Views for loading the React frontend.
Adapted from: https://fractalideas.com/blog/making-react-and-django-play
-well-together-hybrid-app-model/

All requests that reach us are either pointed at `index.html` (in production
mode) or proxied to the React dev server (in development mode)
"""
import logging
import requests
from django import http
from django.conf import settings
from django.shortcuts import render
from django.template import engines
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger("cs-toolkit")


def frontend_production(request):
    """
    View for the main frontend page in production mode:
    Just render the main template.
    :param request:
    :return:
    """
    return render(request, "index.html")


@csrf_exempt
def frontend_development(request):
    """
    View for the main frontend page in development mode:
    Proxy a request to the React development server.
    :param request:
    :return:
    """
    upstream_url = "http://localhost:{}{}".format(
        settings.REACT_PORT, request.path
    )
    method = request.META["REQUEST_METHOD"].lower()
    response = getattr(requests, method)(upstream_url, stream=True)
    content_type = response.headers.get("Content-Type")

    if content_type.startswith("text/html"):
        return http.HttpResponse(
            content=engines["django"].from_string(response.text).render(),
            status=response.status_code,
            reason=response.reason,
        )
    else:
        return http.StreamingHttpResponse(
            streaming_content=response,
            content_type=content_type,
            status=response.status_code,
            reason=response.reason,
        )


frontend = frontend_development if settings.DEBUG else frontend_production