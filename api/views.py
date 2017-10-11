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
from api.serializers import UserPostSerializer, UserBriefSerializer,\
   TokenPostSerializer, MapFullSerializer, MapBriefSerializer
import json

from api.models import Map

# A convenience decorator for appending res_code in response
def with_res_code(func):
    def calc(*arg_list, **arg_dict):
        response, res_code = func(*arg_list, **arg_dict)
        response.data['res_code'] = res_code
        return response

    return calc


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


class MapView(APIView):

    # get a single map
    @with_res_code
    def get(self, request, map_id, format=None):
        try:
            map = Map.objects.get(id=map_id)       
        except:
            # not found
            return Response({}, status=status.HTTP_404_NOT_FOUND), 2
        return Response({'map' : \
            MapFullSerializer.repr_inflate(MapFullSerializer(map).data)}), 1

    def put(self, request, map_id, format=None):
        # TODO: for stage 2
        pass

    @with_res_code
    def delete(self, request, map_id, format=None):
        # remove the map
        try:
            map = Map.objects.get(id=map_id)
        except:
            # the map not found
            return Response({}, status=status.HTTP_404_NOT_FOUND), 2
        # remove map from db
        map.remove()

        return Response({}), 1

map_view = MapView.as_view()

class MapListView(APIView):
    # create a new map
    @with_res_code
    def get(self, request):
        page_no = request.query_params.get('pageNo', 1)
        page_size = request.query_params.get('pageSize', 20)
        if page_no < 1 or page_size < 1 or page_size > 40:
            return Response({}, status=status.HTTP_400_BAD_REQUEST), 2
        data = Map.objects.all()
        return Response({'list' : MapBriefSerializer(data, many=True).data, \
            'has_prev': False, \
            'has_next': False}), 1

    @with_res_code
    def post(self, request):
        serializer = MapFullSerializer(data=MapFullSerializer.repr_deflate(request.data))
        if serializer.is_valid():
            map = serializer.save()
            return Response({'map_id': map.id}), 1
        return Response({}, status=status.HTTP_400_BAD_REQUEST), 2

map_list_view = MapListView.as_view()
