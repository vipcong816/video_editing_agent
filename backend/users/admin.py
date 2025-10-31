from django.contrib import admin

from .models import User

admin.site.register(User)

admin.site.site_header = '管理后台'  # 设置header
admin.site.site_title = '管理后台'   # 设置title
admin.site.index_title = '管理后台'



from .models import EditRequest  # ← 确保这里导入了模型
@admin.register(EditRequest)
class EditRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'username', 'content_preview', 'created_at', 'evaluation')
    search_fields = ('username', 'content', 'evaluation')
    list_filter = ('created_at',)
    readonly_fields = ('created_at',)
    
    # 自定义显示内容的函数
    def content_preview(self, obj):
        return obj.content[:30] + "..." if len(obj.content) > 30 else obj.content
    content_preview.short_description = "Content Preview"
    
    
    
