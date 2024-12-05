# Generated by Django 5.1.2 on 2024-11-30 14:13

import api.models
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0006_alter_post_body"),
    ]

    operations = [
        migrations.AddField(
            model_name="author",
            name="img",
            field=models.ImageField(
                default="author_images/default.jpg",
                upload_to="author_images/",
                validators=[api.models.validate_image],
            ),
        ),
        migrations.AddField(
            model_name="post",
            name="img",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to="post_images/",
                validators=[api.models.validate_image],
            ),
        ),
    ]