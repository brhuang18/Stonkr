from rest_framework import serializers
from account.models import Account

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['first_name', 'last_name', 'email', 'username', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
        }    

    def save(self):
        # account = Account(
        #     first_name=self.validated_data['first_name'],
        #     last_name=self.validated_data['last_name'],
        #     email=self.validated_data['email'],
        #     username=self.validated_data['username'],
        #     password=self.validated_data['password'],
        #     profile_pic=self.validated_data['profile_pic'],
        #     dummy_email=self.validated_data['dummy_email'],
        #     privacy=self.validated_data['privacy'],
        # )
        account = Account(
            first_name=self.validated_data['first_name'],
            last_name=self.validated_data['last_name'],
            email=self.validated_data['email'],
            username=self.validated_data['username'],
            password=self.validated_data['password'],
        )
        account.set_password(self.validated_data['password'])
        account.save()

        acc_id = Account.objects.get(username=self.validated_data['username']).id
        Account.objects.filter(id=acc_id).update(dummy_email="carlostonkr-" + str(acc_id) + "@gmail.com")
        return account

class AccountUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'profile_pic', 'privacy']
    
class AccountPasswordUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['password']

class AccountProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'profile_pic', 'privacy']
        
class AccountViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id','first_name', 'last_name', 'username', 'profile_pic', 'privacy']
        
    