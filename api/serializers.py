from rest_framework import serializers
from django.contrib.auth.models import User
from api.models import Map, UserProfile
import json

RATE_BRIEF = 0
RATE_FULL = 1

# for the brief information of users
class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

# for detailed information of users
class UserDetailedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ('expiration', 'join_date', 'password')

# for complete information of users
class UserFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ('password',)


def get_user_profile_serializer_class(rate):
    class UserProfileSerializer(serializers.ModelSerializer):
        gender = serializers.IntegerField(min=0, max=3, source='user.gender')
        privilege = serializers.ReadOnlyField(source='get_privilege')
        is_admin = serializers.IntegerField(source='user.is_admin')
        
        if rate == RATE_FULL:
            expiration = serializers.DateField(source='user.expiration')
            join_date = serializers.DateField(source='user.join_date')

        class Meta:
            model = UserProfile
            if rate == RATE_BRIEF:
                fields = ('id', 'username', 'email', 'gender', 'privilege')
            else:
                fields = ('id', 'username', 'email', 'gender', 'is_admin', 'privilege', 'expiration', 'join_date')

    return UserProfileSerializer


class MapBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields = ('id', 'title', 'width', 'height')

class MapFullSerializer(serializers.ModelSerializer):

    JSON_FIELDS = ['init_hand_boxes', 'final_hand_boxes', 'instr_set', 'init_ground_boxes',\
        'final_ground_boxes', 'init_ground_colors', 'final_ground_colors']

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
        fields = ('id', 'title', 'n_max_hand_boxes', 'n_blockly', 'height', 'width',\
            'init_pos_x', 'init_pos_y', 'final_pos_x', 'final_pos_y', 'instr_set',\
            'init_ground_colors', 'init_ground_boxes', 'init_hand_boxes',\
            'final_ground_colors', 'final_ground_boxes', 'final_hand_boxes')
        depth = 1


# for view class used to create new users

# User: Get request
class UserGetSerializer(serializers.Serializer):
    pageNo = serializers.IntegerField(required = False)
    pageSize = serializers.IntegerField(required = False, max_value = 40)

# User: Post request
class UserPostSerializer(serializers.Serializer):
    # new_user_info = UserFullSerializer()
    username = serializers.CharField(max_length = 30)
    email = serializers.CharField(max_length = 30)
    password = serializers.CharField(max_length = 100)


class TokenPostSerializer(serializers.Serializer):
    email = serializers.CharField(max_length = 30)
    password = serializers.CharField(max_length = 100)