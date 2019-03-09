from .models import LexicalItem
from .serializers import LexicalItemSerializer
from rest_framework import generics


class LexicalItemList(generics.ListAPIView):
    queryset = LexicalItem.objects.all()
    serializer_class = LexicalItemSerializer
