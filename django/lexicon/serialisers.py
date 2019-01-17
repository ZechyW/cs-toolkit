from rest_framework import serializers
from lexicon.models import LexicalItem


class LexicalItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LexicalItem
        fields = "__all__"
