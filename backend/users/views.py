from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .forms import RegisterForm, EditRequestForm
from .models import EditRequest
from rest_framework.response import Response
from rest_framework.decorators import api_view
import openai
from django.contrib.auth import get_user_model
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout


from rest_framework import status
from .serializers import RegisterSerializer

@api_view(['POST'])
def registerapi(request):
    """注册接口"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': '注册成功'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 可配置的内容
USER_CONTENT = {
    "需求提交": "这里是需求提交内容"
}

@api_view(['POST'])
def login_view(request):
    """登录接口并返回不同分组内容"""
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)

    if not user:
        return Response({'error': '用户名或密码错误'}, status=400)

    login(request, user)

    groups = list(user.groups.values_list('name', flat=True))  # 获取分组列表

    if '剪辑师' in groups:
        # 修正字段
        edit_requests = EditRequest.objects.all().values(
            "id", "username", "content", "evaluation", "created_at"
        )
        data = {
            'message': '登录成功',
            'username': user.username,
            'role': 'editor',
            'edit_requests': list(edit_requests)
        }
    elif '用户' in groups:
        data = {
            'message': '登录成功',
            'username': user.username,
            'role': 'user',
            'content': USER_CONTENT
        }
    else:
        data = {
            'message': '登录成功',
            'username': user.username,
            'role': 'unknown',
            'content': {}
        }

    return Response(data)


@api_view(['POST'])
def logout_view(request):
    """退出接口"""
    logout(request)
    return Response({'message': '退出成功'})




User = get_user_model()
@api_view(['POST'])
def edit_action(request):
    """提交剪辑需求接口，只需传 user 和 content"""
    user_param = request.data.get('user')      # 必填
    content = request.data.get('content', '').strip()  # 必填

    if not user_param:
        return Response({'error': 'user 不能为空'}, status=status.HTTP_400_BAD_REQUEST)
    if not content:
        return Response({'error': 'content 不能为空'}, status=status.HTTP_400_BAD_REQUEST)

    # 尝试获取 User 对象
    user_obj = None
    username = str(user_param)  # 默认把 user 作为 username

    try:
        if isinstance(user_param, int) or str(user_param).isdigit():
            user_obj = User.objects.get(id=int(user_param))
            username = user_obj.username
        else:
            user_obj = User.objects.get(username=user_param)
            username = user_obj.username
    except User.DoesNotExist:
        user_obj = None  # 找不到用户也可以，username 用传入值

    # 创建剪辑请求
    edit_request = EditRequest.objects.create(
        user=user_obj,   # 可以为 None
        username=username,
        content=content
    )

    print(f"用户 {username} 提交了剪辑需求：{content}")

    return Response({
        'message': '剪辑需求提交成功',
        'username': username,
        'content': content,
        'user': user_param
    }, status=status.HTTP_201_CREATED)

# 可配置的内容
USER_CONTENT = {
    "需求提交": "这里是需求提交内容"
}

def index(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({"error": "未登录或无权限"}, status=403)

    is_user = user.groups.filter(name='用户').exists()
    is_editor = user.groups.filter(name='剪辑师').exists()
    # 返回 JSON 数据
    if is_editor:
        # 返回表内容
        edit_requests = EditRequest.objects.all().values("id", "title", "content", "evaluation")
        data = {
            "role": "editor",
            "edit_requests": list(edit_requests)
        }
    elif is_user:
        data = {
            "role": "user",
            "content": USER_CONTENT
        }
    else:
        return JsonResponse({"error": "无权限"}, status=403)

    return JsonResponse(data)


@api_view(['POST'])
def update_evaluation(request):
    """
    根据传入的 username 模拟登录，剪辑师更新 EditRequest 的 evaluation
    输入：
        - username: 用户名
        - id: EditRequest 的 id
        - evaluation: 新的评价内容
    输出：
        - 更新后的 EditRequest 数据
    """
    username = request.data.get('username')
    req_id = request.data.get('id')
    evaluation = request.data.get('evaluation', '').strip()

    if not username:
        return Response({"error": "username 必填"}, status=400)
    if not req_id or evaluation == '':
        return Response({"error": "id 和 evaluation 必填"}, status=400)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "用户不存在"}, status=404)

    # 判断是否剪辑师
    groups = list(user.groups.values_list('name', flat=True))
    if '剪辑师' not in groups:
        return Response({"error": "没有权限，必须是剪辑师"}, status=403)

    # 更新 EditRequest
    try:
        edit_request = EditRequest.objects.get(id=req_id)
        edit_request.evaluation = evaluation
        edit_request.save()
    except EditRequest.DoesNotExist:
        return Response({"error": "EditRequest 不存在"}, status=404)

    # 返回更新后的数据
    data = {
        "id": edit_request.id,
        "username": edit_request.username,
        "content": edit_request.content,
        "evaluation": edit_request.evaluation,
        "created_at": edit_request.created_at
    }
    return Response({"message": "更新成功", "edit_request": data})


