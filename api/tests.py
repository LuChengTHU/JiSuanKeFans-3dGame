from django.urls import reverse
from rest_framework.test import APITestCase as TestCase
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.test import APIRequestFactory

# Create your tests here.
factory = APIRequestFactory()

class BackendTestCase(TestCase):
    def create_and_fetch_user(self, new_user):
        # ---------- creating new user ------------------
        c_date = now().date()

        response = self.client.post(reverse('api:user_list'), \
            data=new_user)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['res_code'], 1)
        uid = response.json()['user_id'] # the id of the newly created user

        # ---------- fetching user information ------------------
        new_user = {
            'email' : 'test@test.org',
            'username' : 'test_user',
            'privilege': 0,
            'expiration': None,
            'gender': 0,
            'join_date': str(c_date),
            'id': uid
            }

        # get the information of the newly created user
        response = self.client.get(reverse('api:user', kwargs={'user_id' : uid}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'res_code' : 1, 'user' : new_user})

        return uid

    def fetch_token(self, credential):
        # ---------- fetching access token ------------------
        response = self.client.post(reverse('api:token'), \
            data=credential)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['res_code'], 1)
        return response.json()['token'] # the token generated

    def test_user(self):
        new_user = {
            'email' : 'test@test.org',
            'username' : 'test_user',
            'password' : 'test'
            }
        uid = self.create_and_fetch_user(new_user)

        credential = {'email': 'test@test.org',\
            'password': 'test'}
        token = self.fetch_token(credential)

        # -------------- fetching user list ------------
        # TODO

        # ---------- creating map ------------------
        # TODO

    def test_with_pagination(self):
        # Tester for with_pagination decorator. Extra data seems no use.
        from .views import with_pagination, RATE_BRIEF
        from .serializers import get_user_serializer_class
        from .models import User

        class Dummy(APIView):
            @with_pagination(serializer_class=get_user_serializer_class(RATE_BRIEF))
            def get(self, request):
                return User.objects.all(), {'extra_data': 1}

        new_user = {
            'email' : 'test@test.org',
            'username' : 'test_user',
            'password' : 'test'
            }
        self.create_and_fetch_user(new_user)

        view = Dummy.as_view()
        response = view(factory.get('/whatever'))
        self.assertEqual(response.status_code, 200)  
        self.assertEqual(response.data['res_code'], 1)
        self.assertEqual(response.data['has_next'], False)
        self.assertEqual(len(response.data['list']), 1)
        self.assertEqual(response.data['list'][0]['username'], 'test_user')
        self.assertEqual(response.data['extra_data'], 1)       
