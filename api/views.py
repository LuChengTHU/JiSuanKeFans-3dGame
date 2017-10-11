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
    def get_response(*arg_list, **arg_dict):
        response, res_code = func(*arg_list, **arg_dict)
        response.data['res_code'] = res_code
        return response

    return get_response


def with_pagination(page_size_lim = 40, page_size_default = 20,\
    page_no_default = 1, data_entrypoint = 'list', has_prev_entrypoint = 'has_prev', \
    has_next_entrypoint = 'has_next', page_no_param_name = 'pageNo',\
    page_size_param_name = 'pageSize', serializer_class = None):

    def with_pagination_decorator(func):

        @with_res_code
        def get_response(self, request, *arg_list, **arg_dict):
            try:
                page_no = int(request.query_params.get('pageNo', page_no_default))
                page_size = int(request.query_params.get('pageSize', page_size_default))
            except:
                # not good integers
                return Response({}, status=status.HTTP_400_BAD_REQUEST), 2

            if page_no < 1 or page_size < 1 or page_size > page_size_lim:
                return Response({}, status=status.HTTP_400_BAD_REQUEST), 2

            query, extra_data = func(self, request, *arg_list, **arg_dict)

            # good, it is lazy
            query = query[(page_no - 1) * page_size : page_no * page_size + 1]
            # fetch one item more to help check whether the next page exists
            cnt = len(query)
            if cnt == 0:
                # not an existing page
                return Response({}, status=status.HTTP_404_NOT_FOUND), 2

            has_next = cnt > page_size
            has_prev = page_no > 1

            list = query[:min(page_size, cnt)]
            if serializer_class is not None:
                list = serializer_class(list, many=True).data

            return Response({data_entrypoint : list, has_prev_entrypoint : has_prev,\
                has_next_entrypoint : has_next}), 1
            
        return get_response

    return with_pagination_decorator

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
    @with_pagination(serializer_class=MapBriefSerializer)
    def get(self, request):
        return Map.objects.all(), {}

    @with_res_code
    def post(self, request):
        serializer = MapFullSerializer(data=MapFullSerializer.repr_deflate(request.data))
        if serializer.is_valid():
            map = serializer.save()
            return Response({'map_id': map.id}), 1
        return Response({}, status=status.HTTP_400_BAD_REQUEST), 2

map_list_view = MapListView.as_view()
