from django.shortcuts import render
from .urls import *

# Create your views here.

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




