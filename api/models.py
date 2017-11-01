from django.db import models
from datetime import date
from django.contrib.auth.models import AbstractUser
import django.utils.timezone

USER_PRIVILEGE_ADMIN = 2
USER_PRIVILEGE_VIP = 1
USER_PRIVILEGE_COMMON = 0

class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=100)

    # note that a primary key field `id' has been implicitly added
    gender = models.IntegerField(default=0)
    is_admin = models.BooleanField(default=False)

    expiration = models.DateField(default=None, blank=True, null=True)
    join_date = models.DateField(default=django.utils.timezone.now)

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'password']

    def get_privilege(self):
        if self.is_admin:
            return USER_PRIVILEGE_ADMIN
        if self.expiration and django.utils.timezone.now() >= self.expiration:
            return USER_PRIVILEGE_VIP

        return USER_PRIVILEGE_COMMON


class Map(models.Model):
    title = models.CharField(max_length=30)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    height = models.IntegerField()
    width = models.IntegerField()

    # ------------ restrictions -------------

    n_max_hand_boxes = models.IntegerField()
    n_blockly = models.IntegerField()
    instr_set = models.TextField()

    # ------------ initial states -------------
    init_ground_colors = models.TextField() 
    init_AI_infos = models.TextField(default="[]")
    # temporary solution: storing all arrays using json strings
    # TODO: find a more efficient solution 
    init_ground_boxes = models.TextField()

    # initial position
    init_pos_x = models.IntegerField()
    init_pos_y = models.IntegerField()

    init_hand_boxes = models.TextField()

    # ------------ final states -------------

    
    final_ground_colors = models.TextField(default=None, blank=True, null=True)
    final_ground_boxes = models.TextField(default=None, blank=True, null=True)

    # final position
    final_pos_x = models.IntegerField(default=None, blank=True, null=True)
    final_pos_y = models.IntegerField(default=None, blank=True, null=True)
    final_hand_boxes = models.TextField(default=None, blank=True, null=True)

