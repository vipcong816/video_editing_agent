from django.db import models
from django.contrib.auth.models import AbstractUser

# python manage.py makemigrations users
# python manage.py migrate
class User(AbstractUser):
    nickname = models.CharField(max_length=50, blank=True)

    class Meta(AbstractUser.Meta):
        pass




from django.db import models
from django.conf import settings  # ← 注意这里

class EditRequest(models.Model):
    user = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    null=True,      # ✅ 允许数据库中 user_id 为 NULL
    blank=True      # ✅ 允许表单中不填
)

    username = models.CharField(max_length=150)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    evaluation = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.username} - {self.content[:20]}"

