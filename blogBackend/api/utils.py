from .models import Author

def get_author(user):
    author, created = Author.objects.get_or_create(user=user)
    if created:
        print(f"Author created for user: {user.username}")
    return author
