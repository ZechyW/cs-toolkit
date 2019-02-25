from django.urls import re_path, path
from . import views

# All requests that were not previously resolved are routed through
# `views.frontend`
urlpatterns = [path("", views.frontend), re_path(r"^.*/", views.frontend)]
