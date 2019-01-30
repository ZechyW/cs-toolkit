from drf_queryfields import QueryFieldsMixin
from rest_framework import serializers
from lexicon.models import LexicalItem


class LexicalItemSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = LexicalItem
        fields = ["id", "text", "language", "features"]

    features = serializers.StringRelatedField(many=True)
