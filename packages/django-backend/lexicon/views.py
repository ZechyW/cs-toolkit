from django.shortcuts import render

# Create your views here.
from lexicon.models import LexicalItem
from lexicon.serializers import LexicalItemSerializer
from rest_framework import generics


class LexicalItemList(generics.ListAPIView):
    queryset = LexicalItem.objects.all()
    serializer_class = LexicalItemSerializer
