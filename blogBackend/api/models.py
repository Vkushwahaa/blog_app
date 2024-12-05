from typing import Any
from django.db import models
from django.contrib.auth import get_user_model
from django_bleach.models import BleachField
from django.conf import settings
from django.core.exceptions import ValidationError

def validate_image(value):
    if not value.name.endswith(('.jpg', '.jpeg', '.png')):
        raise ValidationError("Only image files are allowed.")
    return value

class Author(models.Model):
    user  = models.OneToOneField(get_user_model(), unique=True,on_delete=models.CASCADE)
    bio   = models.TextField(blank=True,max_length=255)    
    img   = models.ImageField(upload_to='author_images/',default='author_images/default.jpg', validators=[validate_image])
    def __str__(self):
        return self.user.username
    

    

    

class Category(models.Model):
    name = models.CharField(max_length=20, unique=True)
    def __str__(self):
        return self.name



    
class Post(models.Model):
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name="post")
    title = models.CharField(max_length=100, blank=False)
    img   = models.ImageField(upload_to='post_images/', blank=True, null=True,  validators=[validate_image])

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
        return self.body[0:50]