"""ac URL Configuration

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
from django.conf.urls import url
from django.contrib import admin
from django.conf.urls import url, include
from rest_framework import routers
from api import views



router = routers.DefaultRouter()

urlpatterns = [
    url(r'^token', views.obtain_expiring_auth_token, name='token'),
    url(r'^user', views.cus_user_view),
    url(r'^$', views.index, name='index'),
    url(r'^admin/', admin.site.urls, name='admin'),
    url(r'^map/(?P<map_id>[0-9]+)', views.map_view),
    url(r'^map', views.map_list_view)
]
