# Generated by Django 5.1.2 on 2024-10-12 09:43

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0003_remove_post_image_alter_author_image"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="author",
            name="image",
        ),
    ]