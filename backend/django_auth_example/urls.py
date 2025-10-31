"""django_auth_example URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.urls import path
from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth import views as auth_views
from users import views
from users.site_views import site_obj
urlpatterns = [
    url(r'^admin/', admin.site.urls),
    path('echartsdemo/', include(site_obj.urls)),
    path('registerapi/', views.registerapi, name='registerapi'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('edit_action/', views.edit_action, name='edit_action'),
    path('update_evaluation/', views.update_evaluation, name='update_evaluation'),
]
