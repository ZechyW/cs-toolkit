from django.urls import re_path
from . import views

# All requests that were not previously resolved are routed through
# `views.frontend`
urlpatterns = [re_path(r"", views.frontend)]
