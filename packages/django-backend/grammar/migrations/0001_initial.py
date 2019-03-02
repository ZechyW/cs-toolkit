# Generated by Django 2.1.7 on 2019-03-02 03:34

from django.db import migrations, models
import django.db.models.deletion
import mptt.fields
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [("lexicon", "0006_auto_20190201_1434")]

    operations = [
        migrations.CreateModel(
            name="Derivation",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, primary_key=True, serialize=False
                    ),
                ),
                ("ended", models.BooleanField()),
                ("converged", models.BooleanField()),
            ],
        ),
        migrations.CreateModel(
            name="DerivationRequest",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, primary_key=True, serialize=False
                    ),
                ),
                ("lexical_array", models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name="DerivationStep",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, primary_key=True, serialize=False
                    ),
                ),
                (
                    "derivation",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="grammar.Derivation",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="SyntacticObject",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, primary_key=True, serialize=False
                    ),
                ),
                (
                    "lft",
                    models.PositiveIntegerField(db_index=True, editable=False),
                ),
                (
                    "rght",
                    models.PositiveIntegerField(db_index=True, editable=False),
                ),
                (
                    "tree_id",
                    models.PositiveIntegerField(db_index=True, editable=False),
                ),
                (
                    "level",
                    models.PositiveIntegerField(db_index=True, editable=False),
                ),
                (
                    "parent",
                    mptt.fields.TreeForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="children",
                        to="grammar.SyntacticObject",
                    ),
                ),
            ],
            options={"abstract": False},
        ),
        migrations.CreateModel(
            name="SyntacticObjectValue",
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
                ("current_language", models.CharField(max_length=50)),
                (
                    "features",
                    models.ManyToManyField(blank=True, to="lexicon.Feature"),
                ),
            ],
        ),
        migrations.AddField(
            model_name="syntacticobject",
            name="value",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                to="grammar.SyntacticObjectValue",
            ),
        ),
        migrations.AddField(
            model_name="derivationstep",
            name="root_so",
            field=mptt.fields.TreeOneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                to="grammar.SyntacticObject",
            ),
        ),
        migrations.AddField(
            model_name="derivation",
            name="derivation_request",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                to="grammar.DerivationRequest",
            ),
        ),
    ]
