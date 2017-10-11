from django.conf.urls import url

from .views import obtain_expiring_auth_token, cus_user_view,\
    map_view, map_list_view

urlpatterns = [
    url(r'^token', obtain_expiring_auth_token, name='token'),
    url(r'^user', cus_user_view),
    url(r'^map/(?P<map_id>[0-9]+)', map_view),
    url(r'^map', map_list_view)
]
