# Generated by Django 2.1.7 on 2019-04-10 07:31

from django.db import migrations, models
import uuid


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
                (
                    "type",
                    models.CharField(
                        choices=[
                            ["Boolean", "Boolean"],
                            ["Text", "Text"],
                            ["Integer", "Integer"],
                        ],
                        max_length=10,
                    ),
                ),
                ("raw_value", models.CharField(max_length=100)),
                ("description", models.TextField()),
            ],
            options={"verbose_name_plural": "Feature properties"},
        ),
        migrations.CreateModel(
            name="LexicalItem",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, primary_key=True, serialize=False
                    ),
                ),
                ("text", models.CharField(max_length=100)),
                ("language", models.CharField(max_length=50)),
                ("description", models.TextField(blank=True)),
                ("features", models.ManyToManyField(blank=True, to="lexicon.Feature"),),
            ],
            options={"abstract": False},
        ),
        migrations.AlterUniqueTogether(
            name="featureproperty", unique_together={("name", "raw_value")}
        ),
        migrations.AddField(
            model_name="feature",
            name="properties",
            field=models.ManyToManyField(to="lexicon.FeatureProperty"),
        ),
    ]
