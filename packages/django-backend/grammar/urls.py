from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from . import views

urlpatterns = [
    path("grammar/", views.GenerateDerivation.as_view()),
    path("derivations/", views.DerivationList.as_view()),
    path("derivations/<uuid:pk>/", views.DerivationDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns, allowed=["json", "html"])
