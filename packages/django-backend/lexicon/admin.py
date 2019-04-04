from django.contrib import admin

from app.admin import AppModelAdmin
from .forms import FeatureForm, FeaturePropertyForm, LexicalItemForm
from .models import Feature, FeatureProperty, LexicalItem


# Register your models here.


@admin.register(LexicalItem)
class LexicalItemAdmin(AppModelAdmin):
    list_display = ["text", "language", "features_string", "description"]
    filter_horizontal = ["features"]
    form = LexicalItemForm


@admin.register(Feature)
class FeatureAdmin(AppModelAdmin):
    list_display = ["__str__", "description"]
    filter_horizontal = ["properties"]
    form = FeatureForm


@admin.register(FeatureProperty)
class FeaturePropertyAdmin(AppModelAdmin):
    list_display = ["__str__", "type", "description"]
    form = FeaturePropertyForm
