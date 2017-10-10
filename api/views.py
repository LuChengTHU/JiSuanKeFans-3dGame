from django.shortcuts import render

# Create your views here.

from django.contrib.auth.models import User
import datetime

from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import views, status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.views import APIView
from api.serializers import UserPostSerializer, UserBriefSerializer, TokenPostSerializer


class ObtainExpiringAuthToken(ObtainAuthToken):

    parser_classes = (JSONParser,)
    serializer_class = TokenPostSerializer

    def post(self, request):

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            if User.objects.filter(email=serializer.validated_data['email']).count() > 0:
                user = User.objects.get(email=serializer.validated_data['email'])
            else:
                return Response({'res_code': 3, 'token': '', 'user': UserBriefSerializer().data})

            if user.password != serializer.validated_data['password']:
                return Response({'res_code': 2, 'token': '', 'user': UserBriefSerializer().data})

            token, created = Token.objects.get_or_create(user=user)

            if not created:
                # update the created time of the token to keep it valid
                token.created = datetime.datetime.utcnow()
                token.save()

            return Response({'res_code': 1, 'token': token.key, 'user': UserBriefSerializer(user).data})

        return Response({'res_code': 0, 'token': '', 'user': UserBriefSerializer().data})

obtain_expiring_auth_token = ObtainExpiringAuthToken.as_view()


class UserView(APIView):
    serializer_class = UserPostSerializer

    def get(self, request):
        # return User list
        pass


    def post(self, request):
        # create new User
        print(request.data)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            print("HERE")
            new_user_info = serializer.validated_data['new_user_info']
            new_user_inst = User()
            new_user_inst.email = new_user_info['email']
            new_user_inst.username = new_user_info['username']
            new_user_inst.password = serializer.validated_data['password']
            new_user_inst.save()

            token, created = Token.objects.get_or_create(user=new_user_inst)

            return Response({'token': token.key})
        print("NOPE")

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

cus_user_view = UserView.as_view()