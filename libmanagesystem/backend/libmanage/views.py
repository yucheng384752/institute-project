# libmanage/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from datetime import datetime
from .models import Book, User, BorrowRecord
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import logging

# 設定日誌記錄
logger = logging.getLogger(__name__)

# 錯誤處理輔助函數
def error_response(message, status=400):
    logger.error(f"API Error: {message}")
    return JsonResponse({'error': True, 'message': message}, status=status)

def success_response(message, data=None, status=200):
    response_data = {'error': False, 'message': message}
    if data:
        response_data.update(data)
    return JsonResponse(response_data, status=status)

# 測試端點
@csrf_exempt
def test_api(request):
    return JsonResponse({
        'message': 'API is working!',
        'method': request.method,
        'path': request.path
    })

# API Views for React Frontend
@csrf_exempt
@require_http_methods(["POST"])
def login_api(request):
    try:
        logger.info(f"Login request received: {request.method}")
        logger.info(f"Request body: {request.body}")
        
        if request.content_type != 'application/json':
            return error_response('Content-Type must be application/json')
        
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError as e:
            return error_response(f'Invalid JSON: {str(e)}')

        account = data.get('username')
        password = data.get('password')
        
        logger.info(f"Login attempt for account: {account}")

        if not account or not password:
            return error_response('請輸入帳號與密碼')

        try:
            user = User.objects.get(username=account)
        except User.DoesNotExist:
            return error_response('帳號或密碼錯誤')

        if not check_password(password, user.password):
            return error_response('帳號或密碼錯誤')
        
        logger.info(f"Login successful for user: {user.username}")
        return success_response(f"歡迎：{user.username}", {
            'user_id': user.id,
            'username': user.username
        })

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return error_response(f'登入過程發生錯誤：{str(e)}', status=500)

@csrf_exempt
@require_http_methods(["POST"])
def register_api(request):
    try:
        logger.info(f"Register request received: {request.method}")
        
        if request.content_type != 'application/json':
            return error_response('Content-Type must be application/json')
        
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError as e:
            return error_response(f'Invalid JSON: {str(e)}')

        account = data.get('username')
        password = data.get('password')
        
        logger.info(f"Register attempt for account: {account}")

        if not account or not password:
            return error_response('請輸入帳號與密碼')

        if User.objects.filter(username=account).exists():
            return error_response('帳號已存在')

        try:
            new_user = User.objects.create(
                username=account,
                password=make_password(password)
            )
            logger.info(f"User registered successfully: {new_user.username}")
            return success_response('註冊成功', {
                'user_id': new_user.id,
                'username': new_user.username
            }, status=201)
        except Exception as e:
            logger.error(f"User creation error: {str(e)}")
            return error_response(f'註冊失敗：{str(e)}')

    except Exception as e:
        logger.error(f"Register error: {str(e)}")
        return error_response(f'註冊過程發生錯誤：{str(e)}', status=500)

@csrf_exempt
def logout_api(request):
    return success_response('已登出')

@csrf_exempt
@require_http_methods(["GET"])
def user_home_api(request):
    try:
        user_id = request.GET.get('user_id')
        logger.info(f"User home request for user_id: {user_id}")
        
        if not user_id:
            return error_response('User ID is required', status=401)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return error_response('User not found', status=404)
        
        borrowed_books_records = BorrowRecord.objects.filter(
            user=user, returned=False
        ).select_related('book')
        
        all_records = BorrowRecord.objects.filter(
            user=user
        ).order_by('-borrow_date').select_related('book')

        borrowed_books_data = [{
            'id': record.id,
            'book_title': record.book.title,
            'borrow_date': record.borrow_date.isoformat(),
            'due_date': record.due_date.isoformat(),
            'is_overdue': record.is_overdue,
        } for record in borrowed_books_records]

        all_records_data = [{
            'id': record.id,
            'book_title': record.book.title,
            'borrow_date': record.borrow_date.isoformat(),
            'due_date': record.due_date.isoformat(),
            'return_date': record.return_date.isoformat() if record.return_date else None,
            'returned': record.returned,
            'is_overdue': record.is_overdue,
        } for record in all_records]

        return success_response('資料載入成功', {
            'username': user.username,
            'borrowed_books': borrowed_books_data,
            'all_records': all_records_data,
            'now': timezone.now().isoformat()
        })

    except Exception as e:
        logger.error(f"User home error: {str(e)}")
        return error_response(f'載入使用者資料失敗：{str(e)}', status=500)

@csrf_exempt
@require_http_methods(["GET"])
def book_list_api(request):
    try:
        logger.info("Book list request received")
        books = Book.objects.all().values('id', 'title', 'author', 'isbn', 'is_borrowed')
        books_list = list(books)
        logger.info(f"Found {len(books_list)} books")
        return success_response('書籍列表載入成功', {'books': books_list})
    except Exception as e:
        logger.error(f"Book list error: {str(e)}")
        return error_response(f'載入書籍列表失敗：{str(e)}', status=500)

@csrf_exempt
@require_http_methods(["POST"])
def book_create_api(request):
    try:
        logger.info("Book create request received")
        
        if request.content_type != 'application/json':
            return error_response('Content-Type must be application/json')
        
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError as e:
            return error_response(f'Invalid JSON: {str(e)}')

        title = data.get('title')
        author = data.get('author')
        isbn = data.get('isbn')

        if not all([title, author, isbn]):
            return error_response('請填寫所有欄位')
        
        try:
            new_book = Book.objects.create(title=title, author=author, isbn=isbn)
            logger.info(f"Book created successfully: {new_book.title}")
            return success_response('書籍新增成功', {'book_id': new_book.id}, status=201)
        except Exception as e:
            logger.error(f"Book creation error: {str(e)}")
            return error_response(f'新增失敗：{str(e)}')

    except Exception as e:
        logger.error(f"Book create error: {str(e)}")
        return error_response(f'新增書籍過程發生錯誤：{str(e)}', status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def book_delete_api(request, book_id):
    try:
        logger.info(f"Book delete request for book_id: {book_id}")
        
        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return error_response('書籍不存在', status=404)
        
        book_title = book.title
        book.delete()
        logger.info(f"Book deleted successfully: {book_title}")
        return success_response(f'書籍 "{book_title}" 已成功刪除')

    except Exception as e:
        logger.error(f"Book delete error: {str(e)}")
        return error_response(f'刪除失敗：{str(e)}', status=500)

@csrf_exempt
@require_http_methods(["POST"])
def borrow_book_api(request, book_id):
    try:
        logger.info(f"Borrow book request for book_id: {book_id}")
        
        if request.content_type != 'application/json':
            return error_response('Content-Type must be application/json')
        
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError as e:
            return error_response(f'Invalid JSON: {str(e)}')

        user_id = data.get('user_id')

        if not user_id:
            return error_response('User ID is required', status=401)
        
        try:
            user = User.objects.get(id=user_id)
            book = Book.objects.get(id=book_id)
        except User.DoesNotExist:
            return error_response('使用者不存在', status=404)
        except Book.DoesNotExist:
            return error_response('書籍不存在', status=404)

        if book.is_borrowed:
            return error_response('此書已被借出')
        
        if BorrowRecord.objects.filter(user=user, book=book, returned=False).exists():
            return error_response('您已借閱此書且尚未歸還', status=409)

        # 設定歸還日期為借閱日期後兩個月(60天)
        borrow_date = timezone.now()
        due_date = borrow_date + timezone.timedelta(days=60)
        
        BorrowRecord.objects.create(
            user=user, 
            book=book, 
            borrow_date=borrow_date,
            due_date=due_date
        )
        
        book.is_borrowed = True
        book.save()
        
        logger.info(f"Book borrowed successfully: {book.title} by {user.username}")
        return success_response(f"{book.title} 借閱成功，歸還日期：{due_date.strftime('%Y-%m-%d')}")

    except Exception as e:
        logger.error(f"Borrow book error: {str(e)}")
        return error_response(f'借閱過程發生錯誤：{str(e)}', status=500)

@csrf_exempt
@require_http_methods(["POST"])
def return_book_api(request, record_id):
    try:
        logger.info(f"Return book request for record_id: {record_id}")
        
        try:
            record = BorrowRecord.objects.get(id=record_id)
        except BorrowRecord.DoesNotExist:
            return error_response('借閱記錄不存在', status=404)
        
        if record.returned:
            return error_response('此書已歸還', status=409)

        record.returned = True
        record.return_date = timezone.now()
        record.book.is_borrowed = False
        record.book.save()
        record.save()
        
        logger.info(f"Book returned successfully: {record.book.title}")
        return success_response(f"{record.book.title} 已成功歸還")

    except Exception as e:
        logger.error(f"Return book error: {str(e)}")
        return error_response(f'歸還過程發生錯誤：{str(e)}', status=500)