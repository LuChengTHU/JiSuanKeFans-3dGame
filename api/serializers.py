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

class UserFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ('password',)

# for view class used to create new users
class UserPostSerializer(serializers.Serializer):
    new_user_info = UserFullSerializer()
    password = serializers.CharField(max_length = 100)


class TokenPostSerializer(serializers.Serializer):
    email = serializers.CharField(max_length = 30)
    password = serializers.CharField(max_length = 100)

