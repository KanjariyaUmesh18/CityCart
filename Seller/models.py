from django.db import models

# Create your models here.

class register(models.Model):
    owner_fullname = models.CharField(max_length=30)
    owner_number = models.CharField(max_length=10,unique=True)
    email = models.EmailField(unique=True,max_length=30)
    password = models.CharField(max_length=12)


    business_name = models.CharField(max_length=100)
    business_category = models.CharField(max_length=40)
    city = models.CharField(max_length=40)
    locality = models.CharField(max_length=40,blank=True,null=True)
    business_address = models.TextField()
    shop_contact = models.CharField(max_length=10,blank=True,null=True)

    def __str__(self):
        return f"{self.owner_fullname} + {self.business_name}"

