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
# libmanagesystem/urls.py
from django.contrib import admin
from django.urls import path, re_path, include
from libmanage import views
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
     # API 測試端點
    # path('api/test/', views.test_api, name='api_test'),
    # === API Endpoints for React Frontend ===
    path('api/login/', views.login_api, name='api_login'),
    path('api/register/', views.register_api, name='api_register'),
    path('api/logout/', views.logout_api, name='api_logout'),
    path('api/user_home/', views.user_home_api, name='api_user_home'), #  GET 請求帶 user_id 參數
    path('api/books/', views.book_list_api, name='api_book_list'),
    path('api/books/create/', views.book_create_api, name='api_book_create'),
    path('api/books/delete/<int:book_id>/', views.book_delete_api, name='api_book_delete'),
    path('api/books/borrow/<int:book_id>/', views.borrow_book_api, name='api_borrow_book'),
    path('api/books/return/<int:record_id>/', views.return_book_api, name='api_return_book'),
    path('api/user/update_profile/', views.update_profile_api, name='api_update_profile'),
    re_path(r'^(?:.*)/?$', TemplateView.as_view(template_name='index.html')),

]

