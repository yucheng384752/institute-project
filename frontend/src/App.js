import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';

// ----------------------------------------------------
// AuthContext: 用於管理全局使用者狀態
// ----------------------------------------------------
export const AuthContext = createContext(null);

// 定義書籍分類選項 (與 Django models.py 中的 CATEGORY_CHOICES 保持一致)
const CATEGORY_OPTIONS = [
  { value: 'SCIENCE', label: '科學' },
  { value: 'LANGUAGE', label: '語言' },
  { value: 'HISTORY', label: '歷史' },
  { value: 'FICTION', label: '小說' },
  { value: 'ENGINEERING', label: '工程' },
  { value: 'ART', label: '藝術' },
  { value: 'COMPUTER', label: '電腦' },
  { value: 'OTHER', label: '其他' },
];

// 定義書籍狀態選項 (與 Django models.py 中的 STATUS_CHOICES 保持一致)
const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: '可借閱' },
  { value: 'DAMAGED', label: '已損壞' },
  { value: 'UNDER_REPAIR', label: '維修中' },
  { value: 'LOST', label: '遺失' },
];


// ----------------------------------------------------
// MessageDisplay: 訊息顯示組件 (已包含 Tailwind 樣式)
// ----------------------------------------------------
const MessageDisplay = ({ message, type }) => {
  if (!message) return null;
  return (
    <div className={`p-3 rounded-md text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} mb-4 text-center shadow-sm`}>
      {message}
    </div>
  );
};

// ----------------------------------------------------
// Header: 應用程式頂部導航欄 (新增下拉選單和快速掃描按鈕)
// ----------------------------------------------------
const Header = ({ setCurrentPage, currentUser, logoutUser }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleNavLinkClick = (page) => {
    setCurrentPage(page);
    setDropdownOpen(false); // 點擊選項後關閉下拉選單
  };

  return (
    <header className="bg-blue-700 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-semibold cursor-pointer" onClick={() => handleNavLinkClick('home')}>圖書館測試系統</h1>
        <nav className="flex items-center space-x-4">
          <button
            onClick={() => handleNavLinkClick('home')}
            className="px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            首頁
          </button>
          <button
            onClick={() => handleNavLinkClick('book_list')}
            className="px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            館藏查詢
          </button>
          {/* 判斷如果用戶名是 'yucheng' 則顯示新增書籍按鈕 */}
          {currentUser.id && currentUser.username === 'yucheng' && (
            <button
              onClick={() => handleNavLinkClick('book_create')}
              className="px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
            >
              新增書籍 (管理員)
            </button>
          )}
          { /* 新增快速掃描按鈕 */ }
          <button
            onClick={() => handleNavLinkClick('quick_scan')}
            className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition duration-200"
          >
            快速掃描
          </button>

          {currentUser.id ? (
            <div className="relative">
              <button
                onClick={handleDropdownToggle}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 transition duration-200 flex items-center"
              >
                歡迎, {currentUser.username}
                <svg className={`ml-2 w-4 h-4 transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={() => handleNavLinkClick('user_home')}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    我的借閱
                  </button>
                  <button
                    onClick={() => handleNavLinkClick('edit_profile')}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    編輯個人資料
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={logoutUser}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    登出
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleNavLinkClick('login')}
              className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 transition duration-200"
            >
              登入 / 註冊
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

// ----------------------------------------------------
// Home: 首頁組件 (已更新 Tailwind 樣式)
// ----------------------------------------------------
const Home = ({ setCurrentPage }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-6">歡迎來到圖書館系統！</h1>
        <p className="text-lg text-gray-700 mb-8 leading-relaxed">
          在這裡，您可以輕鬆查詢館藏書籍，管理您的借閱記錄，並享受便捷的圖書服務。
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
          <button
            onClick={() => setCurrentPage('book_list')}
            className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            查詢書籍
          </button>
          <button
            onClick={() => setCurrentPage('login')}
            className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            登入您的帳號
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Login: 登入組件 (已更新 Tailwind 樣式)
// ----------------------------------------------------
const Login = ({ setCurrentPage }) => {
  const { loginUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        loginUser(data.user_id, data.username);
        setCurrentPage('user_home');
      } else {
        setMessage(data.message || '登入失敗');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('網路錯誤或伺服器無響應');
      setMessageType('error');
      console.error('登入請求失敗:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">會員登入</h1>
        {message && <MessageDisplay message={message} type={messageType} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 text-sm font-semibold mb-2 text-left">帳號</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2 text-left">密碼</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out"
          >
            登入
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-600">
          還沒有帳號嗎？
          <a href="#" onClick={() => setCurrentPage('register')} className="text-blue-500 hover:text-blue-700 font-semibold ml-1">註冊新帳號</a>
        </p>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Register: 註冊組件 (已更新 Tailwind 樣式)
// ----------------------------------------------------
const Register = ({ setCurrentPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch('/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        // 註冊成功後可以自動跳轉到登入頁面
        setTimeout(() => setCurrentPage('login'), 1500);
      } else {
        setMessage(data.message || '註冊失敗');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('網路錯誤或伺服器無響應');
      setMessageType('error');
      console.error('註冊請求失敗:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">新會員註冊</h1>
        {message && <MessageDisplay message={message} type={messageType} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-username" className="block text-gray-700 text-sm font-semibold mb-2 text-left">帳號</label>
            <input
              type="text"
              id="reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-gray-700 text-sm font-semibold mb-2 text-left">密碼</label>
            <input
              type="password"
              id="reg-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out"
          >
            註冊
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-600">
          已經有帳號？
          <a href="#" onClick={() => setCurrentPage('login')} className="text-blue-500 hover:text-blue-700 font-semibold ml-1">前往登入</a>
        </p>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// UserHome: 用戶主頁 (借還書紀錄) (已更新 Tailwind 樣式)
// ----------------------------------------------------
const UserHome = ({ setCurrentPage }) => {
  const { currentUser, logoutUser } = useContext(AuthContext);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBorrowedBooks = useCallback(async () => {
    if (!currentUser.id) {
      setMessage('請先登入以查看借閱記錄');
      setMessageType('error');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/user_home/?user_id=${currentUser.id}`);
      const data = await response.json();

      if (response.ok) {
        setBorrowedBooks(data.borrowed_books);
      } else {
        setMessage(data.message || '無法載入借閱記錄');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('網路錯誤或伺服器無響應');
      setMessageType('error');
      console.error('獲取借閱記錄失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchBorrowedBooks();
  }, [fetchBorrowedBooks]);

  const handleReturnBook = async (recordId, bookTitle) => {
    setMessage(null);
    if (!window.confirm(`確定要歸還書籍 "${bookTitle}" 嗎？`)) {
        return;
    }

    try {
      const response = await fetch(`/api/books/return/${recordId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        fetchBorrowedBooks(); // 刷新列表
      } else {
        setMessage(data.message || '歸還失敗');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('網路錯誤或伺服器無響應');
      setMessageType('error');
      console.error('歸還請求失敗:', error);
    }
  };

  if (!currentUser.id) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">未登入</h2>
                <p className="text-gray-700 mb-6">請先登入以查看您的借閱記錄。</p>
                <button
                    onClick={() => setCurrentPage('login')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                    前往登入
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {currentUser.username} 的借閱紀錄
        </h2>
        {message && <MessageDisplay message={message} type={messageType} />}

        {loading ? (
          <p className="text-center text-gray-600">載入中...</p>
        ) : borrowedBooks.length > 0 ? (
          <ul className="space-y-4">
            {borrowedBooks.map((record) => (
              <li key={record.id} className="border border-gray-200 p-4 rounded-md shadow-sm bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <strong className="text-lg text-blue-700">{record.book_title}</strong>
                  <p className="text-sm text-gray-600">借閱日期：{record.borrow_date}</p>
                  <p className={`text-sm ${record.is_overdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                    歸還期限：{record.due_date}
                    {record.is_overdue && <span className="ml-2">(已逾期)</span>}
                  </p>
                </div>
                <button
                  onClick={() => handleReturnBook(record.id, record.book_title)}
                  className="mt-3 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                >
                  歸還此書
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600 text-lg">目前沒有借閱中的書籍。</p>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            回到首頁
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// BookList: 館藏查詢 (已更新 Tailwind 樣式)
// ----------------------------------------------------
const BookList = ({ setCurrentPage }) => {
  const { currentUser } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/books/');
      const data = await response.json();
      if (response.ok) {
        setBooks(data.books);
      } else {
        setMessage(data.message || '無法載入書籍列表');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('網路錯誤或伺服器無響應');
      setMessageType('error');
      console.error('獲取書籍列表失敗:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleBorrowBook = async (bookId, bookTitle) => {
    if (!currentUser.id) {
      setMessage('請先登入才能借閱書籍');
      setMessageType('error');
      setCurrentPage('login');
      return;
    }
    setMessage(null);
    if (!window.confirm(`確定要借閱書籍 "${bookTitle}" 嗎？`)) {
        return;
    }

    try {
      const response = await fetch(`/api/books/borrow/${bookId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: currentUser.id }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        fetchBooks(); // 刷新列表以顯示借閱狀態
      } else {
        setMessage(data.message || '借閱失敗');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('網路錯誤或伺服器無響應');
      setMessageType('error');
      console.error('借閱請求失敗:', error);
    }
  };

  const handleDeleteBook = async (bookId, bookTitle) => {
    setMessage(null);
    // 判斷是否為 'yucheng' 進行刪除
    if (currentUser.username !== 'yucheng') {
      setMessage('只有管理員 (yucheng) 才能刪除書籍');
      setMessageType('error');
      return;
    }
    if (!window.confirm(`確定要刪除書籍 "${bookTitle}" 嗎？這將無法復原！`)) {
        return;
    }

    try {
      const response = await fetch(`/api/books/delete/${bookId}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        fetchBooks(); // 重新載入書籍列表
      } else {
        setMessage(data.message || '刪除失敗');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('網路錯誤或伺服器無響應');
      setMessageType('error');
      console.error('刪除書籍請求失敗:', error);
    }
  };

  const handleEditBook = (bookId) => {
    setCurrentPage({ name: 'edit_book', params: { bookId: bookId } });
  };

  const handleUpdateBookStatus = async (bookId, newStatus) => {
    setMessage(null);
    if (currentUser.username !== 'yucheng') {
        setMessage('只有管理員 (yucheng) 才能更改書籍狀態');
        setMessageType('error');
        return;
    }

    try {
        const response = await fetch(`/api/books/update_status/${bookId}/`, {
            method: 'PUT', // 使用 PUT 請求
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        const data = await response.json();

        if (response.ok) {
            setMessage(data.message);
            setMessageType('success');
            fetchBooks(); // 刷新列表以顯示新狀態
        } else {
            setMessage(data.message || '更新書籍狀態失敗');
            setMessageType('error');
        }
    } catch (error) {
        setMessage('網路錯誤或伺服器無響應');
        setMessageType('error');
        console.error('更新書籍狀態請求失敗:', error);
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">載入中...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">館藏書籍列表</h2>
        {message && <MessageDisplay message={message} type={messageType} />}

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            返回首頁
          </button>
          {/* 判斷如果用戶名是 'yucheng' 則顯示新增書籍按鈕 */}
          {currentUser.username === 'yucheng' && (
            <button
              onClick={() => setCurrentPage('book_create')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              新增書籍
            </button>
          )}
        </div>

        {books.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">書名</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">作者</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ISBN</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">分類</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">狀態</th> {/* 新增狀態標題 */}
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">{book.title}</td>
                    <td className="py-3 px-4 text-gray-800">{book.author}</td>
                    <td className="py-3 px-4 text-gray-800">{book.isbn}</td>
                    <td className="py-3 px-4 text-gray-800">
                      {CATEGORY_OPTIONS.find(option => option.value === book.category)?.label || book.category}
                    </td>
                    <td className="py-3 px-4">
                      {/* 顯示書籍狀態，根據狀態顯示不同顏色 */}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${book.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : ''}
                        ${book.status === 'DAMAGED' ? 'bg-red-100 text-red-800' : ''}
                        ${book.status === 'UNDER_REPAIR' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${book.status === 'LOST' ? 'bg-gray-300 text-gray-800' : ''}
                      `}>
                        {STATUS_OPTIONS.find(option => option.value === book.status)?.label || book.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      {/* 判斷如果用戶名是 'yucheng' 則顯示狀態下拉選單和編輯、刪除按鈕 */}
                      {currentUser.username === 'yucheng' ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={book.status}
                            onChange={(e) => handleUpdateBookStatus(book.id, e.target.value)}
                            className="p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {STATUS_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleEditBook(book.id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-lg text-sm shadow-md transition duration-300 ease-in-out"
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id, book.title)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm shadow-md transition duration-300 ease-in-out"
                          >
                            刪除
                          </button>
                        </div>
                      ) : (
                        // 非 yucheng 用戶只能借閱
                        !book.is_borrowed && currentUser.id && book.status === 'AVAILABLE' && (
                          <button
                            onClick={() => handleBorrowBook(book.id, book.title)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-sm shadow-md transition duration-300 ease-in-out"
                          >
                            借閱
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center text-lg">目前沒有書籍。</p>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// BookCreate: 新增書籍 (管理員專用) (已更新 Tailwind 樣式，並新增分類)
// ----------------------------------------------------
const BookCreate = ({ setCurrentPage }) => {
  const { currentUser } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value); // 新增 status 狀態
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (currentUser.username !== 'yucheng') {
      setMessage('您沒有權限訪問此頁面。');
      setMessageType('error');
      setCurrentPage('home');
    }
  }, [currentUser.username, setCurrentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!title || !author || !isbn || !category || !status) { // 檢查所有欄位
      setMessage('請填寫所有欄位');
      setMessageType('error');
      return;
    }

    try {
      const response = await fetch('/api/books/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, author, isbn, category, status }), // 傳送 category 和 status
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        setTitle('');
        setAuthor('');
        setIsbn('');
        setCategory(CATEGORY_OPTIONS[0].value);
        setStatus(STATUS_OPTIONS[0].value); // 重置狀態
      } else {
        setMessage(data.message || '新增書籍失敗');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('網路錯誤或伺服器無響應');
      setMessageType('error');
      console.error('新增書籍請求失敗:', error);
    }
  };

  if (currentUser.username !== 'yucheng') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          <MessageDisplay message={message} type={messageType} />
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            回到首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">新增書籍</h1>
        {message && <MessageDisplay message={message} type={messageType} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="book-title" className="block text-gray-700 text-sm font-semibold mb-2 text-left">書名</label>
            <input
              type="text"
              id="book-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="book-author" className="block text-gray-700 text-sm font-semibold mb-2 text-left">作者</label>
            <input
              type="text"
              id="book-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="book-isbn" className="block text-gray-700 text-sm font-semibold mb-2 text-left">ISBN</label>
            <input
              type="text"
              id="book-isbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="book-category" className="block text-gray-700 text-sm font-semibold mb-2 text-left">分類</label>
            <select
              id="book-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="book-status" className="block text-gray-700 text-sm font-semibold mb-2 text-left">狀態</label>
            <select
              id="book-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out"
          >
            新增書籍
          </button>
        </form>
        <div className="text-center mt-6">
          <button
            onClick={() => setCurrentPage('book_list')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            返回書籍列表
          </button>
        </div>
      </div>
    </div>
  );
};


// ----------------------------------------------------
// BookEdit: 編輯書籍 (新增元件)
// ----------------------------------------------------
const BookEdit = ({ setCurrentPage, bookId }) => {
  const { currentUser } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value); // 新增 status 狀態
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 檢查權限
    if (currentUser.username !== 'yucheng') {
      setMessage('您沒有權限訪問此頁面。');
      setMessageType('error');
      setCurrentPage('home');
      return;
    }

    const fetchBookDetails = async () => {
      if (!bookId) {
        setMessage('未提供書籍 ID。');
        setMessageType('error');
        setLoading(false);
        setCurrentPage('book_list');
        return;
      }
      try {
        const response = await fetch(`/api/books/${bookId}/`);
        const data = await response.json();
        if (response.ok) {
          setTitle(data.book.title);
          setAuthor(data.book.author);
          setIsbn(data.book.isbn);
          setCategory(data.book.category || CATEGORY_OPTIONS[0].value);
          setStatus(data.book.status || STATUS_OPTIONS[0].value); // 設置狀態
        } else {
          setMessage(data.message || '無法載入書籍詳細資訊');
          setMessageType('error');
        }
      } catch (error) {
        setMessage('網路錯誤或伺服器無響應');
        setMessageType('error');
        console.error('獲取書籍詳細資訊失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId, currentUser.username, setCurrentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!title || !author || !isbn || !category || !status) { // 檢查所有欄位
      setMessage('請填寫所有欄位');
      setMessageType('error');
      return;
    }

    try {
      const response = await fetch(`/api/books/update/${bookId}/`, {
        method: 'PUT', // 使用 PUT 請求進行更新
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, author, isbn, category, status }), // 傳送 status
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        setTimeout(() => setCurrentPage('book_list'), 1500);
      } else {
        setMessage(data.message || '更新書籍失敗');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('網路錯誤或伺服器無響應');
      setMessageType('error');
      console.error('更新書籍請求失敗:', error);
    }
  };

  if (currentUser.username !== 'yucheng') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          <MessageDisplay message={message} type={messageType} />
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            回到首頁
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-120px)] text-xl">載入中...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">編輯書籍</h1>
        {message && <MessageDisplay message={message} type={messageType} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-book-title" className="block text-gray-700 text-sm font-semibold mb-2 text-left">書名</label>
            <input
              type="text"
              id="edit-book-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="edit-book-author" className="block text-gray-700 text-sm font-semibold mb-2 text-left">作者</label>
            <input
              type="text"
              id="edit-book-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="edit-book-isbn" className="block text-gray-700 text-sm font-semibold mb-2 text-left">ISBN</label>
            <input
              type="text"
              id="edit-book-isbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="edit-book-category" className="block text-gray-700 text-sm font-semibold mb-2 text-left">分類</label>
            <select
              id="edit-book-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-book-status" className="block text-gray-700 text-sm font-semibold mb-2 text-left">狀態</label>
            <select
              id="edit-book-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out"
          >
            更新書籍
          </button>
        </form>
        <div className="text-center mt-6">
          <button
            onClick={() => setCurrentPage('book_list')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            返回書籍列表
          </button>
        </div>
      </div>
    </div>
  );
};


// ----------------------------------------------------
// EditProfile: 使用者更改資訊組件 (新增)
// ----------------------------------------------------
const EditProfile = ({ setCurrentPage }) => {
  const { currentUser } = useContext(AuthContext);
  const [currentUsername, setCurrentUsername] = useState(''); // 假設用戶名可顯示
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);

  // 初次加載時獲取用戶資訊 (目前只顯示用戶名)
  useEffect(() => {
    if (!currentUser.id) {
      setCurrentPage('login'); // 未登入則跳轉登入
      return;
    }
    // 在這裡可以發送 API 請求獲取更多用戶詳細資訊，例如 email, phone 等
    // 目前我們只使用 currentUser.username
    setCurrentUsername(currentUser.username);
    setLoading(false); // 設置為不載入
  }, [currentUser.id, currentUser.username, setCurrentPage]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!currentUser.id) {
      setMessage('您尚未登入。');
      setMessageType('error');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setMessage('請輸入新密碼和確認密碼。');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('新密碼與確認密碼不一致。');
      setMessageType('error');
      return;
    }

    // 可以在這裡添加密碼複雜度檢查 (例如：長度、包含數字/字母)
    if (newPassword.length < 6) {
      setMessage('密碼長度至少為 6 個字元。');
      setMessageType('error');
      return;
    }

    try {
      // 調用後端 API 更新用戶資訊 (例如，只更新密碼)
      const response = await fetch('/api/user/update_profile/', {
        method: 'POST', // 或 PUT
        headers: {
          'Content-Type': 'application/json',
          // 這裡可能需要您的認證 Token (例如 JWT)
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: currentUser.id, // 傳遞用戶 ID
          username: currentUser.username, // 傳遞用戶名 (可選，但方便後端查找)
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || '個人資料更新成功！');
        setMessageType('success');
        setNewPassword('');
        setConfirmPassword('');
        // 成功後可以考慮跳轉回用戶主頁
        // setTimeout(() => setCurrentPage('user_home'), 1500);
      } else {
        setMessage(data.message || '更新失敗。');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`網路錯誤：${error.message}`);
      setMessageType('error');
      console.error('更新個人資料請求失敗:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-120px)] text-xl">載入中...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">編輯個人資料</h1>
        {message && <MessageDisplay message={message} type={messageType} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-gray-700 text-sm font-semibold mb-2">用戶名:</label>
            <p className="text-lg font-medium text-gray-900 px-3 py-2 bg-gray-100 rounded-md">{currentUsername}</p>
          </div>
          <div>
            <label htmlFor="new-password" className="block text-gray-700 text-sm font-semibold mb-2 text-left">新密碼</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-gray-700 text-sm font-semibold mb-2 text-left">確認新密碼</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out"
          >
            更新密碼
          </button>
        </form>
        <div className="text-center mt-6">
          <button
            onClick={() => setCurrentPage('user_home')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            返回我的借閱
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// ScannedBarcodeDisplay: 顯示掃描圖像及紅色框標示 (新組件)
// ----------------------------------------------------
const ScannedBarcodeDisplay = ({ imageDataUrl, boundingBox }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const image = new Image();

    image.onload = () => {
      // 確保 canvas 尺寸與圖像一致，以正確繪製
      canvas.width = image.width;
      canvas.height = image.height;
      context.clearRect(0, 0, canvas.width, canvas.height); // 清除舊內容
      context.drawImage(image, 0, 0); // 繪製圖像

      if (boundingBox) {
        context.strokeStyle = 'red'; // 紅色框
        context.lineWidth = 4;        // 框線寬度
        // 繪製矩形框
        context.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
      }
    };

    if (imageDataUrl) {
      image.src = imageDataUrl;
    }
  }, [imageDataUrl, boundingBox]); // 當圖像數據或邊界框改變時重新繪製

  if (!imageDataUrl) return null;

  return (
    <div className="mt-6 flex justify-center">
      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="max-w-full h-auto"></canvas>
      </div>
    </div>
  );
};


// ----------------------------------------------------
// BarcodeScanner: 條碼/QR Code 掃描組件 (新增)
// 負責攝影機串流、圖像捕獲和發送到後端
// ----------------------------------------------------
const BarcodeScanner = ({ onScanResult, onError, scanningIntent }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // 用於捕獲圖像的隱藏 canvas
  const [stream, setStream] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scanIntervalRef = useRef(null);

  const startScan = async () => {
    try {
      // 請求訪問使用者媒體設備 (視訊)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); // 優先使用後置攝影機
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setScanning(true);

      // 等待視訊載入完成
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        // 每隔一段時間捕獲一幀並發送到後端
        scanIntervalRef.current = setInterval(captureAndSendFrame, 1000); // 每秒捕獲一次
      };
    } catch (err) {
      console.error("無法訪問攝影機:", err);
      onError("無法訪問攝影機，請檢查權限。");
      setScanning(false);
    }
  };

  const stopScan = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setScanning(false);
  };

  const captureAndSendFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // 設置 canvas 大小與視訊流相同
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 將圖像轉換為 Base64 格式
    const imageData = canvas.toDataURL('image/jpeg', 0.8); // 獲取完整的 Base64 數據
    const imageDataPart = imageData.split(',')[1]; // 只取 Base64 數據部分給後端

    try {
      const response = await fetch('/api/scan_code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageDataPart }), // 發送數據部分
      });
      const data = await response.json();

      if (response.ok && data.decoded_text) {
        // 成功辨識，將辨識結果、圖像數據和邊界框傳遞給父組件
        onScanResult(data.decoded_text, imageData, data.bounding_box); 
        stopScan(); // 辨識成功後停止掃描
      } else if (data.message && data.message !== "未找到條碼或QR碼") {
        // 僅當有特定錯誤訊息而不是 "未找到" 時才顯示
        onError(data.message);
      }
      // 如果未找到條碼，但也沒有其他錯誤，則繼續掃描
    } catch (error) {
      console.error("掃描 API 請求失敗:", error);
      onError("掃描失敗，網路或伺服器錯誤。");
    }
  };

  useEffect(() => {
    // 組件卸載時停止掃描
    return () => {
      stopScan();
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-200 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">條碼/QR Code 掃描器</h3>
      <video ref={videoRef} className="w-full max-w-md rounded-lg shadow-lg mb-4" muted autoPlay playsInline></video>
      <canvas ref={canvasRef} className="hidden"></canvas> {/* 用於捕獲圖像 */}
      
      <div className="flex space-x-4">
        {!scanning ? (
          <button
            onClick={startScan}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
          >
            啟動掃描
          </button>
        ) : (
          <button
            onClick={stopScan}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
          >
            停止掃描
          </button>
        )}
      </div>
      <p className="mt-4 text-gray-600">請將條碼或QR Code對準攝影機。</p>
    </div>
  );
};

// ----------------------------------------------------
// QuickScanPage: 快速掃描頁面 (新增)
// 整合 BarcodeScanner，並處理掃描結果
// ----------------------------------------------------
const QuickScanPage = ({ setCurrentPage }) => {
  const { currentUser } = useContext(AuthContext);
  const [scanResult, setScanResult] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [actionType, setActionType] = useState('borrow'); // 'borrow' or 'return'
  const [scannedImageBase64, setScannedImageBase64] = useState(null); // 用於顯示掃描到的圖像
  const [scannedBoundingBox, setScannedBoundingBox] = useState(null); // 用於顯示掃描到的邊界框

  // 修改 onScanResult 接收圖像數據和邊界框
  const handleScanResult = useCallback(async (decodedText, imageData, boundingBox) => {
    setScanResult(decodedText);
    setScannedImageBase64(imageData); // 保存圖像數據
    setScannedBoundingBox(boundingBox); // 保存邊界框數據
    setMessage(`已辨識到：${decodedText}`);
    setMessageType('success');

    if (!currentUser.id) {
        setMessage('請先登入才能進行借還操作。');
        setMessageType('error');
        return;
    }

    try {
        let apiEndpoint = '';
        let requestBody = {};
        let successMessage = '';
        let failureMessage = '';

        // 嘗試查找書籍ID (假設掃描的是 ISBN)
        const bookListResponse = await fetch('/api/books/');
        const bookListData = bookListResponse.ok ? await bookListResponse.json() : { books: [] };
        const foundBook = bookListData.books.find(book => book.isbn === decodedText);

        if (!foundBook) {
            setMessage('未找到對應的書籍。');
            setMessageType('error');
            return;
        }

        if (actionType === 'borrow') {
            apiEndpoint = `/api/books/borrow/${foundBook.id}/`;
            requestBody = { user_id: currentUser.id };
            successMessage = `${foundBook.title} 借閱成功！`;
            failureMessage = `${foundBook.title} 借閱失敗。`;
        } else { // actionType === 'return'
            const userHomeResponse = await fetch(`/api/user_home/?user_id=${currentUser.id}`);
            const userHomeData = userHomeResponse.ok ? await userHomeResponse.json() : { borrowed_books: [] };
            const relevantBorrowRecord = userHomeData.borrowed_books.find(record => record.book_title === foundBook.title && !record.returned);

            if (!relevantBorrowRecord) {
                setMessage('未找到您借閱此書的未歸還記錄。');
                setMessageType('error');
                return;
            }

            apiEndpoint = `/api/books/return/${relevantBorrowRecord.id}/`;
            requestBody = {}; 
            successMessage = `${foundBook.title} 歸還成功！`;
            failureMessage = `${foundBook.title} 歸還失敗。`;
        }

        const response = await fetch(apiEndpoint, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const data = await response.json();

        if (response.ok) {
            setMessage(data.message || successMessage);
            setMessageType('success');
            // 成功後不清空掃描結果，讓用戶看到圖片和框
            // setScanResult(''); 
            // setScannedImageBase64(null); 
            // setScannedBoundingBox(null);
        } else {
            setMessage(data.message || failureMessage);
            setMessageType('error');
        }

    } catch (error) {
        setMessage(`處理掃描結果時發生錯誤：${error.message}`);
        setMessageType('error');
        console.error('處理掃描結果失敗:', error);
    }
  }, [currentUser.id, actionType]);

  const handleScannerError = useCallback((errMsg) => {
    setMessage(errMsg);
    setMessageType('error');
  }, []);

  if (!currentUser.id) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">未登入</h2>
                <p className="text-gray-700 mb-6">請先登入以使用快速掃描功能。</p>
                <button
                    onClick={() => setCurrentPage('login')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                    前往登入
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">快速掃描</h2>
        {message && <MessageDisplay message={message} type={messageType} />}

        <div className="mb-6">
            <label className="mr-4 text-lg font-medium text-gray-700">選擇操作：</label>
            <input
                type="radio"
                id="actionBorrow"
                name="actionType"
                value="borrow"
                checked={actionType === 'borrow'}
                onChange={() => setActionType('borrow')}
                className="mr-2"
            />
            <label htmlFor="actionBorrow" className="mr-4 text-gray-700">借書</label>
            <input
                type="radio"
                id="actionReturn"
                name="actionType"
                value="return"
                checked={actionType === 'return'}
                onChange={() => setActionType('return')}
                className="mr-2"
            />
            <label htmlFor="actionReturn" className="text-gray-700">還書</label>
        </div>

        {/* BarcodeScanner 不再直接顯示掃描結果，而是將結果傳遞給 QuickScanPage */}
        <BarcodeScanner onScanResult={handleScanResult} onError={handleScannerError} scanningIntent={actionType} />
        
        {scanResult && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-lg font-medium text-blue-800">掃描結果: <span className="font-mono text-blue-900 break-words">{scanResult}</span></p>
            {/* 顯示掃描到的圖像，並用紅色框標示 */}
            <ScannedBarcodeDisplay imageDataUrl={scannedImageBase64} boundingBox={scannedBoundingBox} />
            <p className="text-sm text-gray-600 mt-2">系統已嘗試根據掃描結果執行 {actionType === 'borrow' ? '借書' : '還書'} 操作。</p>
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            回到首頁
          </button>
        </div>
      </div>
    </div>
  );
};


// ----------------------------------------------------
// Footer: 應用程式底部信息
// ----------------------------------------------------
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center text-sm shadow-inner mt-auto">
      <div className="container mx-auto">
        <p className="mb-2">建工圖書館：807618高雄市三民區建工路415號 電話:07-3814526 分機:13101</p>
        <p>第一圖書館：824005高雄市燕巢區大學路1號 電話:07-6011000 分機:31591、31599</p>
        <p className="mt-2 text-gray-400">&copy; 2025 圖書管理系統. All rights reserved.</p>
      </div>
    </footer>
  );
};

// ----------------------------------------------------
// App: 主要應用程式組件
// ----------------------------------------------------
function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 當前頁面
  const [currentUser, setCurrentUser] = useState({ id: null, username: null }); // 全局用戶狀態

  // 在應用程式加載時檢查本地儲存中的用戶資訊
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    if (userId && username) {
      setCurrentUser({ id: userId, username: username });
    }
  }, []);

  const loginUser = (id, username) => {
    setCurrentUser({ id, username });
    localStorage.setItem('user_id', id);
    localStorage.setItem('username', username);
  };

  const logoutUser = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    setCurrentUser({ id: null, username: null });
    // 登出後跳轉回首頁
    setCurrentPage('home');
  };

  // 根據 currentPage 渲染不同的組件
  const renderPage = () => {
    // 當 currentPage 是一個物件時 (例如 { name: 'edit_book', params: { bookId: 123 } })
    if (typeof currentPage === 'object' && currentPage !== null) {
      switch (currentPage.name) {
        case 'edit_book':
          if (currentUser.username === 'yucheng' && currentPage.params && currentPage.params.bookId) {
            return <BookEdit setCurrentPage={setCurrentPage} bookId={currentPage.params.bookId} />;
          }
          return <Home setCurrentPage={setCurrentPage} />;
        default:
          // 如果物件中的名稱沒有匹配，則回到 home
          return <Home setCurrentPage={setCurrentPage} />;
      }
    }

    // 當 currentPage 是一個字串時 (原有的邏輯)
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'login':
        return <Login setCurrentPage={setCurrentPage} />;
      case 'register':
        return <Register setCurrentPage={setCurrentPage} />;
      case 'user_home':
        if (currentUser.id) {
          return <UserHome setCurrentPage={setCurrentPage} />;
        }
        return <Login setCurrentPage={setCurrentPage} />;
      case 'book_list':
        return <BookList setCurrentPage={setCurrentPage} />;
      case 'book_create':
        // 只有當用戶名是 'yucheng' 時才能訪問
        if (currentUser.username === 'yucheng') {
          return <BookCreate setCurrentPage={setCurrentPage} />;
        }
        return <Home setCurrentPage={setCurrentPage} />;
      case 'edit_profile':
        if (currentUser.id) {
          return <EditProfile setCurrentPage={setCurrentPage} />;
        }
        return <Login setCurrentPage={setCurrentPage} />;
      case 'quick_scan': // <-- 新增的快速掃描頁面路由
        if (currentUser.id) { // 只有登入用戶才能使用掃描功能
          return <QuickScanPage setCurrentPage={setCurrentPage} />;
        }
        return <Login setCurrentPage={setCurrentPage} />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loginUser, logoutUser }}>
      <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800 font-sans">
        <Header setCurrentPage={setCurrentPage} currentUser={currentUser} logoutUser={logoutUser} />
        <main className="flex-grow p-4 md:p-8">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </AuthContext.Provider>
  );
}

export default App;
