from django.urls import path
from . import views

urlpatterns = [path("lexicon/", views.LexicalItemList.as_view())]
