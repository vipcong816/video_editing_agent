from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import Group
from .models import User


class RegisterForm(UserCreationForm):
    group = forms.ModelChoiceField(
        queryset=Group.objects.filter(name__in=['剪辑师', '用户']),
        required=True,
        label="分组",
        empty_label="请选择分组"
    )

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username", "email", "group")  # 加入 group 字段




from django import forms
from .models import EditRequest

class EditRequestForm(forms.ModelForm):
    class Meta:
        model = EditRequest
        fields = ['evaluation']
        widgets = {
            'evaluation': forms.Textarea(attrs={'rows': 2, 'class': 'form-control'})
        }
