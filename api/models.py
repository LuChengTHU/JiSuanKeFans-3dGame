from django.db import models
from datetime import date

USER_PRIVILEGE_ADMIN = 2
USER_PRIVILEGE_VIP = 1
USER_PRIVILEGE_COMMON = 0

class Profile(models.Model):
    # note that a primary key field `id' has been implicitly added
    username = models.CharField(max_length = 30)
    email = models.CharField(max_length = 100)
    gender = models.IntegerField()
    is_admin = models.BooleanField()
    expiration = models.DateField()
    join_date = models.DateField()

    def get_privilege(self):
        if self.is_admin:
            return USER_PRIVILEGE_ADMIN

        if date.today() >= self.expiration:
            return USER_PRIVILEGE_VIP

        return USER_PRIVILEGE_COMMON

