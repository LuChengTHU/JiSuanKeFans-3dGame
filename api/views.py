from django.shortcuts import render

# Create your views here.

from api.models import User
from rest_framework import views

class UserResource(views.APIView):
    pass