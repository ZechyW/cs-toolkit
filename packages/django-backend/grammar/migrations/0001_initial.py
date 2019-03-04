# Generated by Django 2.1.7 on 2019-03-04 11:14

from django.db import migrations, models
import django.db.models.deletion
import mptt.fields
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [("lexicon", "0001_initial")]

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
                ("ended", models.BooleanField(default=False)),
                ("converged", models.BooleanField(default=False)),
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
                ("raw_lexical_array", models.TextField()),
                ("creation_time", models.DateTimeField()),
                (
                    "created_by",
                    models.CharField(blank=True, max_length=255, null=True),
                ),
                (
                    "derivations",
                    models.ManyToManyField(to="grammar.Derivation"),
                ),
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
                ("processed", models.BooleanField(default=False)),
                (
                    "derivations",
                    models.ManyToManyField(to="grammar.Derivation"),
                ),
                (
                    "next_step",
                    models.OneToOneField(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="previous_step",
                        to="grammar.DerivationStep",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="LexicalArrayItem",
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
                ("order", models.IntegerField()),
                (
                    "derivation_step",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="lexical_array_items",
                        to="grammar.DerivationStep",
                    ),
                ),
                (
                    "lexical_item",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="+",
                        to="lexicon.LexicalItem",
                    ),
                ),
            ],
            options={"ordering": ["order"]},
        ),
        migrations.CreateModel(
            name="RuleDescription",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, primary_key=True, serialize=False
                    ),
                ),
                ("name", models.TextField()),
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
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="grammar.SyntacticObject",
            ),
        ),
        migrations.AddField(
            model_name="derivationstep",
            name="rules",
            field=models.ManyToManyField(
                blank=True, to="grammar.RuleDescription"
            ),
        ),
        migrations.AddField(
            model_name="derivation",
            name="first_step",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="grammar.DerivationStep",
            ),
        ),
        migrations.AlterUniqueTogether(
            name="lexicalarrayitem",
            unique_together={("derivation_step", "lexical_item", "order")},
        ),
    ]
