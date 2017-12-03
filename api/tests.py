# -*- coding:utf-8 -*-  
from django.urls import reverse
from rest_framework.test import APITestCase as TestCase
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.test import APIRequestFactory
from rest_framework.serializers import Serializer
from rest_framework.authentication import TokenAuthentication
from api.models import Map
from ac import settings
import os
import tempfile
from contextlib import contextmanager
import shutil

# Create your tests here.
factory = APIRequestFactory()
@contextmanager
def create_temporal_AI(prefix, code):
    path = tempfile.mkdtemp(dir=settings.AI_URL, prefix=prefix)
    with open(os.path.join(path, 'code.js'), 'w') as fout:
        fout.write(code)
    yield os.path.split(path)[-1]
    shutil.rmtree(path)

class BackendTestCase(TestCase):
    def setUp(self):
        print("In method ============================================> ", self._testMethodName)

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
            'id': uid,
            'latest_level': 0
            }


        credential = {'email': 'test@test.org',\
            'password': 'test'}
        response = self.fetch_token(credential)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['res_code'], 1)
        self.assertEqual(response.json()['user'], new_user_brief)

        # ------------------ re-fetch the token to test the margin ----------
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
            'id': uid,
            'latest_level': 0
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
            'id': response.json()['user_id'],
            'latest_level': 0
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

    def create_map(self, map, token):
        response = self.client.post(reverse('api:map_list'), data={
            'map': map}, HTTP_AUTHORIZATION='Token ' + token)
        return response

    def test_map(self):
        
        new_user = {
            'email' : 'test@test.org',
            'username' : 'test_user',
            'password' : 'test'
            }
        response, c_date = self.create_user(new_user)
        
        uid = response.json()['user_id']

        # ---------- creating map ------------------
        token = self.fetch_token({'email': 'test@test.org', 'password' : 'test'}).json()['token']
        
        map = {
            "init_ground_boxes": [0,0,0],
            "title": "imgod-map",
            "init_ground_colors": [0,1],
            "init_pos": [0, 1],
            "init_hand_boxes": [0, 0],
            "init_AI_infos": [{'id': 'first', 'pos': [0, 0], 'dir': 16}, {'id': 'second', 'pos': [1, 0], 'dir': 17}],
            "final_hand_boxes": [1, 1],
            "final_ground_colors": [1],
            "final_ground_boxes": [],
            "final_pos": [0, 1],
            "n_blockly": 10,
            "n_max_hand_boxes": 10,
            "instr_set": [True, True, False],
            "height": 10,
            "width": 10,
            "failed_msg": "failed!",
            "passed_msg": "passed!",
            "shared": True
            }
        print(token)
        response = self.create_map(map, token)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['res_code'], 1)
        mid = response.json()['map_id']

        response = self.client.get(reverse('api:map', kwargs={'map_id': mid}),
            HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['map']['author']['id'], uid)
        self.assertEqual(response.json()['map']['init_AI_infos'], map['init_AI_infos'])
        self.assertEqual(response.json()['map']['welcome_msg'], u'Welcome!')
        self.assertEqual(response.json()['map']['passed_msg'], 'passed!')
        self.assertEqual(response.json()['map']['failed_msg'], 'failed!')
        self.assertEqual(response.json()['map']['std_blockly_code'], None)
        print("response.json()['map']['stage']={}".format(response.json()['map']['stage']))

        response = self.client.get(reverse('api:map_list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['res_code'], 1)
        self.assertEqual(len(response.json()['list']), 1)

        # update map information
        map['init_ground_colors'] = [0, 0, 0]
        response = self.client.put(reverse('api:map', kwargs={'map_id' : mid}), data={'new_map_info': map},
            HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(response.status_code, 200)

        # delete map
        response = self.client.delete(reverse('api:map', kwargs={'map_id' : mid}),
            HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(response.status_code, 200)

        response = self.client.get(reverse('api:map_list'))
        self.assertEqual(response.status_code, 404)
    
    def test_map_stage_field(self):
        new_user = {
            'email' : 'test@test.org',
            'username' : 'test_user',
            'password' : 'test'
            }
        response, c_date = self.create_user(new_user)
        
        uid = response.json()['user_id']

        # ---------- creating map ------------------
        token = self.fetch_token({'email': 'test@test.org', 'password' : 'test'}).json()['token']
        code1 = "console.log('Naive.');"
        code2 = "console.log('Simple.');"
        with create_temporal_AI('test', code1) as name1, create_temporal_AI('test', code2) as name2:
            map = {
                "init_ground_boxes": [0,0,0],
                "title": "imgod-map",
                "init_ground_colors": [0,1],
                "init_AI_infos": [{'id': name1, 'pos': [0, 0], 'dir': 16}, {'id': name2, 'pos': [1, 0], 'dir': 17}],
                "init_pos": [0, 1],
                "init_hand_boxes": [0, 0],
                "final_hand_boxes": [1, 1],
                "final_ground_colors": [1],
                "final_ground_boxes": [],
                "final_pos": [0, 1],
                "n_blockly": 10,
                "n_max_hand_boxes": 10,
                "instr_set": [True, True, False],
                "height": 10,
                "width": 10,
                "stage": 1,
                }
            response = self.create_map(map, token)
            self.assertEqual(response.status_code, 201)
            self.assertEqual(response.json()['res_code'], 1)
            response = self.create_map(map, token)
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.json()['res_code'], 2)
            del map["stage"]
            response = self.create_map(map, token)
            self.assertEqual(response.status_code, 201)
            self.assertEqual(response.json()['res_code'], 1)
            map["height"] = 5
            response = self.create_map(map, token)
            mid = response.json()['map_id']
            self.assertEqual(response.status_code, 201)
            self.assertEqual(response.json()['res_code'], 1)
            self.assertGreater(Map.objects.filter(id=mid).count(), 0, 'Map create failed!')
        
    def test_get_stage(self):
        new_user = {
            'email' : 'test@test.org',
            'username' : 'test_user',
            'password' : 'test'
            }
        response, c_date = self.create_user(new_user)
        
        uid = response.json()['user_id']

        # ---------- creating map ------------------
        token = self.fetch_token({'email': 'test@test.org', 'password' : 'test'}).json()['token']
        code1 = "console.log('Naive.');"
        code2 = "console.log('Simple.');"
        with create_temporal_AI('test', code1) as name1, create_temporal_AI('test', code2) as name2:
            map = {
                "init_ground_boxes": [0,0,0],
                "title": "imgod-map",
                "init_ground_colors": [0,1],
                "init_AI_infos": [{'id': name1, 'pos': [0, 0], 'dir': 16}, {'id': name2, 'pos': [1, 0], 'dir': 17}],
                "init_pos": [0, 1],
                "init_hand_boxes": [0, 0],
                "final_hand_boxes": [1, 1],
                "final_ground_colors": [1],
                "final_ground_boxes": [],
                "final_pos": [0, 1],
                "n_blockly": 10,
                "n_max_hand_boxes": 10,
                "instr_set": [True, True, False],
                "height": 10,
                "width": 10,
                "stage": 1,
                }
            response = self.create_map(map, token)
            self.assertEqual(response.status_code, 201)
            self.assertEqual(response.json()['res_code'], 1)
            
            # ---------- testing for getting the first stage ------------------
            response = self.client.get(reverse('api:stage', kwargs={'stage_id': 1}))
            print(response.json()['map'])
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()['res_code'], 1)
            self.assertEqual(response.json()['map']['stage'], 1)
            self.assertEqual(response.json()['map']['init_AI_infos'][0]['id'], name1)
            self.assertEqual(response.json()['map']['init_AI_infos'][0]['code'], code1)
            self.assertEqual(response.json()['map']['init_AI_infos'][1]['id'], name2)
            self.assertEqual(response.json()['map']['init_AI_infos'][1]['code'], code2)
            
            # ---------- testing for getting nonexistent stage ------------------
            response = self.client.get(reverse('api:stage', kwargs={'stage_id': 0}))
            self.assertEqual(response.status_code, 404)
            self.assertEqual(response.json()['res_code'], 2)
            
            # TODO: Add permission tests

    def test_solution(self):
        new_user = {
            'email' : 'test@test.org',
            'username' : 'test_user',
            'password' : 'test'
        }
        response, c_date = self.create_user(new_user)
        
        uid = response.json()['user_id']

        # ---------- creating map ------------------
        token = self.fetch_token({'email': 'test@test.org', 'password' : 'test'}).json()['token']

        map = {
            "init_ground_boxes": [0,0,0],
            "title": "imgod-map",
            "init_ground_colors": [0,1],
            "init_pos": [0, 1],
            "init_hand_boxes": [0, 0],
            "init_AI_infos": [{'id': 'first', 'pos': [0, 0], 'dir': 16}, {'id': 'second', 'pos': [1, 0], 'dir': 17}],
            "final_hand_boxes": [1, 1],
            "final_ground_colors": [1],
            "final_ground_boxes": [],
            "final_pos": [0, 1],
            "n_blockly": 10,
            "n_max_hand_boxes": 10,
            "instr_set": [True, True, False],
            "height": 10,
            "width": 10,
            "failed_msg": "failed!",
            "passed_msg": "passed!",
            "shared": True
            }

        response = self.create_map(map, token)
        map_id = response.data['map_id']
        

        solution = \
            {'shared': False, 'code': 'haha', 'map': map_id, 'stars': 2}
        # test create solution
        response = self.client.post(reverse('api:solution_list'),
            data={'solution':solution},
            HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(response.data['res_code'], 1)
        self.assertEqual(response.status_code, 201)

        sol_id = response.data['sol_id']

        # test get solution
        response = self.client.get(reverse('api:solution', kwargs={'sol_id':sol_id}))
        self.assertEqual(response.status_code, 403)

        '''
        response = self.client.get(reverse('api:solution', kwargs={'sol_id':sol_id}),
            HTTP_AUTHORIZATION='Token' + token)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['res_code'], 1)
        solution_ret = response.data['solution']
        self.assertEqual(solution_ret['map']['id'], map_id)
        self.assertEqual(solution_ret['user']['id'], uid)
        self.assertEqual(solution_ret['shared'], solution['shared'])
        self.assertEqual(solution_ret['code'], solution['code'])
        self.assertEqual(solution_ret['stars'], solution['stars'])
        '''

        solution['stars'] = 3
        solution['code'] = 'afae'

        response = self.client.put(reverse('api:solution', kwargs={'sol_id':sol_id}),
            data={'solution': solution},
            HTTP_AUTHORIZATION='Token ' + token
            )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['res_code'], 1)

        # some bad margin cases

        # bad request for post
        # test create solution
        response = self.client.post(reverse('api:solution_list'),
            data={'solution':{}},
            HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(response.data['res_code'], 2)
        self.assertEqual(response.status_code, 400)


        # bad sol_id, not found
        response = self.client.put(reverse('api:solution', kwargs={'sol_id':sol_id + 1}),
            data={'solution': solution},
            HTTP_AUTHORIZATION='Token ' + token
            )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['res_code'], 2)


        # bad request
        response = self.client.put(reverse('api:solution', kwargs={'sol_id':sol_id}),
            data={'solution': {}},
            HTTP_AUTHORIZATION='Token ' + token
            )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['res_code'], 2)

        # test solution list
        response = self.client.get(reverse('api:solution_list'), data={'self': 'true'},
            HTTP_AUTHORIZATION='token ' + token)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['res_code'], 1)
        self.assertEqual(len(response.data['list']), 1)
        self.assertEqual(response.data['has_prev'], False)
        self.assertEqual(response.data['has_next'], False)

        response = self.client.get(reverse('api:solution_list'), data={'self': 'false', 'user': uid,
            'map': map_id})
        self.assertEqual(response.status_code, 404)

        solution['shared'] = True
        response = self.client.put(reverse('api:solution', kwargs={'sol_id':sol_id}),
            data={'solution': solution},
            HTTP_AUTHORIZATION='Token ' + token
            )
        
        response = self.client.get(reverse('api:solution_list'), data={'self': 'false', 'user': uid,
            'map': map_id})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['res_code'], 1)
        self.assertEqual(len(response.data['list']), 1)
        self.assertEqual(response.data['has_prev'], False)
        self.assertEqual(response.data['has_next'], False)
        
        # list self = true but not authenticated
        response = self.client.get(reverse('api:solution_list'), data={'self': 'true'})
        self.assertEqual(response.status_code, 404)
    
    def test_forget(self):
        new_user = {
            'email' : 'test@test.org',
            'username' : 'test_user',
            'password' : 'test'
        }
        response, c_date = self.create_user(new_user)
        
        uid = response.json()['user_id']

        # forget the password
        response = self.client.post(reverse('api:forget'), data={'email':'test@test.org'})
        self.assertEqual(response.data['res_code'], 1)
        self.assertEqual(response.status_code, 200)

        # password has been changed
        response = self.fetch_token({'email': 'test@test.org', 'password' : 'test'})
        self.assertEqual(response.data['res_code'], 2)
        self.assertEqual(response.status_code, 400)

        # some margin tests
        response = self.client.post(reverse('api:forget'), data={'email': 'haha@test.org'})
        self.assertEqual(response.data['res_code'], 0)
        self.assertEqual(response.status_code, 404)
        
        response = self.client.post(reverse('api:forget'), data={'mail': 'test@test.org'})
        self.assertEqual(response.data['res_code'], 0)
        self.assertEqual(response.status_code, 404)

    def test_modify(self):
        new_user = {
            'email' : 'test@test.org',
            'username' : 'test_user',
            'password' : 'test',
        }
        response, c_date = self.create_user(new_user)
        
        uid = response.json()['user_id']

        token = self.fetch_token({'email': 'test@test.org', 'password' : 'test'}).json()['token']

        # login required
        response = self.client.get(reverse('api:modify'))
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data['res_code'], 0)

        response = self.client.get(reverse('api:modify'), HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['res_code'], 1)
        self.assertEqual(response.data['gender'], 0)
        self.assertEqual(response.data['username'], new_user['username'])


        # test the post interface

        response = self.client.post(reverse('api:modify'))
        self.assertEqual(response.status_code, 403)


        # bad request
        response = self.client.post(reverse('api:modify'), data={
            'old_password': 'test'},
            HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['res_code'], 0)


        # wrong password
        response = self.client.post(reverse('api:modify'), data={
            'old_password': 'haha',
            'new_password': 'hoho',
            'username': 'good',
            'gender': 0},
            HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['res_code'], 0)


        # success
        response = self.client.post(reverse('api:modify'), data={
            'old_password': 'test',
            'new_password': 'testtest',
            'username': 'good',
            'gender': 0},
            HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['res_code'], 1)

        # old password is not good
        response = self.fetch_token({'email': 'test@test.org', 'password' : 'test'})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['res_code'], 2)

        # new password is good
        response = self.fetch_token({'email': 'test@test.org', 'password' : 'testtest'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['res_code'], 1)

    def test_margins(self):
        from .views import with_record_fetch, with_pagination
        from .models import User

        # ------------- test margins in with_record_fetch ---------
        class Dummy(APIView):
            @with_record_fetch(Serializer)
            def get(self, request):
                return User, {}

        view = Dummy.as_view()
        response = view(factory.get('/whatever'))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['res_code'], 2)
        
        # ------------- test margins in with_pagination ------------
        response = self.client.get(reverse('api:user_list'), data={'pageNo': 'gg', 'pageSize': 'NaN'})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['res_code'], 0)

        # ------------- test margins in with_pagination ------------
        credential = {'email':'yz@hh.org'}
        response = self.fetch_token(credential)
        self.assertEqual(response.json()['res_code'], 0)

        # ------------- test margins in map ------------
        response = self.client.get(reverse('api:map', kwargs={'map_id': 0}))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['res_code'], 2)


        response = self.client.put(reverse('api:map', kwargs={'map_id': 0}))
        self.assertEqual(response.status_code, 401)


        new_user = {
            'email' : 'test@test.org',
            'username' : 'test_user',
            'password' : 'test'
            }
        response, c_date = self.create_user(new_user)
        uid = response.json()['user_id']
        token = self.fetch_token({'email': 'test@test.org', 'password' : 'test'}).json()['token']
 

        response = self.client.delete(reverse('api:map', kwargs={'map_id': 0}), 
            HTTP_AUTHORIZATION='Token ' + token)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['res_code'], 2)

        # TODO: more tests
