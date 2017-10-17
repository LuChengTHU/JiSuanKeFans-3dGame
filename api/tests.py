from django.urls import reverse
from rest_framework.test import APITestCase as TestCase
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.test import APIRequestFactory

# Create your tests here.
factory = APIRequestFactory()

class BackendTestCase(TestCase):
    def create_user(self, new_user):
        # ---------- creating new user ------------------
        c_date = now().date()

        response = self.client.post(reverse('api:user_list'), \
            data=new_user)
        return response, c_date
    
    def fetch_user(self, uid):
        # ---------- fetching user information ------------------
        # get the information of the newly created user
        response = self.client.get(reverse('api:user', kwargs={'user_id' : uid}))
        return response

    def fetch_token(self, credential):
        # ---------- fetching access token ------------------
        response = self.client.post(reverse('api:token'), \
            data=credential)
        return response

    def test_user(self):
        new_user = {
            'email' : 'test@test.org',
            'username' : 'test_user',
            'password' : 'test'
            }
        response, c_date = self.create_user(new_user)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['res_code'], 1)
        uid = response.json()['user_id'] # the id of the newly created user

        new_user_brief = {
            'email' : new_user['email'],
            'username' : new_user['username'],
            'privilege': 0,
            'gender': 0,
            'id': uid
            }


        credential = {'email': 'test@test.org',\
            'password': 'test'}
        response = self.fetch_token(credential)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['res_code'], 1)
        self.assertEqual(response.json()['user'], new_user_brief)
        token = response.json()['token'] # the token generated

        bad_credential = {'email' : 'test@test.org', \
            'password': 'terst'}
        response = self.fetch_token(bad_credential)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['res_code'], 2)

        bad_credential = {'email' : 'testa@test.org', \
            'password': 'test'}
        response = self.fetch_token(bad_credential)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['res_code'], 3)

        new_user = {
            'email' : new_user['email'],
            'username' : new_user['username'],
            'privilege': 0,
            'expiration': None,
            'gender': 0,
            'join_date': str(c_date),
            'id': uid
            }


        dup_user = {
            'email' : 'test@test.org',
            'username' : 'test_user2',
            'password' : 'ha'
            }
        response, c_date = self.create_user(dup_user)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['res_code'], 2)

        bad_user = {
            'email' : 'g@g.org',
            'username' : 'bad_user'
            }
        response, c_date = self.create_user(bad_user)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['res_code'], 3)



        response = self.fetch_user(uid)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'res_code' : 1, 'user' : new_user})


        # -------------- fetching user list ------------
        new_user2 = {
            'email' : 'test2@test.org',
            'username' : 'test_user',
            'password' : 'testtest'
            }
        response, c_date = self.create_user(new_user2)

        new_user2_brief = {
            'email' : new_user2['email'],
            'username' : new_user2['username'],
            'privilege': 0,
            'gender': 0,
            'id': response.json()['user_id']
            }

        user_list = {
            'has_next': False,
            'has_prev': False,
            'list': [new_user2_brief, new_user_brief],
            'res_code': 1
            }

        response = self.client.get(reverse('api:user_list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), user_list)

        response = self.client.get(reverse('api:user_list'), data={'pageNo': 0})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['res_code'], 0)

        response = self.client.get(reverse('api:user_list'), data={'pageNo': 2})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['res_code'], 0)
        
        for i in range(0, 20):
            user = {
                'email': str(i) + '@test.org',
                'username': str(i),
                'password': 'test' + str(i)
                }
            self.create_user(user)
        response = self.client.get(reverse('api:user_list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['has_prev'], False)
        self.assertEqual(response.json()['has_next'], True)
        self.assertEqual(len(response.json()['list']), 20)

        response = self.client.get(reverse('api:user_list'), data={'pageNo':2})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['has_prev'], True)
        self.assertEqual(response.json()['has_next'], False)
        self.assertEqual(len(response.json()['list']), 2)

        response = self.client.get(reverse('api:user_list'), data={'pageSize':30})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['has_prev'], False)
        self.assertEqual(response.json()['has_next'], False)
        self.assertEqual(len(response.json()['list']), 22)

        # ---------- creating map ------------------
        # TODO

    def test_with_pagination(self):
        # Tester for with_pagination decorator.
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
        self.create_user(new_user)

        view = Dummy.as_view()
        response = view(factory.get('/whatever'))
        self.assertEqual(response.status_code, 200)  
        self.assertEqual(response.data['res_code'], 1)
        self.assertEqual(response.data['has_next'], False)
        self.assertEqual(len(response.data['list']), 1)
        self.assertEqual(response.data['list'][0]['username'], 'test_user')
        self.assertEqual(response.data['extra_data'], 1) 
   
    def test_margins(self):
        pass

