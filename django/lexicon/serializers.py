from rest_framework import serializers
from lexicon.models import LexicalItem


class LexicalItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LexicalItem
        fields = ["text", "language_code", "feature_set"]

    feature_set = serializers.StringRelatedField()
