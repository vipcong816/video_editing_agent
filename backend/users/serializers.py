from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    group = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        group_name = validated_data.pop('group', None)

        # 用自定义 User 模型创建用户
        user = User.objects.create_user(**validated_data)

        # 加入组
        if group_name:
            group, _ = Group.objects.get_or_create(name=group_name)
            user.groups.add(group)
        else:
            default_group, _ = Group.objects.get_or_create(name='用户')
            user.groups.add(default_group)

        return user
