# Generated by Django 2.1.7 on 2019-03-27 05:34

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [("grammar", "0001_initial")]

    operations = [
        migrations.CreateModel(
            name="GeneratorDescription",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, primary_key=True, serialize=False
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField()),
            ],
        )
    ]