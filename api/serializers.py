from api.models import User
from rest_framework import serializers


# for the brief information of users
class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'email')

# for detailed information of users
class UserDetailedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ('password_hash',)
