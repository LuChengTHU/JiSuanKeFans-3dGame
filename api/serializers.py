from rest_framework import serializers
from django.contrib.auth.models import User


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
