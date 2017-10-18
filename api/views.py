import datetime
import base64

from rest_framework.parsers import JSONParser, FormParser
from rest_framework.authentication import BasicAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import views, status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.views import APIView
from hashlib import sha512
from api.serializers import \
   TokenPostSerializer, MapFullSerializer, MapBriefSerializer, get_user_serializer_class,\
   RATE_BRIEF, RATE_FULL, RATE_CREATE
import json

from .authenticaters import CsrfExemptSessionAuthentication

from api.models import Map, User

def get_pwd_hash(pwd):
    m = sha512()
    m.update(pwd.encode('utf-8'))
    return m.digest()

# A convenience decorator for appending res_code in response
def with_res_code(func):
    def get_response(*arg_list, **arg_dict):
        response, res_code = func(*arg_list, **arg_dict)
        response.data['res_code'] = res_code
        return response

    return get_response

def with_record_fetch(serializer_class, record_entrypoint = 'data'):
    def with_record_fetch_decorator(func):
        
        @with_res_code
        def get_response(*arg_list, **arg_dict):
            record_model, extra_data = func(*arg_list, **arg_dict)
            try:
                record = record_model.objects.get(id=arg_dict['user_id'])
            except:
                return Response({}, status=status.HTTP_404_NOT_FOUND), 2
            extra_data[record_entrypoint] = serializer_class(record).data
            return Response(extra_data), 1
        return get_response

    return with_record_fetch_decorator


# this function returns a decorator for paginations, with some of the configuration specified
def with_pagination(page_size_lim = 40, page_size_default = 20,\
    page_no_default = 1, data_entrypoint = 'list', has_prev_entrypoint = 'has_prev', \
    has_next_entrypoint = 'has_next', page_no_param_name = 'pageNo',\
    page_size_param_name = 'pageSize', serializer_class = None):

    # a decorator for paginations
    def with_pagination_decorator(func):

        @with_res_code
        def get_response(self, request, *arg_list, **arg_dict):
            try:
                page_no = int(request.query_params.get(page_no_param_name, page_no_default))
                page_size = int(request.query_params.get(page_size_param_name, page_size_default))
            except:
                # not good integers
                return Response({}, status=status.HTTP_400_BAD_REQUEST), 0

            if page_no < 1 or page_size < 1 or page_size > page_size_lim:
                return Response({}, status=status.HTTP_400_BAD_REQUEST), 0

            query, extra_data = func(self, request, *arg_list, **arg_dict)

            # good, it is lazy
            query = query[(page_no - 1) * page_size : page_no * page_size + 1]
            # fetch one item more to help check whether the next page exists
            cnt = len(query)
            if cnt == 0:
                # not an existing page
                return Response({}, status=status.HTTP_404_NOT_FOUND), 0

            has_next = cnt > page_size
            has_prev = page_no > 1

            list = query[:min(page_size, cnt)]
            if serializer_class is not None:
                list = serializer_class(list, many=True).data

            extra_data[data_entrypoint] = list
            extra_data[has_prev_entrypoint] = has_prev
            extra_data[has_next_entrypoint] = has_next
            return Response(extra_data), 1
            
        return get_response

    return with_pagination_decorator

class ObtainExpiringAuthToken(ObtainAuthToken):
    parser_classes = (JSONParser, FormParser)
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)


    @with_res_code
    def post(self, request):
        # Return token for User
        user_serializer_class = get_user_serializer_class(RATE_BRIEF)

        print(request.data)
        serializer = TokenPostSerializer(data=request.data)
        if serializer.is_valid():
            if User.objects.filter(email=serializer.validated_data['email']).count() > 0:
                user = User.objects.get(email=serializer.validated_data['email'])
            else:
                return Response({'token': '', \
                    'user': user_serializer_class().data},\
                    status=status.HTTP_400_BAD_REQUEST), 3

            if user.password.encode('ascii') != base64.b64encode(get_pwd_hash(serializer.validated_data['password'])):
                return Response({'token': '', \
                    'user': user_serializer_class().data}, \
                    status=status.HTTP_400_BAD_REQUEST), 2

            token, created = Token.objects.get_or_create(user=user)

            if not created:
                # update the created time of the token to keep it valid
                token.created = datetime.datetime.utcnow()
                token.save()

            return Response({'token': token.key, \
                'user': user_serializer_class(user).data}), 1

        return Response({'res_code': 0, 'token': '', 'user': user_serializer_class().data}), 0

obtain_expiring_auth_token = ObtainExpiringAuthToken.as_view()


class UserListView(APIView):
    parser_classes = (JSONParser, FormParser)
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)


    @with_pagination(serializer_class=get_user_serializer_class(RATE_BRIEF))
    def get(self, request):
        # return User list
        return User.objects.order_by('-id'), {}

    @with_res_code
    def post(self, request):
        # create new User
        
        serializer = get_user_serializer_class(RATE_CREATE)(data=request.data)
        if serializer.is_valid():
            if User.objects.filter(email=serializer.validated_data['email']).count() > 0:
                return Response({'user_id': 0}, status=status.HTTP_400_BAD_REQUEST), 2
            serializer.validated_data['password'] = \
                base64.b64encode(get_pwd_hash(serializer.validated_data['password']))
            new_user = serializer.save()

            return Response({'user_id': new_user.id}, status=status.HTTP_201_CREATED), 1

        # TODO: check why this does not work
        if serializer.errors == {'email' : ['user with this email already exists.']}:
            return Response({'user_id': 0}, status=status.HTTP_400_BAD_REQUEST), 2

        return Response({'user_id': 0}, status=status.HTTP_400_BAD_REQUEST), 3

user_list_view = UserListView.as_view()

class UserView(APIView):
    @with_record_fetch(get_user_serializer_class(RATE_FULL), record_entrypoint='user')
    def get(self, request, user_id=None):
        return User, {}

user_view = UserView.as_view()

class MapView(APIView):

    # get a single map
    @with_res_code
    def get(self, request, map_id = None):
        try:
            map = Map.objects.get(id=map_id)       
        except:
            # not found
            return Response({}, status=status.HTTP_404_NOT_FOUND), 2
        return Response({'map' : \
            MapFullSerializer.repr_inflate(MapFullSerializer(map).data)}), 1

    @with_res_code
    def put(self, request, map_id):
        # modify the map
        try:
            map = Map.objects.get(id=map_id)
        except:
            # not found
            return Response({}, status=status.HTTP_404_NOT_FOUND), 2
        try:
            serializer = MapFullSerializer(map, \
                data = MapFullSerializer.repr_deflate(request.data['new_map_info']))
        except:
            return Response({}, status=status.HTTP_400_BAD_REQUEST), 2

        if serializer.is_valid():
            try:
                serializer.save()
            except:
                return Response({}, status=status.HTTP_500_INTERNAL_SERVER_ERROR), 0
            return Response({}), 1
        return Response({}, status=status.HTTP_400_BAD_REQUEST), 2

    @with_res_code
    def delete(self, request, map_id):
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
    authentication_classes = (TokenAuthentication,)

    # create a new map
    @with_pagination(serializer_class=MapBriefSerializer)
    def get(self, request):
        return Map.objects.all(), {}

    @with_res_code
    def post(self, request):
        # authentication required
        if request.auth is None:
            return Response({}, status=status.HTTP_401_UNAUTHORIZED), 2

        map = Map()
        map.author = request.user
        try:
            serializer = MapFullSerializer(map, data=MapFullSerializer.repr_deflate(request.data['map']))
        except Exception as e:
            print(e)
            return Response({}, status=status.HTTP_400_BAD_REQUEST), 2
        if serializer.is_valid():
            try:
                map = serializer.save()
            except:
                return Response({}, status=status.HTTP_500_INTERNAL_SERVER_ERROR), 0

            return Response({'map_id': map.id}, status=status.HTTP_201_CREATED), 1
        print(serializer.errors)
        return Response({}, status=status.HTTP_400_BAD_REQUEST), 2

map_list_view = MapListView.as_view()
