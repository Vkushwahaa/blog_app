# Generated by Django 5.1.2 on 2024-11-30 15:21

import api.models
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0010_alter_author_img_alter_post_img"),
    ]

    operations = [
        migrations.AlterField(
            model_name="author",
            name="img",
            field=models.ImageField(
                default="author_images/default.jpg",
                upload_to="author_images/",
                validators=[api.models.validate_image],
            ),
        ),
        migrations.AlterField(
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