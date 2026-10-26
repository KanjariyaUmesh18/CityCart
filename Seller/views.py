from django.shortcuts import render
from .urls import *
from .models import register as Registermodel
def dashboard(request):
    return render(request,"Seller/dashboard.html")

def add_product(request):
    return render(request,"Seller/add-product.html")

def analytics(request):
    return render(request,'Seller/analytics.html')

def earnings(request):
    return render(request,"Seller/earnings.html")

def edit_product(request):
    return render(request,"Seller/edit-product.html")

def forgot_password(request):
    return render(request,"Seller/forgot-password.html")

def inventory(request):
    return render(request,"Seller/inventory.html")

def login(request):
    return render(request,"Seller/login.html")

def notifications(request):
    return render(request,"Seller/notifications.html")

def order_details(request):
    return render(request,"Seller/order-details.html")

def orders(request):
    return render(request,"Seller/orders.html")

def products(request):
    return render(request,"Seller/products.html")

def register(request):
    if request.POST:
        errors = {}
        ownername = request.POST['ownername']
        ownernumber = request.POST['mobilenumber']
        email = request.POST['email']
        password = request.POST['password']
        if Registermodel.objects.filter(email=email).exists():
            errors['email_errors'] = "Email already Exists"
        if len(password) < 8:
            errors['pass_error'] = "Password Must Be Contain 8 charcters"

        if errors:
            return render(request,"Seller/register.html",errors)
        
        businesname = request.POST['businesname']
        businescategory = request.POST['businescategory']
        city = request.POST['city']
        locality = request.POST['locality']
        address = request.POST['address']
        shopnumber = request.POST['shopnumber']

        rid = Registermodel.objects.create(
            owner_fullname = ownername,
            owner_number = ownernumber,
            email = email,
            password = password,
            business_name = businesname,
            business_category = businescategory,
            city = city,
            locality = locality,
            business_address = address,
            shop_contact = shopnumber
        )

        print(rid)

        return render(request,"Seller/login.html")
    else:
        return render(request,"Seller/register.html")

def reset_password(request):
    return render(request,"Seller/reset-password.html")

def reviews(request):
    return render(request,"Seller/reviews.html")

def settings(request):
    return render(request,"Seller/settings.html")

def shop_profile(request):
    return render(request,"Seller/shop-profile.html")

def shop_setup(request):
    return render(request,"Seller/shop-setup.html")

def store_preview(request):
    return render(request,"Seller/store-preview.html")

def support(request):
    return render(request,"Seller/support.html")

def verification_status(request):
    return render(request,"Seller/verification-status.html")

def index(request):
    return render(request,"Seller/index.html")




