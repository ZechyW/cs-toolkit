from rest_framework import serializers
from lexicon.models import LexicalItem


class LexicalItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LexicalItem
        fields = ["id", "text", "language_code", "features"]

    features = serializers.StringRelatedField(many=True)
