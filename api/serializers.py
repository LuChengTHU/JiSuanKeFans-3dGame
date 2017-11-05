from rest_framework import serializers
from api.models import Map, User
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
        #is_admin = serializers.IntegerField(source='user_profile.is_admin')

        if rate == RATE_FULL:
            expiration = serializers.DateField()
            join_date = serializers.DateField(required=False)

        id = serializers.IntegerField(required=False)

        class Meta:
            model = User
            if rate == RATE_BRIEF:
                fields = ('id', 'username', 'email', 'gender', 'privilege')
            elif rate == RATE_FULL:
                # fields = ('id', 'username', 'email', 'gender', 'is_admin', 'privilege', 'expiration', 'join_date')
                fields = ('id', 'username', 'email', 'gender', 'privilege', 'expiration', 'join_date')
            else:
                fields = ('id', 'username', 'email', 'password')

    return UserSerializer


class MapBriefSerializer(serializers.ModelSerializer):
    author = get_user_serializer_class(RATE_BRIEF)(required=False)
    class Meta:
        model = Map
        fields = ('id', 'title', 'width', 'height', 'author')

class MapFullSerializer(serializers.ModelSerializer):
    author = get_user_serializer_class(RATE_BRIEF)(required=False)

    JSON_FIELDS = ['init_hand_boxes', 'final_hand_boxes', 'instr_set', 'init_ground_boxes',\
        'final_ground_boxes', 'init_ground_colors', 'final_ground_colors', 'init_AI_infos']

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
            'init_pos_x', 'init_pos_y', 'init_dir', 'final_pos_x', 'final_pos_y', 'instr_set',\
            'init_ground_colors', 'init_ground_boxes', 'init_hand_boxes',\
            'final_ground_colors', 'final_ground_boxes', 'final_hand_boxes', 'final_dir',\
            'init_AI_infos', 'author', 'stage')


class StageSerializer(MapFullSerializer):
    def to_representation(self, obj):
        data = super().to_representation(obj)
        data = super().repr_inflate(data)
        for ai_obj in data['init_AI_infos']:
            name = ai_obj['id']
            with open(os.path.join(settings.AI_URL, name, 'code.js')) as fin:
                ai_obj['code'] = fin.read()
        return data


class TokenPostSerializer(serializers.Serializer):
    email = serializers.CharField(max_length = 30)
    password = serializers.CharField(max_length = 100)