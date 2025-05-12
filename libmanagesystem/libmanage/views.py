from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from datetime import datetime
from .models import Book, User, BorrowRecord
from dateutil.relativedelta import relativedelta
from django.contrib.auth import authenticate, login as auth_login, logout
from django.contrib import messages
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone

# Create your views here. (template)
def home(request):
    return render(request, 'home.html', {
        'title':'圖書館首頁',
    })

#處理登入與註冊
from django.contrib.auth.hashers import make_password, check_password

def login(request):
    if request.method == 'POST':
        account = request.POST.get('account')
        password = request.POST.get('password')
        action = request.POST.get('action')

        if not account or not password:
            messages.error(request, '請輸入帳號與密碼')
            return redirect('login')

        user = User.objects.filter(username=account).first()

        if action == 'register':
            if user:
                messages.error(request, '帳號已存在，請直接登入')
                return redirect('login')
            try:
                new_user = User.objects.create(
                    username=account,
                    password=make_password(password)
                )
                request.session['user_id'] = new_user.id
                messages.success(request, '註冊成功')
                return redirect('user_home')
            except Exception as e:
                messages.error(request, f'註冊失敗：{str(e)}')
                return redirect('login')

        elif action == 'login':
            if not user or not check_password(password, user.password):
                messages.error(request, '帳號或密碼錯誤')
                return redirect('login')
            request.session['user_id'] = user.id
            messages.success(request, f"歡迎：{user.username}")
            if user.username == 'admin':
                return redirect('book_create')
            return redirect('user_home')

    return render(request, 'login.html')

def register(request):
    if request.method == 'POST':
        account = request.POST.get('account')
        password = request.POST.get('password')

        if User.objects.filter(username=account).exists():
            messages.error(request, '帳號已存在')
            return redirect('register')

        new_user = User.objects.create(
            username=account,
            password=make_password(password)
        )
        request.session['user_id'] = new_user.id
        messages.success(request, '註冊成功')
        return redirect('user_home')

    return render(request, 'register.html', {'now': datetime.now()})


def logout(request):
    request.session.flush()
    return redirect('home')

#使用者主頁
def user_home(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('login')
    
    user = User.objects.get(id = user_id)
    borrowed_books = BorrowRecord.objects.filter(user = user, returned = False)
    all_records = BorrowRecord.objects.filter(user = user).order_by('-borrow_date')
    
    return render(request, 'user_home.html', {
        'user': user, 
        'borrowed_books': borrowed_books,
        'all_records': all_records,
        'now': datetime.now()
    })
            
def book_create_view(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        author = request.POST.get('author')
        isbn = request.POST.get('isbn')
        #新增書籍
        Book.objects.create(
            title = title,
            author = author,
            isbn = isbn,
        )
        return redirect('book_list')
    
    return render(request, 'book_create.html', {
        'title': '書籍資訊管理',
        'now': datetime.now()
    })
    
def book_delete(request, book_id):
    book = get_object_or_404(book, id = book_id)
    book.delete()
    return redirect('book_list') #回到書籍清單

def book_list(request):
    books = Book.objects.all()
    user_id = request.session.get('user_id')

    user = None
    borrows = None
    
    if user_id:
        user = User.objects.get(id=user_id)
        borrows = BorrowRecord.objects.filter(user=user, returned=False)

    return render(request, 'get_book_list.html', {
        'title': '圖書館書籍清單',
        'books': books,
        'user': user,
        'borrows': borrows,
        'now': timezone.now().date()
    })

    
def borrow_book(request, book_id):
    
    user_id = request.session.get('user_id')
    
    if not user_id:  #未登入
        return redirect('login')  #跳轉登入頁面
    
    user = User.objects.get(id = user_id)
    book = get_object_or_404(Book, id = book_id)
    
    if book.is_borrowed:
        messages.error(request, '此書已被借出')
        return redirect('book_list')
    
    due_date = datetime.now() + relativedelta(months=2)
    BorrowRecord.objects.create(user = user, book = book, due_date = due_date)
    book.is_borrowed = True
    book.save()
    
    messages.success(request, f"{book.title} 借閱成功，歸還日期：{due_date}")
    
    return redirect('book_list')
    
def return_book(request, record_id):
    record = get_object_or_404(BorrowRecord, id=record_id)
    record.returned = True
    record.book.is_borrowed = False
    record.book.save()
    record.save()
    messages.success(request, f"{record.book.title} 已成功歸還")
    return redirect('user_home')