# filters.py
from django_filters import rest_framework as filters
from .models import Post,Author


class PostFilter(filters.FilterSet):
    published = filters.BooleanFilter(field_name='published')
    order_by = filters.OrderingFilter(
        fields=(
            ('updated_at', 'updated_at'),
            ('title', 'title'),
            ('created_at', 'created_at'),  # Add created_at for fallback
        ),
        method='filter_order_by',
    )

    class Meta:
        model = Post
        fields = ['published']

    def filter_order_by(self, queryset, name, value):
        print(f"Ordering by: {value}")  # Debugging print

        if value == 'updated_at':
            return queryset.order_by('-updated_at')
        elif value == 'title':
            return queryset.order_by('title')
        # Fallback order by created_at
        return queryset.order_by('-created_at')


        
class AuthorFilter(filters.FilterSet):
    id = filters.AllValuesFilter(field_name='id')

    class Meta:
        model = Author
        fields = ['id']

