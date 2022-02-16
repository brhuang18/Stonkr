from django.db import models
from django.db.models.signals import post_save
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.conf import settings
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
# Create your models here.

class MyAccountManager(BaseUserManager):
    def create_user(self, first_name, last_name, email, username, password, profile_pic, privacy):
    
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')

        user = self.model(
            first_name=first_name,
            last_name=last_name,
            email=self.normalize_email(email),
            username=username,
            profile_pic=profile_pic,
            privacy = privacy
        )
        
        user.set_password(password)
        user.save(using=self._db)
        acc_username = username
        acc_id = Account.objects.get(username=acc_username).id
        Account.objects.filter(id=acc_id).update(dummy_email="carlostonkr-" + str(acc_id) + "@gmail.com")
        return user

    def create_superuser(self, email, username, password, first_name = '', last_name = '', profile_pic = '', privacy = True):
        user = self.create_user(
            email=self.normalize_email(email),
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            profile_pic=profile_pic,
            privacy = privacy
        )
        user.is_org = True
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        acc_username = username
        acc_id = Account.objects.get(username=acc_username).id
        Account.objects.filter(id=acc_id).update(dummy_email="carlostonkr-" + str(acc_id) + "@gmail.com")
        return user

class Account(AbstractBaseUser):
    first_name              = models.CharField(max_length=50, blank=True, null=True)
    last_name               = models.CharField(max_length=50, blank=True, null=True)
    email                   = models.EmailField(verbose_name="email", max_length=60, unique=True)
    username                = models.CharField(max_length=30, unique=True)
    profile_pic             = models.TextField(blank=True, null=True)
    date_joined             = models.DateTimeField(verbose_name='date joined', auto_now_add=True)
    last_login              = models.DateTimeField(verbose_name='last login', auto_now=True)
    dummy_email             = models.EmailField(verbose_name="dummy email", max_length=60, blank = True, null = True, unique=True)
    reset_token             = models.CharField(max_length=50, blank=True, null=True)
    privacy                 = models.BooleanField(default=True)
    is_admin                = models.BooleanField(default=False)
    is_active               = models.BooleanField(default=True)
    is_staff                = models.BooleanField(default=False)
    is_superuser            = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    objects = MyAccountManager()

    def __str__(self):
        return self.username
    
    def has_perm(self, perm, obj=None):
        return self.is_admin

    # Does this user have permission to view this app? (ALWAYS YES FOR SIMPLICITY)
    def has_module_perms(self, app_label):
        return True

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)