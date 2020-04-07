from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from . import views

urlpatterns = [
    path("grammar/", views.GenerateDerivation.as_view()),
    path("derivations/", views.DerivationList.as_view()),
    path("derivations/<uuid:pk>/", views.DerivationDetail.as_view()),
    path("derivation_chains/", views.DerivationChainList.as_view()),
    path("derivation_chains/<uuid:pk>/", views.DerivationChainDetail.as_view()),
    path("syntactic_objects/", views.SyntacticObjectList.as_view()),
    path("syntactic_objects/<uuid:pk>/", views.SyntacticObjectDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns, allowed=["json", "html"])
