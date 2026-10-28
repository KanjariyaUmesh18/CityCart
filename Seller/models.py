from django.db import models

# Create your models here.

class register(models.Model):
    owner_fullname = models.CharField(max_length=30)
    owner_number = models.CharField(max_length=10,unique=True)
    email = models.EmailField(unique=True,max_length=30)
    password = models.CharField(max_length=12)
    confirm_password = models.CharField(max_length=12,null=True)
    business_name = models.CharField(max_length=100)
    business_category = models.CharField(max_length=40)
    city = models.CharField(max_length=40)
    locality = models.CharField(max_length=40,blank=True,null=True)
    business_address = models.TextField()
    shop_contact = models.CharField(max_length=10,blank=True,null=True)

    def __str__(self):
        return f"{self.owner_fullname} + {self.business_name}"

# class Addproduct(models.Model):
#     user_id = models.ForeignKey(register,on_delete=models.CASCADE,blank=True,null=True)
#     product_name = models.CharField(max_length=40)
#     product_category = models.CharField(max_length=40)
#     brand = models.CharField(max_length=40,blank=True,null=True)
#     description = models.TextField()
#     product_image = models.ImageField(upload_to="images/")
#     selling_price = models.IntegerField()
#     comparison_price = models.IntegerField()
#     stock_qty = models.IntegerField()

