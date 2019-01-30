# Generated by Django 2.1.5 on 2019-01-29 16:16

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Feature",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("description", models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name="FeatureProperty",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("value", models.CharField(max_length=100)),
            ],
            options={"verbose_name_plural": "Feature properties"},
        ),
        migrations.CreateModel(
            name="FeatureSet",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("features", models.ManyToManyField(to="lexicon.Feature")),
            ],
        ),
        migrations.CreateModel(
            name="LexicalItem",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("text", models.CharField(max_length=100)),
                ("language_code", models.CharField(max_length=50)),
                (
                    "feature_set",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="lexicon.FeatureSet",
                    ),
                ),
            ],
            options={"abstract": False},
        ),
        migrations.AlterUniqueTogether(
            name="featureproperty", unique_together={("name", "value")}
        ),
        migrations.AddField(
            model_name="feature",
            name="properties",
            field=models.ManyToManyField(to="lexicon.FeatureProperty"),
        ),
    ]
