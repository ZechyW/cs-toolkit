from django.shortcuts import render

# Create your views here.
from lexicon.models import LexicalItem
from lexicon.serialisers import LexicalItemSerializer
from rest_framework import generics


class LexicalItemListCreate(generics.ListCreateAPIView):
    queryset = LexicalItem.objects.all()
    serializer_class = LexicalItemSerializer
