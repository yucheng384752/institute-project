"""
URL configuration for libmanagesystem project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
#urls(name veriable) <- views(def function) <- models
from django.contrib import admin
from django.urls import path
from libmanage import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name="home"),
    path('login/',views.login, name='login'),
    path('register/', views.register, name="register"),
    path('logout/', views.logout, name = 'logout'),
    path('user_home/', views.user_home, name="user_home"),
    path('books/', views.book_list, name='book_list'),
    path('books/create/', views.book_create_view, name="book_create"),
    path('books/delete/<int:book_id>/', views.book_delete, name="book_delete"),
    path('books/borrow/<int:book_id>/', views.borrow_book, name="borrow_book"),
    path('books/return/<int:record_id>/', views.return_book, name="return_book"),
]
