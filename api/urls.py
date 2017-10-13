from django.conf.urls import url

from .views import obtain_expiring_auth_token, user_list_view,\
    map_view, map_list_view, user_view

app_name = 'api'
urlpatterns = [
    url(r'^token/$', obtain_expiring_auth_token, name='token'),
    url(r'^user/$', user_list_view, name='user'),
    url(r'^user/(?P<user_id>[0-9]+)/$', user_view),
    url(r'^map/(?P<map_id>[0-9]+)/$', map_view),
    url(r'^map/$', map_list_view)
]
