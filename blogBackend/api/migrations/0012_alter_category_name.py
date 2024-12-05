# Generated by Django 5.1.2 on 2024-12-02 15:00

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0011_alter_author_img_alter_post_img"),
    ]

    operations = [
        migrations.AlterField(
            model_name="category",
            name="name",
            field=models.CharField(
                choices=[
                    ("History", "History"),
                    ("Electronics", "Electronics"),
                    ("Sports", "Sports"),
                    ("Fitness", "Fitness"),
                    ("Tech", "Tech"),
                    ("DIY", "DIY"),
                    ("Travel", "Travel"),
                    ("Beauty", "Beauty"),
                    ("Fashion", "Fashion"),
                    ("Movie", "Movie"),
                    ("Mathematics", "Mathematics"),
                    ("Biology", "Biology"),
                    ("Geology", "Geology"),
                    ("Science", "Science"),
                    ("Space", "Space"),
                ],
                max_length=40,
                unique=True,
            ),
        ),
    ]
