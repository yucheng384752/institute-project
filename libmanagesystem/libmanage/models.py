from django.db import models
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.models import User


# Create your models here.
class Book(models.Model):

   title = models.CharField('書名', max_length=100)
   author = models.CharField('作者', max_length=50)
   isbn  = models.CharField('ISBN', max_length=17, blank=True)
   is_borrowed = models.BooleanField(default=False)
   
   def __str__(self):
       return self.title
   
    
class BorrowRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    borrow_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    returned = models.BooleanField(default=False)
    
    def __str__(self):
        return f'{self.user.username} borrowed {self.book.title}' 
    
    @property  #檢查是否逾期
    def is_overdue(self):
        return self.due_date < timezone.now().date() and not self.returned