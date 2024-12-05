from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from .models import Author,Category,Post,Comment
from .serializers import AuthorSerializer,PostSerializer,CommentSerializer,CategorySerializer,PostListSerializer
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from .filters import PostFilter
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser
from .utils import get_author
#home
@api_view(['GET'])
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
        # Perform partial and exact match search on post titles, filtering by published posts
        posts = Post.objects.filter(
            Q(title__icontains=post_title),  # Partial match (case-insensitive)
            Q(published=True)  # Only fetch published posts
        )
        if posts.exists():
            serializer = PostSerializer(posts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"error": "No published posts found."}, status=status.HTTP_404_NOT_FOUND)

    return Response({"error": "No search parameters provided."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def editbio(request):
    """
    Update the bio and/or image for the logged-in user.
    """
    author = get_author(request.user)
    
    # Use MultiPartParser to handle the image upload
    parser_classes = [MultiPartParser, FormParser]
    
    # Get data and files separately
    data = request.data
    files = request.FILES

    # Initialize the serializer to update the author instance
    serializer = AuthorSerializer(instance=author, data=data, partial=True)

    if serializer.is_valid():
        # If the request contains a new image, update the profile image
        if 'img' in files:
            author.img = files['img']
        
        # Save the updated author instance
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
def getUserPost(request, pk):
    # Get the post or return a 404 if not found
    post = get_object_or_404(Post, id=pk)

    # Check if the user is authenticated and if the user is the author
    if request.user.is_authenticated:
        if post.author != request.user:
            return Response({"detail": "You do not have permission to view this post."}, 
                            status=status.HTTP_403_FORBIDDEN)
    else:
        # Check if the post is published if the user is not authenticated
        if not post.published:
            return Response({"detail": "Post is not published and you are not authenticated."}, 
                            status=status.HTTP_403_FORBIDDEN)

    # If the user is the author or the post is published, return the post and comments
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
def createPost(request):
    """
    Create a new post
    """
    author = get_author(request.user)  # Retrieve the author instance
    serializer = PostSerializer(data=request.data)  # Pass only request.data to the serializer

    if serializer.is_valid():
        serializer.save(author=author)  # Save the post with the associated author
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
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
    # Get the logged-in user's associated Author instance
    user_id = request.GET.get('id')
    author = Author.objects.get(id=user_id)

    # Filter posts authored by the logged-in user
    posts = Post.objects.filter(author=author)

    # Paginate the filtered results
    paginator = PageNumberPagination()
    paginator.page_size = 10
    result_page = paginator.paginate_queryset(posts, request)

    # Serialize and return the paginated data
    serializer = PostListSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(["GET"])
def getPostlist(request):
    post_filter = PostFilter(request.GET, queryset=Post.objects.all())
    posts = post_filter.qs
    paginator = PageNumberPagination()
    paginator.page_size = 10
    result_page = paginator.paginate_queryset(posts, request)
    serializer = PostListSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

# comment api view
@api_view(["GET"])
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
def searchPost(request):
    # Get category name from query params
    category_name = request.GET.get('category')
    
    # Ensure category exists or return an error if it doesn't
    category = get_object_or_404(Category, name=category_name)

    # Filter posts by category
    posts = Post.objects.filter(category=category)
    
    # If the user is not authenticated, filter to show only published posts
    if not request.user.is_authenticated:
        posts = posts.filter(published=True)

    # Serialize posts and return the response
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)
