from rest_framework import serializers
from django.contrib.auth.models import User
from api.models import Map
import json

class ReversedJSONField(serializers.Field):
    def to_representation(self, value):
        return json.loads(value)

    def to_internal_value(self, data):
        json.dumps(data)

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

class UserFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ('password',)

class MapFullSerializer(serializers.ModelSerializer):
    '''
    init_ground_colors = ReversedJSONField(source='init_ground_colors')
    init_ground_boxes = ReversedJSONField(source='init_ground_boxes')
    init_hand_boxes = ReversedJSONField(source='init_hand_boxes')
    instr_set = ReversedJSONField(source='instr_set')
    final_ground_colors = ReversedJSONField(source='final_ground_colors')
    final_ground_boxes = ReversedJSONField(source='final_ground_boxes')
    final_hand_boxes = ReversedJSONField(source='final_hand_boxes')
    '''
    '''
    init_pos = serializers.ListField(child=serializers.IntegerField())
    final_pos = serializers.ListField(child=serializers.IntegerField())
    '''

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
        fields = ('id', 'n_max_hand_boxes', 'n_blockly', 'height', 'width',\
            'init_pos_x', 'init_pos_y', 'final_pos_x', 'final_pos_y', 'instr_set',\
            'init_ground_colors', 'init_ground_boxes', 'init_hand_boxes',\
            'final_ground_colors', 'final_ground_boxes', 'final_hand_boxes')
        depth = 1


# for view class used to create new users
class UserPostSerializer(serializers.Serializer):
    new_user_info = UserFullSerializer()
    password = serializers.CharField(max_length = 100)


class TokenPostSerializer(serializers.Serializer):
    email = serializers.CharField(max_length = 30)
    password = serializers.CharField(max_length = 100)

