from rest_framework.serializers import ModelSerializer
from .models import Author, Post,Comment,Category
from rest_framework import validators
from rest_framework.serializers import ModelSerializer, HyperlinkedRelatedField
from rest_framework import serializers
from cloudinary.utils import cloudinary_url


DEFAULT_IMG = "https://res.cloudinary.com/ddwinmcui/image/upload/v1754761518/avatar-default_juyaap.svg"


class AuthorSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    img = serializers.SerializerMethodField()

    class Meta:
        model = Author
        fields = ['id', 'user', 'img', 'bio']

    def get_img(self, obj):
        try:
            public_id = str(obj.img)  # or obj.img.public_id
            if not public_id:
                return None
            url, options = cloudinary_url(public_id, secure=True)
            return url
        except Exception as e:
            print(f"Error generating Cloudinary URL: {e}")
            return DEFAULT_IMG

# class AuthorSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Author
#         fields = '__all__'



        

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.StringRelatedField(source='author', read_only=True)
    category_name = serializers.StringRelatedField(source='category', read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(source='author', read_only=True)

    category = serializers.SlugRelatedField(
        slug_field='name',
        queryset=Category.objects.all()
    )
    img = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Post
        fields = [
            'id', 'img', 'author_id', 'author_name', 'category_name',
            'title', 'body', 'category', 'updated_at', 'created_at', 'published'
        ]



        

class CommentSerializer(ModelSerializer):
    author_name = serializers.StringRelatedField(source="author",read_only=True)
    post_title  = serializers.StringRelatedField(source="post",read_only=True)
    class Meta:
        model  = Comment
        fields = ['id','author','author_name', 'post','post_title', 'body','created_at',]
        

class CategorySerializer(ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id','name',]
       
       
class PostListSerializer(ModelSerializer):
    author   = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    comment  = CommentSerializer(many=True,read_only=True)
    img = serializers.SerializerMethodField()

    class Meta:
        model  = Post
        fields = ['id', 'title','img', 'body', 'author', 'category', 'comment', 'created_at', 'updated_at', 'published']
    def get_img(self, obj):
        try:
            public_id = str(obj.img)  # or obj.img.public_id
            if not public_id:
                return None
            url, options = cloudinary_url(public_id, secure=True)
            return url
        except Exception as e:
            print(f"Error generating Cloudinary URL: {e}")
            return None
