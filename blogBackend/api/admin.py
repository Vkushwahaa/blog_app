from django.contrib import admin
from .models import Author,Post,Category,Comment

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ('user',  'bio',)
    search_fields = ('user__username', 'bio')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'published', 'updated_at')
    search_fields = ('title', 'author__user__username', 'category__name')
    autocomplete_fields = ('author', 'category')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'created_at')
    search_fields = ('post__title', 'author__user__username')
    autocomplete_fields = ('post', 'author')
from django.contrib import admin
from .models import Category

# @admin.register(Category)
# class CategoryAdmin(admin.ModelAdmin):
#     def has_add_permission(self, request):
#         return False

#     def has_delete_permission(self, request, obj=None):
#         return False
