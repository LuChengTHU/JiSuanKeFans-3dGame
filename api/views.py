from django.shortcuts import render

# Create your views here.

from django.contrib.auth.models import User
import datetime

from rest_framework.parsers import JSONParser, FormParser
from rest_framework.authentication import BasicAuthentication
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import views, status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.views import APIView
from api.serializers import UserPostSerializer, UserBriefSerializer, TokenPostSerializer, UserGetSerializer
from django.views.decorators.csrf import csrf_exempt
from .authenticaters import CsrfExemptSessionAuthentication

class ObtainExpiringAuthToken(ObtainAuthToken):
    parser_classes = (JSONParser, FormParser)
    serializer_class = TokenPostSerializer
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)


    def post(self, request):
        # Return token for User
        print(request.data)
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
    parser_classes = (JSONParser, FormParser)
    serializer_class = UserPostSerializer
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)


    def get(self, request):
        # return User list
        return Response({'res_code': 0, 'list': {}, 'has_prev': 0, 'has_next': 1})
        serializer = UserGetSerializer(data=request.data)
        if serializer.is_valid():
            print(serializer.validated_data)
            pageNo = serializer.validated_data['pageNo'] or 1
            pageSize = serializer.validated_data['pageSize'] or 20
            userCnt = User.objects.count()
            if pageNo < 1 or pageSize < 1 or pageSize > 40 or (pageNo - 1) * pageSize > userCnt:
                Response({'res_code': 0, 'list': {}, 'has_prev': 0, 'has_next': 1})


        return Response({'res_code': 0, 'list': {}, 'has_prev': 0, 'has_next': 1})


    def post(self, request):
        # create new User
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            # new_user_info = serializer.validated_data['new_user_info']
            if User.objects.filter(email=serializer.validated_data['email']).count() > 0:
                return Response({'res_code': 2, 'user_id': 0})
            new_user_inst = User()
            new_user_inst.email = serializer.validated_data['email']
            new_user_inst.username = serializer.validated_data['username']
            new_user_inst.password = serializer.validated_data['password']
            new_user_inst.save()

            token, created = Token.objects.get_or_create(user=new_user_inst)

            return Response({'res_code': 1, 'user_id': new_user_inst.id})

        return Response({'res_code': 3, 'user_id': 0})

cus_user_view = UserView.as_view()

@csrf_exempt
def index(request):
    return render(request, 'api/index.html')