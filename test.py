import requests

def query_google_books(isbn):
  url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}"
  response = requests.get(url)
  if response.status_code != 200:
      print("查詢失敗")
      return None
  data = response.json()
  if "items" not in data:
      print("查無資料")
      return None
  volume_info = data["items"][0]["volumeInfo"]
  return {
      "書名": volume_info.get("title"),
      "作者": ", ".join(volume_info.get("authors", [])),
      "出版社": volume_info.get("publisher"),
      "出版日期": volume_info.get("publishedDate"),
      "簡介": volume_info.get("description"),
      "封面圖片": volume_info.get("imageLinks", {}).get("thumbnail")
  }

# 測試查詢
isbn = "9789862897676"
book_info = query_google_books(isbn)
if book_info:
    for key, value in book_info.items():
        print(f"{key}: {value}")
print("ISBN:", isbn)