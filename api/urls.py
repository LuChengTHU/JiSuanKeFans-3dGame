from django.conf.urls import url

from .views import obtain_expiring_auth_token, user_list_view,\
    map_view, map_list_view, user_view, stage_view, solution_list_view, \
    solution_view

app_name = 'api'
urlpatterns = [
    url(r'^token/$', obtain_expiring_auth_token, name='token'),
    url(r'^user/$', user_list_view, name='user_list'),
    url(r'^user/(?P<user_id>[0-9]+)/$', user_view, name='user'),
    url(r'^map/(?P<map_id>[0-9]+)/$', map_view, name='map'),
    url(r'^stage/(?P<stage_id>[0-9]+)/$', stage_view, name='stage'),
    url(r'^map/$', map_list_view, name='map_list'),
    url(r'^solution/$', solution_list_view, name='solution_list'),
    url(r'^solution/(?P<solution_id>[0-9]+)/$', solution_view, name='solution')
]
