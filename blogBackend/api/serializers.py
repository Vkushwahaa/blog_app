from rest_framework.serializers import ModelSerializer
from .models import Author, Post,Comment,Category
from rest_framework import validators
from rest_framework.serializers import ModelSerializer, HyperlinkedRelatedField
from rest_framework import serializers




class AuthorSerializer(ModelSerializer):
    user = serializers.StringRelatedField()
    class Meta:
        model  = Author
        fields = ['id','user','img', 'bio',]


        
class PostSerializer(ModelSerializer):
    # for reading purpose
    author_name   = serializers.StringRelatedField(source='author',read_only=True)
    category_name = serializers.StringRelatedField(source='category',read_only=True)
    #for writting purpose
    author        = serializers.SlugRelatedField(slug_field='user__username', queryset=Author.objects.all(), write_only=True)
    category      = serializers.SlugRelatedField(slug_field='name', queryset=Category.objects.all(), write_only=True)
    author_id = serializers.PrimaryKeyRelatedField(source='author', read_only=True)  # Linked to the 'author' field
    class Meta:
        model  = Post
        fields = ['id','author','img','author_id','author_name','category_name', 'title', 'body', 'category','updated_at','created_at','published']
        validators = [
                validators.UniqueTogetherValidator(
                queryset=Post.objects.all(),
                fields=['title', 'author'],
                message='Post with this title and author already exists.'
            )
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

    class Meta:
        model  = Post
        fields = ['id', 'title','img', 'body', 'author', 'category', 'comment', 'created_at', 'updated_at', 'published']
