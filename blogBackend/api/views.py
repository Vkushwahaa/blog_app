from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes,parser_classes
from .models import Author,Category,Post,Comment
from .serializers import AuthorSerializer,PostSerializer,CommentSerializer,CategorySerializer,PostListSerializer
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from .filters import PostFilter
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser
from .utils import get_author
#home
@api_view(['GET'])
@permission_classes([AllowAny])
def home(request):
    data = {
        "message": "Welcome to the API",
        "routes": {
            "Author Routes": {
                "Get Author": "author/",
                "Get All Authors": "authors/",
                "Create Bio": "author/bio/create/",
                "Edit Bio": "author/bio/update/",
            },
            "Post Routes": {
                "Get Post List": "post/",
                "Create Post": "post/create/",
                "Get Post": "post/<str:pk>/",
                "Update Post": "post/<str:pk>/update/",
                "Delete Post": "post/<str:pk>/delete/",
            },
            "Comment Routes": {
                "Get Comments": "post/<str:pk>/comments/",
                "Create Comment": "post/<str:pk>/comment/create/",
                "Get Comment": "post/<str:pk>/comment/<str:ck>/",
                "Update Comment": "post/<str:pk>/comment/<str:ck>/update/",
                "Delete Comment": "post/<str:pk>/comment/<str:ck>/delete/",
            },
            "Category Routes": {
                "Get Categories": "category/",
                "Create Category": "category/create/",
            },
            "Search Route": {
                "Search Posts": "search/?category=<category_name>",
            }
        }
    }
    return Response(data)



# author api view
@api_view(["GET"])
def getAuthor(request):
    author = get_author(request.user)
    serializer = AuthorSerializer(author)
    return Response(serializer.data)




@api_view(["GET"])
@permission_classes([AllowAny])
def getAuthors(request):
    author_id = request.GET.get('id')  
    author_name = request.GET.get('user', '').strip()  # Get and strip whitespace
    if author_id:  # If an 'id' is provided, filter by it
        try:
            author = Author.objects.get(id=author_id)
            serializer = AuthorSerializer(author)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Author.DoesNotExist:
            return Response({"error": "Author not found."}, status=status.HTTP_404_NOT_FOUND)
    elif author_name:
        # Perform partial and exact match search
        authors = Author.objects.filter(
            Q(user__username__iexact=author_name) |  
            Q(user__username__istartswith=author_name)  # Partial match (case-insensitive)
        )
        if authors.exists():
            serializer = AuthorSerializer(authors, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"error": "No authors found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(["GET"])
@permission_classes([AllowAny])
def getPosts(request):
    post_id = request.GET.get('id')  
    post_title = request.GET.get('title', '').strip()  # Get and strip whitespace
    
    # Assuming 'status' is the field to indicate whether the post is published
    published_status = 'published'  # Replace this with your actual value for published posts
    
    if post_id:  # If an 'id' is provided, filter by it
        try:
            post = Post.objects.get(id=post_id, status=published_status)
            serializer = PostSerializer(post)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({"error": "Post not found or not published."}, status=status.HTTP_404_NOT_FOUND)
    
    elif post_title:
        posts = Post.objects.filter(title__icontains=post_title, published=True)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

 
    return Response({"error": "No search parameters provided."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def editbio(request):
    try:
        user = request.user
        author = Author.objects.get(user=user)

        bio = request.data.get("bio")
        if bio is not None:
            author.bio = bio

        if "img" in request.FILES:
            author.img = request.FILES["img"]

        author.save()
        return Response({"message": "Profile updated successfully"})
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({"error": str(e)}, status=500)


# @api_view(["PUT"])
# def editbio(request):
#     """
#     Update the bio for the logged-in user.
#     """
#     author = get_author(request.user)
#     serializer = AuthorSerializer(instance=author, data=request.data, partial=True)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_200_OK)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# post api view
    
@api_view(["GET"])
@permission_classes([AllowAny])
def getPost(request, pk):
    # Get the post or return a 404 if not found
    post = get_object_or_404(Post, id=pk)

    # Check if the post is published
    if not post.published:
        # If the user is not authenticated and the post is not published, return a 403 Forbidden
        if not request.user.is_authenticated:
            return Response({"detail": "Post is not published and you are not authenticated."}, 
                            status=status.HTTP_403_FORBIDDEN)
    
    # If the user is authenticated or the post is published, return the post and comments
    comments = post.comment.all()
    post_serializer = PostSerializer(post)
    comment_serializer = CommentSerializer(comments, many=True)

    return Response({
        'post': post_serializer.data,
        'comments': comment_serializer.data
    })
    
@api_view(["GET"])
def getUserPost(request):
    pk = request.GET.get('id')
    if not pk:
        return Response({"post": {}, "comments": []}, status=200)

    try:
        post = Post.objects.get(id=pk)
    except Post.DoesNotExist:
        return Response({"post": {}, "comments": []}, status=200)

    # Fail-safe for unauthenticated or not owner
    if not request.user.is_authenticated or post.author.user != request.user:
        if not post.published:
            return Response({"post": {}, "comments": []}, status=200)

    comments = post.comment.all()
    post_serializer = PostSerializer(post)
    comment_serializer = CommentSerializer(comments, many=True)

    return Response({
        'post': post_serializer.data,
        'comments': comment_serializer.data
    })




@api_view(["POST"])
def createBio(request):
    author = get_author(request.user)
    serializer = AuthorSerializer(data=request.data)  
    if serializer.is_valid():
        serializer.save(author=author)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def createPost(request):
    author = get_author(request.user)
    serializer = PostSerializer(data=request.data)

    if serializer.is_valid():
        try:
            post = serializer.save(author=author)
            return Response(PostSerializer(post).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            import traceback
            traceback.print_exc()  # full traceback in console
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])  
def updatePost(request, pk):
    """Update an existing post"""
    author = get_author(request.user)
    post = get_object_or_404(Post, id=pk, author=author)  # Ensure post belongs to the author

    # Initialize the serializer with the instance and the request data
    serializer = PostSerializer(instance=post, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()  # Save the updated post instance
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
      
@api_view(["DELETE"])
def deletePost(request,pk):
    author     = get_author(request.user)
    data       = get_object_or_404(Post,id=pk,author=author)
    data.delete()
    return Response("post has been deleted hureeeeeeey")



@api_view(["GET"])
@permission_classes([IsAuthenticated])  
def getUserPostlist(request):
    user_id = request.GET.get('id')
    if not user_id:
        return Response({"detail": "User ID required"}, status=400)

    # Check if the requested user ID matches logged in user
    is_author = str(request.user.id) == str(user_id)

    if is_author:
        posts = Post.objects.filter(author__user__id=user_id)
    else:
        # If not author, only published posts
        posts = Post.objects.filter(author__user__id=user_id, published=True)

    paginator = PageNumberPagination()
    paginator.page_size = 10
    result_page = paginator.paginate_queryset(posts, request)
    serializer = PostListSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(["GET"])
@permission_classes([AllowAny])
def getPostlist(request):
    author_id = request.GET.get('author_id', None)
    queryset = Post.objects.filter(published=True)
    if author_id:
        queryset = queryset.filter(author__user__id=author_id)

    post_filter = PostFilter(request.GET, queryset=queryset)
    posts = post_filter.qs

    paginator = PageNumberPagination()
    paginator.page_size = 10
    result_page = paginator.paginate_queryset(posts, request)
    serializer = PostListSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

# comment api view
@api_view(["GET"])
@permission_classes([AllowAny])
def getComments(request,pk):
    post       = get_object_or_404(Post,id=pk)
    comments   = post.comment.filter()
    serializer = CommentSerializer(comments,many=True)
    return Response(serializer.data)


@api_view(["GET"])
def getComment(request,pk,ck):
    author                 = get_author(request.user)
    post                   = get_object_or_404(Post,id=pk)
    comment = get_object_or_404(Comment,id=ck,post=post,author=author)
    serializer = CommentSerializer(comment)
    return Response(serializer.data,status=status.HTTP_200_OK)


@api_view(["POST"])
def createComment(request,pk):
    author                 = get_author(request.user)
    post                   = get_object_or_404(Post,id=pk)
    comment_data = request.data.copy()
    comment_data['post'] = post.id
    comment_data['author'] = author.id
    serializer = CommentSerializer(data=comment_data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_200_OK)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(["PUT"])
def updateComment(request,pk,ck):
    author  = get_author(request.user)
    post    = get_object_or_404(Post,id=pk)
    comment = get_object_or_404(Comment,id=ck,post=post,author=author)

    serializer = CommentSerializer(instance=comment,data=request.data,partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_200_OK)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def deleteComment(request,pk,ck):
    author  = get_author(request.user)
    post    = get_object_or_404(Post,id=pk)
    comment = get_object_or_404(Comment,id=ck,post=post,author=author)
    comment.delete()
    return Response("commment has been deleted hureeeeeeey") 


# category views

@api_view(["GET"])
@permission_classes([AllowAny])
def getCategorys(request):
    category      = Category.objects.all().order_by("id")
    serializer    = CategorySerializer(category,many=True)
    return Response(serializer.data)  

@api_view(["POST"])
def createCategory(request):
    serializer    = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)

# search

@api_view(["GET"])
@permission_classes([AllowAny])
def searchPost(request):
    category_name = request.GET.get('category')

    if not category_name:
        # Instead of error, just return empty list
        return Response([], status=status.HTTP_200_OK)

    category = Category.objects.filter(name=category_name).first()
    if not category:
        return Response([], status=status.HTTP_200_OK)

    posts = Post.objects.filter(category=category)
    if not request.user.is_authenticated:
        posts = posts.filter(published=True)

    if not posts.exists():
        return Response([], status=status.HTTP_200_OK)

    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


