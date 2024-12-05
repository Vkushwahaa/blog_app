from django.urls import path
from . import views

urlpatterns = [
    
    # Author paths
    path('author/', views.getAuthor, name="get_author"),
    path('authors/', views.getAuthors, name="create_bio"),
    path("author/edit/", views.editbio, name="edit_bio"),

    
    # Post paths
    path('userpost/', views.getUserPostlist, name="get_Userpostlist"),
    path('posts/', views.getPosts, name="get_postlist"),

    path('post/', views.getPostlist, name="get_postlist"),
    path('post/create/', views.createPost, name="create_post"),
    path('post/<str:pk>/', views.getPost, name="get_post"),
    path('post/<str:pk>/update/', views.updatePost, name="update_post"),
    path('post/<str:pk>/delete/', views.deletePost, name="delete_post"),

    # Comment paths
    path('post/<str:pk>/comments/', views.getComments, name="get_comments"),
    path('post/<str:pk>/comment/create/', views.createComment, name="create_comment"),
    path('post/<str:pk>/comment/<str:ck>/', views.getComment, name="get_comment"),
    path('post/<str:pk>/comment/<str:ck>/update/', views.updateComment, name="update_comment"),
    path('post/<str:pk>/comment/<str:ck>/delete/', views.deleteComment, name="delete_comment"),
    
    # Category paths
    path('category/', views.getCategorys, name="get_category"),
    path('category/create/', views.createCategory, name="get_category"),

    # search paths
    path('search/', views.searchPost, name="search-post"),

]
