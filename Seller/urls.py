"""
URL configuration for CityCart project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from Seller import views

urlpatterns = [
    path('dashboard', views.dashboard, name='dashboard'),
    path('add-product', views.add_product, name='add-product'),
    path('analytics', views.analytics, name='analytics'),
    path('products', views.products, name='products'),
    path('reset-password', views.reset_password, name='reset-password'),
    path('reviews', views.reviews, name='reviews'),
    path('settings', views.settings, name='settings'),
    path('shop-profile', views.shop_profile, name='shop-profile'),
    path('shop-setup', views.shop_setup, name='shop-setup'),
    path('store-preview', views.store_preview, name='store-preview'),
    path('support', views.support, name='support'),
    path('verification-status', views.verification_status, name='verification-status'),
    path('earnings', views.earnings, name='earnings'),
    path('edit-product', views.edit_product, name='edi-product'),
    path('forgot-password', views.forgot_password, name='forgot-password'),
    path('inventory', views.inventory, name='inventory'),
    path('login', views.login, name='login'),
    path('notifications', views.notifications, name='notifications'),
    path('order-details', views.order_details, name='order-details'),
    path('orders', views.orders, name='orders'),
    path('register', views.register, name='register'),
    path('index', views.index, name='index'),
    path('logout', views.logout, name='logout'),
]
