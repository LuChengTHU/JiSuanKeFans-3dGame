from django.urls import reverse
from rest_framework.test import APITestCase as TestCase
from django.utils.timezone import now

# Create your tests here.

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
