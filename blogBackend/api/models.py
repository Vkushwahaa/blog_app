from typing import Any
from django.db import models
from django.contrib.auth import get_user_model
from django_bleach.models import BleachField
from django.conf import settings
from django.core.exceptions import ValidationError
from cloudinary.models import CloudinaryField

DEFAULT_IMG = "https://res.cloudinary.com/ddwinmcui/image/upload/v1754761518/avatar-default_juyaap.svg"

def validate_image(value):
    if not value.name.endswith(('.jpg', '.jpeg', '.png','.svg')):
        raise ValidationError("Only image files are allowed.")
    return value


class Author(models.Model):
    user  = models.OneToOneField(get_user_model(), unique=True, on_delete=models.CASCADE)
    bio   = models.TextField(blank=True, max_length=255)
    img = CloudinaryField(
    'image',
    
)

    def __str__(self):
        return self.user.username

    

    

class Category(models.Model):
    name = models.CharField(max_length=20, unique=True)
    def __str__(self):
        return self.name



    

class Post(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name="post")
    title = models.CharField(max_length=100, blank=False)
    img = CloudinaryField('image', blank=True, null=True, default=None)

    body = BleachField(
        allowed_tags=settings.BLEACH_ALLOWED_TAGS,
        allowed_attributes=settings.BLEACH_ALLOWED_ATTRIBUTES,
        allowed_styles=settings.BLEACH_ALLOWED_STYLES,
        strip_tags=settings.BLEACH_STRIP_TAGS,
        strip_comments=settings.BLEACH_STRIP_COMMENTS
    )
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="post")
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    published = models.BooleanField(default=False)

    def __str__(self):
        return self.body[0:50]

        
     


class Comment(models.Model):
    post       = models.ForeignKey(Post,on_delete=models.CASCADE,related_name="comment")
    author     = models.ForeignKey(Author,  on_delete=models.CASCADE,related_name="comment")
    body       = models.TextField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.body[:50] if self.body else ""