from django.urls import path
from . import views

urlpatterns = [
    path('lexicon/', views.LexicalItemListCreate.as_view()),
]
