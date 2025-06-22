import json
from datetime import datetime
from dateutil.relativedelta import relativedelta

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt # 警告：生產環境中請勿直接使用！

from .models import Book, User, BorrowRecord

# 錯誤處理輔助函數
def error_response(message, status=400):
    return JsonResponse({'message': message}, status=status)

# API Views for React Frontend
@csrf_exempt
def login_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            account = data.get('username')
            password = data.get('password')
        except json.JSONDecodeError:
            return error_response('Invalid JSON', status=400)

        if not account or not password:
            return error_response('請輸入帳號與密碼', status=400)

        user = User.objects.filter(username=account).first()

        if not user or not check_password(password, user.password):
            return error_response('帳號或密碼錯誤', status=401)
        
        return JsonResponse({
            'message': f"歡迎：{user.username}",
            'user_id': user.id,
            'username': user.username
        }, status=200)
    return error_response('Only POST requests are allowed for login', status=405)

@csrf_exempt
def register_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            account = data.get('username')
            password = data.get('password')
        except json.JSONDecodeError:
            return error_response('Invalid JSON', status=400)

        if not account or not password:
            return error_response('請輸入帳號與密碼', status=400)

        if User.objects.filter(username=account).exists():
            return error_response('帳號已存在', status=409)

        try:
            new_user = User.objects.create(
                username=account,
                password=make_password(password)
            )
            return JsonResponse({'message': '註冊成功', 'user_id': new_user.id, 'username': new_user.username}, status=201)
        except Exception as e:
            return error_response(f'註冊失敗：{str(e)}', status=500)
    return error_response('Only POST requests are allowed for registration', status=405)

@csrf_exempt
def logout_api(request):
    if request.method == 'POST':
        # 在前端會清除 localStorage，這裡只是提供一個端點
        return JsonResponse({'message': '已登出'}, status=200)
    return error_response('Only POST requests are allowed for logout', status=405)

# 新增：更新用戶資料 API 視圖
@csrf_exempt
def update_profile_api(request):
    if request.method == 'POST': # 或 PUT
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            new_password = data.get('new_password')
            # 這裡可以擴展以接受更多資料，例如 email, phone 等
        except json.JSONDecodeError:
            return error_response('Invalid JSON', status=400)

        if not user_id:
            return error_response('User ID is required', status=401)
        
        if not new_password:
            return error_response('新密碼不可為空', status=400)

        try:
            user = get_object_or_404(User, id=user_id)
            
            # 更新密碼：使用 make_password 重新加密
            user.password = make_password(new_password)
            user.save()

            return JsonResponse({'message': '密碼更新成功！'}, status=200)
        except User.DoesNotExist:
            return error_response('用戶不存在', status=404)
        except Exception as e:
            return error_response(f'更新個人資料失敗：{str(e)}', status=500)
    return error_response('Only POST requests are allowed for profile update', status=405)

def user_home_api(request):
    user_id = request.GET.get('user_id')
    if not user_id:
        return error_response('User ID is required', status=401)
    
    try:
        user = get_object_or_404(User, id=user_id)
    except User.DoesNotExist:
        return error_response('User not found', status=404)
    
    borrowed_books_records = BorrowRecord.objects.filter(user=user, returned=False).select_related('book')
    # 這裡的 is_overdue 假設在模型中已被計算或可直接取用
    borrowed_books_data = [{
        'id': record.id,
        'book_title': record.book.title,
        'borrow_date': record.borrow_date.isoformat(),
        'due_date': record.due_date.isoformat(),
        'is_overdue': (timezone.now().date() > record.due_date) # 在這裡簡單計算逾期
    } for record in borrowed_books_records]

    all_records_queryset = BorrowRecord.objects.filter(user=user).order_by('-borrow_date').select_related('book')
    all_records_data = [{
        'id': record.id,
        'book_title': record.book.title,
        'borrow_date': record.borrow_date.isoformat(),
        'due_date': record.due_date.isoformat(),
        'return_date': record.return_date.isoformat() if record.return_date else None,
        'returned': record.returned,
        'is_overdue': (record.returned and record.return_date > record.due_date) or (not record.returned and timezone.now().date() > record.due_date)
    } for record in all_records_queryset]
    
    return JsonResponse({
        'username': user.username,
        'borrowed_books': borrowed_books_data,
        'all_records': all_records_data,
        'now': timezone.now().isoformat()
    }, status=200)

@csrf_exempt
def book_list_api(request):
    books = Book.objects.all().values('id', 'title', 'author', 'isbn', 'is_borrowed')
    return JsonResponse({'books': list(books)}, status=200)

@csrf_exempt
def book_create_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            title = data.get('title')
            author = data.get('author')
            isbn = data.get('isbn')
        except json.JSONDecodeError:
            return error_response('Invalid JSON', status=400)

        # 這裡可以添加管理員權限檢查，例如從認證 token 中解析用戶角色
        # 為了簡化，目前假設前端會限制只有管理員才能訪問此頁面
        # if not request.user.is_staff: # 如果使用 Django 內置用戶和認證
        #     return error_response('您沒有權限執行此操作', status=403)

        if not title or not author or not isbn:
            return error_response('請填寫所有欄位', status=400)
        
        try:
            new_book = Book.objects.create(title=title, author=author, isbn=isbn)
            return JsonResponse({'message': '書籍新增成功', 'book_id': new_book.id}, status=201)
        except Exception as e:
            return error_response(f'新增失敗：{str(e)}', status=500)
    return error_response('Only POST requests are allowed for book creation', status=405)

@csrf_exempt
def book_delete_api(request, book_id):
    if request.method == 'DELETE':
        # 這裡可以添加管理員權限檢查
        # if not request.user.is_staff:
        #     return error_response('您沒有權限執行此操作', status=403)
        try:
            book = get_object_or_404(Book, id=book_id)
            book.delete()
            return JsonResponse({'message': '書籍已成功刪除'}, status=200)
        except Exception as e:
            return error_response(f'刪除失敗：{str(e)}', status=500)
    return error_response('Only DELETE requests are allowed for book deletion', status=405)

@csrf_exempt
def borrow_book_api(request, book_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
        except json.JSONDecodeError:
            return error_response('Invalid JSON', status=400)

        if not user_id:
            return error_response('User ID is required', status=401)
        
        user = get_object_or_404(User, id=user_id)
        book = get_object_or_404(Book, id=book_id)

        if book.is_borrowed:
            return error_response('此書已被借出', status=409)
        
        if BorrowRecord.objects.filter(user=user, book=book, returned=False).exists():
            return error_response('您已借閱此書且尚未歸還', status=409)

        due_date = timezone.now() + relativedelta(months=2)
        BorrowRecord.objects.create(
            user=user, 
            book=book, 
            borrow_date=timezone.now(),
            due_date=due_date
        )
        
        book.is_borrowed = True
        book.save()
        
        return JsonResponse({
            'message': f"{book.title} 借閱成功，歸還日期：{due_date.strftime('%Y-%m-%d')}"
        }, status=200)
    return error_response('Only POST requests are allowed for borrowing', status=405)

@csrf_exempt
def return_book_api(request, record_id):
    if request.method == 'POST':
        try:
            record = get_object_or_404(BorrowRecord, id=record_id)
            if record.returned:
                return error_response('此書已歸還', status=409)

            record.returned = True
            record.return_date = timezone.now()
            record.book.is_borrowed = False
            record.book.save()
            record.save()
            
            return JsonResponse({'message': f"{record.book.title} 已成功歸還"}, status=200)
        except Exception as e:
            return error_response(f'歸還失敗：{str(e)}', status=500)
    return error_response('Only POST requests are allowed for returning', status=405)