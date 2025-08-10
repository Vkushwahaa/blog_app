from django.http import JsonResponse
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import RegisterSerializer


from .serializers import MyTokenObtainPairSerializer
from rest_framework.permissions import AllowAny,IsAuthenticated,IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView


# Create your views here.


class MyObtainTokenPairView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    serializer_class = MyTokenObtainPairSerializer
    
@api_view(["POST"])
@permission_classes([AllowAny])
def RegisterUser(request):
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        return Response(serializer.data, status=201)
    
    # ✅ Send proper 400 with validation errors
    return Response(serializer.errors, status=400)




    
    