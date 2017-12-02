from rest_framework import serializers
from api.models import Map, User, Solution
import json
import os
import ac.settings as settings

RATE_BRIEF = 0
RATE_FULL = 1
RATE_CREATE = 2
           

def get_user_serializer_class(rate):
    class UserSerializer(serializers.ModelSerializer):
        if rate == RATE_BRIEF or rate == RATE_FULL:
            privilege = serializers.ReadOnlyField(source='get_privilege')

        if rate == RATE_FULL:
            expiration = serializers.DateField()
            join_date = serializers.DateField(required=False)

        id = serializers.IntegerField(required=False)

        class Meta:
            model = User
            if rate == RATE_BRIEF:
                fields = ('id', 'username', 'email', 'gender', 'privilege', 'latest_level')
            elif rate == RATE_FULL:
                fields = ('id', 'username', 'email', 'gender', 'privilege', 'expiration', 'join_date',\
                    'latest_level')
            else:
                fields = ('id', 'username', 'email', 'password')

    return UserSerializer

class ModifySerializer(serializers.Serializer):
    old_password = serializers.CharField(max_length=100)
    new_password = serializers.CharField(max_length=100)
    username = serializers.CharField(max_length=50)
    gender = serializers.IntegerField()

class MapBriefSerializer(serializers.ModelSerializer):
    author = get_user_serializer_class(RATE_BRIEF)(required=False)
    high_stars = serializers.IntegerField(required=False, default=0)
    class Meta:
        model = Map
        fields = ('id', 'title', 'width', 'height', 'author', 'shared', 'high_stars')

class MapFullSerializer(serializers.ModelSerializer):
    author = get_user_serializer_class(RATE_BRIEF)(required=False)

    JSON_FIELDS = ['instr_set', 'init_AI_infos']

    @staticmethod
    def repr_inflate(odata):
        data = odata.copy()
        for field in MapFullSerializer.JSON_FIELDS:
            data[field] = json.loads(data[field])

        data['init_pos'] = [data['init_pos_x'], data['init_pos_y']]
        data['final_pos'] = [data['final_pos_x'], data['final_pos_y']]

        del data['init_pos_x']
        del data['init_pos_y']
        del data['final_pos_x']
        del data['final_pos_y']

        return data

    @staticmethod
    def repr_deflate(odata):
        data = odata.copy()
        for field in MapFullSerializer.JSON_FIELDS:
            data[field] = json.dumps(data[field])

        data['init_pos_x'] = data['init_pos'][0]
        data['init_pos_y'] = data['init_pos'][1]

        data['final_pos_x'] = data['final_pos'][0]
        data['final_pos_y'] = data['final_pos'][1]

        del data['final_pos']
        del data['init_pos']

        return data

    class Meta:
        model = Map
        fields = '__all__'


class StageSerializer(MapFullSerializer):
    def to_representation(self, obj):
        data = super().to_representation(obj)
        data = super().repr_inflate(data)
        for ai_obj in data['init_AI_infos']:
            name = ai_obj['id']
            if os.path.exists(os.path.join(settings.AI_URL, name, 'code.js')):
                with open(os.path.join(settings.AI_URL, name, 'code.js')) as fin:
                    ai_obj['code'] = fin.read()
        return data


class TokenPostSerializer(serializers.Serializer):
    email = serializers.CharField(max_length = 30)
    password = serializers.CharField(max_length = 100)

def get_solution_serializer_class(rate):
    class SolutionSerializer(serializers.ModelSerializer):
        if rate in [RATE_FULL, RATE_BRIEF]:
            user = get_user_serializer_class(RATE_BRIEF)(required=False)
            map = MapBriefSerializer(required=False)
        else:
            user = serializers.PrimaryKeyRelatedField(many=False, read_only=False, 
                queryset=User.objects.all(), required=False)
            map = serializers.PrimaryKeyRelatedField(many=False, read_only=False,
                queryset=Map.objects.all())
        stars = serializers.IntegerField(required=False)
        
        class Meta:
            model = Solution
            if rate == RATE_BRIEF:
                fields = ('id', 'user', 'map', 'shared', 'stars')
            elif rate == RATE_FULL:
                fields = ('id', 'user', 'map', 'code', 'shared', 'stars')
            else:
                fields = ('user', 'map', 'code', 'shared', 'stars')
        
    return SolutionSerializer
 
