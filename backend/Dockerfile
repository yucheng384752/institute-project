FROM python:3.9.6

WORKDIR /app

COPY requirment.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .
#運行資料庫遷移
RUN py manage.py migrate

RUN python manage.py collectstatic --noinput

EXPOSE 8000
#容器啟動時執行的命令
CMD ["gunicorn", "libmanagesystem.wsgi:application", "--bind", "0.0.0.0:8000"]