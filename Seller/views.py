from django.shortcuts import render,redirect
from .urls import *
from .models import register as Registermodel
from .models import *

def register(request):
    if request.POST:
        errors = {}
        ownername = request.POST['ownername']
        ownernumber = request.POST['mobilenumber']
        email = request.POST['email']
        password = request.POST['password']
        businesname = request.POST['businesname']
        businescategory = request.POST['businescategory']
        city = request.POST['city']
        locality = request.POST['locality']
        address = request.POST['address']
        shopnumber = request.POST['shopnumber']

        if Registermodel.objects.filter(email=email).exists():
                    errors['email_errors'] = "Email already Exists"
        if len(password) < 8:
            errors['pass_error'] = "Password Must Be Contain 8 charcters"
        if Registermodel.objects.filter(owner_number=ownernumber).exists():
            errors['numeber_errors'] = "Your number is Already registerd"
        if len(ownernumber) != 10 or not ownernumber.isdigit():
            errors['len_numbers'] = "Enter 10 Digit Number"
        if errors:
            return render(request,"Seller/register.html",errors)

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
        return render(request,"Seller/login.html")
    else:
        return render(request,"Seller/register.html")

def login(request):
    if "log_email" in request.session:
                return render(request,"Seller/dashboard.html")
    if request.POST:
            log_email = request.POST['login_email']
            log_passwod = request.POST['login_password']        
            uid = Registermodel.objects.get(email=log_email)
            if uid.password != log_passwod:
                return render(request,"Seller/login.html")
            request.session['log_email'] = log_email 
            return redirect('dashboard')

    return render(request,"Seller/login.html")

def logout(request):
    if "log_email" in request.session:
     del request.session['log_email']
     return render(request,"Seller/login.html")
    else:
         return render(request,"Seller/login.html")

def dashboard(request):
    if 'log_email' in request.session:
         uid = Registermodel.objects.get(email=request.session['log_email'])

         context = {
              'uid' : uid
         }

         print(uid.email)
         print(uid.owner_fullname)
    return render(request,"Seller/dashboard.html",context)

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





def notifications(request):
    return render(request,"Seller/notifications.html")

def order_details(request):
    return render(request,"Seller/order-details.html")

def orders(request):
    return render(request,"Seller/orders.html")

def products(request):
    return render(request,"Seller/products.html")



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




