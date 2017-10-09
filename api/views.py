from django.shortcuts import render

# Create your views here.

from api.models import User
from rest_framework import views
from api.serializers import *

class User(views.APIView):
    pass