import datetime
import base64
import random
import string

from rest_framework.parsers import JSONParser, FormParser
from rest_framework.authentication import BasicAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly,\
    AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import views, status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.views import APIView
from django.utils.timezone import now
from django.core.mail import send_mail
from hashlib import sha512
from api.serializers import \
   TokenPostSerializer, MapFullSerializer, MapBriefSerializer, get_user_serializer_class,\
   RATE_BRIEF, RATE_FULL, RATE_CREATE, StageSerializer, get_solution_serializer_class, \
   ModifySerializer
import json
import traceback
import ac.settings as settings
from .authenticaters import CsrfExemptSessionAuthentication

from api.models import Map, User, Solution

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

def with_record_fetch(serializer_class, record_entrypoint = 'data', id_arg_name = 'id', 
    check_permission = lambda record, request : True):
    def with_record_fetch_decorator(func):
        
        @with_res_code
        def get_response(*arg_list, **arg_dict):
            record_model, extra_data = func(*arg_list, **arg_dict)
            try:
                record = record_model.objects.get(id=arg_dict[id_arg_name])
            except:
                return Response({}, status=status.HTTP_404_NOT_FOUND), 2
            if not check_permission(record, arg_list[1]):
                return Response({}, status=status.HTTP_403_FORBIDDEN), 2
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
                token.created = now()
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
            serializer.validated_data['password'] = \
                base64.b64encode(get_pwd_hash(serializer.validated_data['password']))
            new_user = serializer.save()

            return Response({'user_id': new_user.id}, status=status.HTTP_201_CREATED), 1

        if serializer.errors == {'email' : ['user with this email already exists.']}:
            return Response({'user_id': 0}, status=status.HTTP_400_BAD_REQUEST), 2

        return Response({'user_id': 0}, status=status.HTTP_400_BAD_REQUEST), 3

user_list_view = UserListView.as_view()

class UserView(APIView):
    @with_record_fetch(get_user_serializer_class(RATE_FULL), 
        record_entrypoint='user', id_arg_name='user_id')
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
            if settings.DEBUG: traceback.print_exc()
            # not found
            return Response({}, status=status.HTTP_404_NOT_FOUND), 2
        try:
            serializer = MapFullSerializer(map, \
                data = MapFullSerializer.repr_deflate(request.data['new_map_info']))
        except:
            if settings.DEBUG: traceback.print_exc()
            return Response({}, status=status.HTTP_400_BAD_REQUEST), 2

        if serializer.is_valid():
            try:
                serializer.save()
            except:
                if settings.DEBUG: traceback.print_exc()
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
        map.delete()

        return Response({}), 1

map_view = MapView.as_view()

class MapListView(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)

    # create a new map
    @with_pagination(serializer_class=MapBriefSerializer)
    def get(self, request):
        author_id = request.query_params.get('authorId', None)
        if author_id:
            try:
                author_id = int(author_id)
                return Map.objects.filter(author_id=author_id).all(), {}
            except TypeError:
                return Map.objects.all(), {}
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
            traceback.print_exc()
            return Response({}, status=status.HTTP_400_BAD_REQUEST), 2
        if serializer.is_valid():
            try:
                map = serializer.save()
            except:
                traceback.print_exc()
                return Response({}, status=status.HTTP_500_INTERNAL_SERVER_ERROR), 0

            return Response({'map_id': map.id}, status=status.HTTP_201_CREATED), 1
        print('In MapListView::post', serializer.errors)
        return Response({}, status=status.HTTP_400_BAD_REQUEST), 2

map_list_view = MapListView.as_view()

class StageView(APIView):
    @with_res_code
    def get(self, request, stage_id = None):
        try:
            map = Map.objects.get(stage=stage_id)
            # TODO: permission
        except:
            # not found
            traceback.print_exc()
            return Response({}, status=status.HTTP_404_NOT_FOUND), 2
        try:
            data = StageSerializer(map).data
        except:
            traceback.print_exc()
            return Response({}, status=status.HTTP_500_INTERNAL_SERVER_ERROR), 0
        return Response({'map' : data}), 1

stage_view = StageView.as_view()

# only show shared solutions
class SolutionListView(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)

    @with_pagination(serializer_class=get_solution_serializer_class(RATE_BRIEF))
    def get(self, request):
        user_id = int(request.query_params.get('user', 0))
        map_id = int(request.query_params.get('map', 0))

        res = Solution.objects

        if user_id != 0:
            res = res.filter(user_id=user_id)
        if map_id != 0:
            res = res.filter(map_id=map_id)

        return res.filter(shared=True).all(), {}
        
    @with_res_code
    def post(self, request):
        sol_info = request.data['solution']
        solution = Solution()
        solution.user = request.user

        serializer = get_solution_serializer_class(RATE_CREATE)(solution, data=sol_info)
        if serializer.is_valid():
            try:
                solution = serializer.save()
            except Exception as e:
                print(e)
                return Response({}, status=status.HTTP_500_INTERNAL_SERVER_ERROR), 0
            return Response({'sol_id' : solution.id}, status=status.HTTP_201_CREATED), 1
        print(serializer.errors)
        return Response({}, status=status.HTTP_400_BAD_REQUEST), 2


solution_list_view = SolutionListView.as_view()

class SolutionView(APIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)

    @with_record_fetch(get_solution_serializer_class(RATE_FULL), record_entrypoint='solution',
        id_arg_name='sol_id', check_permission=lambda record, request: 
            (record.shared or (request.auth is not None and record.user.id == request.user.id)))
    def get(self, request, sol_id=None):
        return Solution, {}
    
    @with_res_code
    def put(self, request, sol_id=None):
        # temporarily does not consider the privilege issues
        # that is, everybody can update any solution at present
        sol_info = request.data['solution']
        try:
            solution = Solution.objects.get(id=sol_id)
        except:
            return Response({}, status=status.HTTP_404_NOT_FOUND), 2
        serializer = get_solution_serializer_class(RATE_CREATE)(solution, data=sol_info)
        if serializer.is_valid():
            try:
                serializer.save()
            except:
                return Response({}, status=status.HTTP_500_INTERNAL_SERVER_ERROR), 0
            return Response({}, status=status.HTTP_200_OK), 1
        return Response({}, status=status.HTTP_400_BAD_REQUEST), 2

solution_view = SolutionView.as_view()

class ModifyView(APIView):

    parser_classes = (JSONParser, FormParser)
    authentication_classes = (CsrfExemptSessionAuthentication, TokenAuthentication,)
    permission_classes = (IsAuthenticatedOrReadOnly,)

    @with_res_code
    def get(self, request):
        if request.auth is None:
            return Response({}, status=status.HTTP_401_UNAUTHORIZED), 0
    
        user = request.user
        info = {'gender':user.gender, 'username':user.username}

        return Response(info, status=status.HTTP_200_OK), 1
    
    @with_res_code
    def post(self, request):
        # need authentication
        if request.auth is None:
            return Response({}, status=status.HTTP_401_UNAUTHORIZED), 2
    
        serializer = ModifySerializer(data=request.data)
        user = request.user
        
        if serializer.is_valid(raise_exception=True):
            user.gender = serializer.validated_data['gender']
            user.username = serializer.validated_data['username']
            if 'new_password' in serializer.validated_data:
                # reconfirm password
                try:
                    encode_pwd = base64.b64encode(get_pwd_hash(\
                        serializer.validated_data['old_password']))
                except:
                    return Response({}, status=status.HTTP_400_BAD_REQUEST), 0
                
                if user.password.encode("ascii") == encode_pwd:
                    user.password = base64.b64encode(get_pwd_hash(request.data['new_password']))
            
            user.save()

            return Response({}, status=status.HTTP_200_OK), 1

        return Response({}, status=status.HTTP_400_BAD_REQUEST), 0

modify_view = ModifyView.as_view()

class ForgetView(APIView):
    @with_res_code
    def post(self, request):
        try:
            email = request.data['email'] 
        except:
            return Response({}, status=status.HTTP_404_NOT_FOUND), 0

        try:
            user = User.objects.get(email=email)
        except:
            return Response({}, status=status.HTTP_404_NOT_FOUND), 0

        # Generate Password
        random_password = ''.join(random.sample(string.ascii_letters + string.digits, 20))
        user.password = base64.b64encode(get_pwd_hash(random_password))
        user.save()

        # Send Email
        send_mail('Password Reset', random_password, '计蒜客粉丝队 <jisuankefans@163.com>',
                 ['bill125@gmail.com'], fail_silently=False)
        
        return Response({}, status=status.HTTP_200_OK), 1
        
forget_view = ForgetView.as_view()