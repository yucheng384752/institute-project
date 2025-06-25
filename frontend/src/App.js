import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // 引入 QRCode.react 的具名匯出 QRCodeCanvas
import jsQR from 'jsqr'; // 引入 jsQR 庫 (假設已正確安裝並可直接引入)

// AuthContext: 用於管理全局使用者狀態
export const AuthContext = createContext(null);

// 定義書籍分類選項 (與 Django models.py 中的 CATEGORY_CHOICES 保持一致)
const CATEGORY_OPTIONS = [
  { value: 'SCIENCE', label: '科學' },
  { value: 'LANGUAGE', 'label': '語言' },
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
  { value: 'LOST', 'label': '遺失' },
];

// MessageDisplay: 訊息顯示組件  
const MessageDisplay = ({ message, type }) => {
  if (!message) return null;
  return (
    <div className={`p-3 rounded-md text-white ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} mb-4 text-center shadow-sm`}>
      {message}
    </div>
  );
};

// Header: 應用程式頂部導航欄 (新增下拉選單和快速掃描按鈕)
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
          {currentUser && currentUser.id && currentUser.username === 'yucheng' && (
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

          {currentUser && currentUser.id ? (
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


// Login: 登入組件 
const Login = ({ setCurrentPage }) => {
  const { loginUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const messageTimeoutRef = useRef(null); // 新增 useRef

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
        setMessage(data.message); // 設定訊息
        setMessageType('success'); // 設定訊息類型
        loginUser(data.user_id, data.username); // 登入用戶
        // 設定一個定時器在訊息顯示後跳轉頁面
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
        }
        messageTimeoutRef.current = setTimeout(() => {
          setCurrentPage('user_home');
        }, 1500); // 1.5 秒後跳轉
      } else {
        // 錯誤處理
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
          <button type="button" onClick={() => setCurrentPage('register')} className="text-blue-500 hover:text-blue-700 font-semibold ml-1">註冊新帳號</button>
        </p>
      </div>
    </div>
  );
};

// Register: 註冊組件 
const Register = ({ setCurrentPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const messageTimeoutRef = useRef(null); // 新增 useRef
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
        setMessage(data.message); // 設定訊息
        setMessageType('success'); // 設定訊息類型
        // 設定一個定時器在訊息顯示後跳轉頁面
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
        }
        messageTimeoutRef.current = setTimeout(() => {
          setCurrentPage('login');
        }, 1500); // 1.5 秒後跳轉
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
          <button type="button" onClick={() => setCurrentPage('login')} className="text-blue-500 hover:text-blue-700 font-semibold ml-1">前往登入</button>
        </p>
      </div>
    </div>
  );
};

// UserHome: 用戶主頁 (借還書紀錄)
const UserHome = ({ setCurrentPage }) => {
  const { currentUser } = useContext(AuthContext);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const messageTimeoutRef = useRef(null); // 新增 useRef

  const sendMessage = useCallback((msg, type) => {
    setMessage(msg);
    setMessageType(type);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  }, []);

  const fetchBorrowedBooks = useCallback(async () => {
    if (!currentUser || !currentUser.id) { // 確保 currentUser 和 id 存在
      sendMessage('請先登入以查看借閱記錄', 'error');
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
        sendMessage(data.message || '無法載入借閱記錄', 'error');
      }
    } catch (error) {
      sendMessage('網路錯誤或伺服器無響應', 'error');
      console.error('獲取借閱記錄失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, sendMessage]); // 確保依賴完整

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
        sendMessage(data.message, 'success');
        // 刷新列表
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
        }
        messageTimeoutRef.current = setTimeout(() => {
          fetchBorrowedBooks();
        }, 1500); // 1.5 秒後刷新
      } else {
        sendMessage(data.message || '歸還失敗', 'error');
      }
    } catch (error) {
      sendMessage('網路錯誤或伺服器無響應', 'error');
      console.error('歸還請求失敗:', error);
    }
  };

  if (!currentUser || !currentUser.id) { // 確保 currentUser 和 id 存在
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

// BookList: 館藏查詢
const BookList = ({ setCurrentPage }) => {
  const { currentUser } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const messageTimeoutRef = useRef(null); // 新增 useRef

  const sendMessage = useCallback((msg, type) => {
    setMessage(msg);
    setMessageType(type);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/books/');
      const data = await response.json();
      if (response.ok) {
        setBooks(data.books);
      } else {
        sendMessage(data.message || '無法載入書籍列表', 'error');
      }
    } catch (error) {
      sendMessage('網路錯誤或伺服器無響應', 'error');
      console.error('獲取書籍列表失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [sendMessage]); // 確保依賴完整

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleBorrowBook = async (bookId, bookTitle) => {
    if (!currentUser || !currentUser.id) { // 確保 currentUser 和 id 存在
      sendMessage('請先登入才能借閱書籍', 'error');
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
        sendMessage(data.message, 'success');
        // 刷新列表以顯示借閱狀態
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
        }
        messageTimeoutRef.current = setTimeout(() => {
          fetchBooks();
        }, 1500); // 1.5 秒後刷新
      } else {
        sendMessage(data.message || '借閱失敗', 'error');
      }
    } catch (error) {
      sendMessage('網路錯誤或伺服器無響應', 'error');
      console.error('借閱請求失敗:', error);
    }
  };

  const handleDeleteBook = async (bookId, bookTitle) => {
    setMessage(null);
    // 判斷是否為 'yucheng' 進行刪除
    if (!currentUser || currentUser.username !== 'yucheng') { // 確保 currentUser 存在
      sendMessage('只有管理員 (yucheng) 才能刪除書籍', 'error');
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
        sendMessage(data.message, 'success');
        // 重新載入書籍列表
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
        }
        messageTimeoutRef.current = setTimeout(() => {
          fetchBooks();
        }, 1500); // 1.5 秒後刷新
      } else {
        sendMessage(data.message || '刪除失敗', 'error');
      }
    } catch (error) {
      sendMessage('網路錯誤或伺服器無響應', 'error');
      console.error('刪除書籍請求失敗:', error);
    }
  };

  const handleEditBook = (bookId) => {
    setCurrentPage({ name: 'edit_book', params: { bookId: bookId } });
  };

  const handleUpdateBookStatus = async (bookId, newStatus) => {
    setMessage(null);
    if (!currentUser || currentUser.username !== 'yucheng') { // 確保 currentUser 存在
        sendMessage('只有管理員 (yucheng) 才能更改書籍狀態', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/books/update_status/${bookId}/`, {
            method: 'PUT', // 使用 PUT 請求
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': 'your-csrf-token' }, // 確保有 CSRF Token
            body: JSON.stringify({ status: newStatus }),
        });
        const data = await response.json();

        if (response.ok) {
            sendMessage(data.message, 'success');
            // 刷新列表以顯示新狀態
            if (messageTimeoutRef.current) {
              clearTimeout(messageTimeoutRef.current);
            }
            messageTimeoutRef.current = setTimeout(() => {
              fetchBooks();
            }, 1500); // 1.5 秒後刷新
        } else {
            sendMessage(data.message || '更新書籍狀態失敗', 'error');
        }
    } catch (error) {
        sendMessage('網路錯誤或伺服器無響應', 'error');
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
          {currentUser && currentUser.username === 'yucheng' && ( // 確保 currentUser 存在
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
                      {currentUser && currentUser.username === 'yucheng' ? ( // 確保 currentUser 存在
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
                        currentUser && currentUser.id && book.status === 'AVAILABLE' && ( // 確保 currentUser 存在
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

// ===========================================
// 新增組件: BookQRCodeGenerator (書籍 QR Code 生成器)
// ===========================================
const BookQRCodeGenerator = ({ isbn }) => {
  if (!isbn) {
    return <p className="text-red-500">沒有書籍 ISBN 無法生成 QR Code。</p>;
  }

  // 使用 ISBN，因為掃描器預期會得到 ISBN
  const qrCodeValue = isbn;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-center">
      <h4 className="text-lg font-semibold mb-2">書籍 QR Code (ISBN: {isbn})</h4>
      <div className="flex justify-center">
        <QRCodeCanvas value={qrCodeValue} size={128} level="H" includeMargin={true} /> {/* 修改為 QRCodeCanvas */}
      </div>
      <p className="mt-2 text-sm text-gray-600">掃描此 QR Code 以快速查找書籍。</p>
    </div>
  );
};

// BookCreate: 新增書籍 
const BookCreate = ({ setCurrentPage }) => {
  const { currentUser } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [createdBookIsbn, setCreatedBookIsbn] = useState(null); // 用於儲存新建立書籍的 ISBN
  const messageTimeoutRef = useRef(null);

  useEffect(() => {
    if (!currentUser || currentUser.username !== 'yucheng') { // 確保 currentUser 存在
      setMessage('您沒有權限訪問此頁面。');
      setMessageType('error');
      setCurrentPage('home');
    }
  }, [currentUser, setCurrentPage]); // 確保依賴完整

  const handleSubmit = async (e) => {
    e.preventDefault(); // 阻止表單預設提交行為
    setMessage(null);
    setCreatedBookIsbn(null); // 每次提交前清空 QR Code

    if (!title || !author || !isbn || !category || !status) { // 檢查所有欄位是否都填寫
      setMessage('請填寫所有欄位');
      setMessageType('error');
      return;
    }

    try { // 發送 POST 請求新增書籍
      const response = await fetch('/api/books/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, author, isbn, category, status }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message); // 設定成功訊息
        setMessageType('success'); // 設定訊息類型
        setCreatedBookIsbn(isbn); // 設定新建立書籍的 ISBN 以顯示 QR Code
        
        // 清空表單欄位
        setTitle(''); 
        setAuthor('');
        setIsbn('');
        setCategory(CATEGORY_OPTIONS[0].value); // 重置分類為預設值
        setStatus(STATUS_OPTIONS[0].value); // 重置狀態為預設值
        
        // 這裡不再立即跳轉，讓用戶看到 QR Code
        // setTimeout(() => setCurrentPage('book_list'), 1500);
      } else {
        setMessage(data.message || '新增書籍失敗'); // 設定錯誤訊息
        setMessageType('error');
      }
    } catch (error) {
      setMessage('網路錯誤或伺服器無響應');
      setMessageType('error');
      console.error('新增書籍請求失敗:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">新增書籍</h1>
        {message && <MessageDisplay message={message} type={messageType} /> /* 顯示訊息 */}
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
      {/* 顯示生成的 QR Code */}
      {createdBookIsbn && (
        <div className="mt-8"> {/* 顯示 QR Code 的容器 */}
          <BookQRCodeGenerator isbn={createdBookIsbn} /> {/* QR Code 生成組件 */}
          <div className="flex justify-center mt-4"> {/* 按鈕居中 */}
            <button 
              onClick={() => setCurrentPage('book_list')} 
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            > 
              返回書籍列表 
            </button> 
          </div> 
        </div>
      )}
    </div>
  );
};


// BookEdit: 編輯書籍 
const BookEdit = ({ setCurrentPage, bookId }) => {
  const { currentUser } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const messageTimeoutRef = useRef(null); // 新增 useRef

  // 用於發送訊息的輔助函數 (新增在組件內部)
  const sendMessage = useCallback((msg, type) => {
    setMessage(msg);
    setMessageType(type);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  }, []);

  // 包裹 fetchBookDetails 在 useCallback 中
  const fetchBookDetails = useCallback(async () => {
    if (!bookId) {
      sendMessage('未提供書籍 ID。', 'error'); // 使用內部定義的 sendMessage
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
        setStatus(data.book.status || STATUS_OPTIONS[0].value); 
      } else {
        sendMessage(data.message || '無法載入書籍詳細資訊', 'error'); // 使用內部定義的 sendMessage
      }
    } catch (error) {
      sendMessage('網路錯誤或伺服器無響應', 'error'); // 使用內部定義的 sendMessage
      console.error('獲取書籍詳細資訊失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [bookId, setCurrentPage, sendMessage]); // 將 sendMessage 加入依賴

  useEffect(() => {
    // 檢查權限
    if (!currentUser || currentUser.username !== 'yucheng') { // 確保 currentUser 存在
      setMessage('您沒有權限訪問此頁面。');
      setMessageType('error');
      setCurrentPage('home');
      return;
    }

    fetchBookDetails(); // 調用 memoized 的 fetchBookDetails
  }, [bookId, currentUser, setCurrentPage, fetchBookDetails]); // 將 fetchBookDetails 加入依賴

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!title || !author || !isbn || !category || !status) { // 檢查所有欄位
      sendMessage('請填寫所有欄位', 'error'); // 使用內部定義的 sendMessage
      return;
    }

    try {
      const response = await fetch(`/api/books/update/${bookId}/`, {
        method: 'PUT', // 使用 PUT 請求進行更新
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, author, isbn, category, status }), 
      });
      const data = await response.json();

      if (response.ok) {
        sendMessage(data.message, 'success'); // 使用內部定義的 sendMessage
        setTitle(''); // 清空書名
        setAuthor(''); // 清空作者
        setIsbn('');  // 清空 ISBN
        setCategory('OTHER'); // 重置分類為預設值
        setStatus('AVAILABLE'); // 重置狀態為預設值
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
        }
        messageTimeoutRef.current = setTimeout(() => {
          setCurrentPage('book_list');
        }, 1500);
      } else {
        sendMessage(data.message || '更新書籍失敗', 'error'); // 使用內部定義的 sendMessage
      }
    } catch (error) {
      sendMessage('網路錯誤或伺服器無響應', 'error'); // 使用內部定義的 sendMessage
      console.error('更新書籍請求失敗:', error);
    }
  };

  if (!currentUser || currentUser.username !== 'yucheng') { // 確保 currentUser 存在
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          <p className="text-gray-600 text-lg">載入中...</p>
        </div>
      </div>
    );
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


// EditProfile: 使用者更改資訊組件
const EditProfile = ({ setCurrentPage }) => {
  const { currentUser } = useContext(AuthContext);
  const [currentUsername, setCurrentUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const messageTimeoutRef = useRef(null); // 新增 useRef

  // 初次載入時只顯示用戶名
  useEffect(() => {
    if (!currentUser || !currentUser.id) { // 確保 currentUser 存在
      setCurrentPage('login'); // 未登入則跳轉登入
      return;
    }
    
    setCurrentUsername(currentUser.username);
    setLoading(false); // 設置為不載入
  }, [currentUser, setCurrentPage]); // 確保依賴完整

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!currentUser || !currentUser.id) { // 確保 currentUser 存在
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

    // 添加密碼複雜度檢查
    if (newPassword.length < 6) {
      setMessage('密碼長度至少為 6 個字元。');
      setMessageType('error');
      return;
    }

    try {
      // 調用後端 API 更新用戶資訊 
      const response = await fetch('/api/user/update_profile/', {
        method: 'POST', // 或 PUT
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id, // 傳遞用戶 ID
          username: currentUser.username, // 傳遞用戶名 
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || '個人資料更新成功！');
        setMessageType('success');
        setNewPassword('');
        setConfirmPassword('');
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
        }
        messageTimeoutRef.current = setTimeout(() => {
          setCurrentPage('user_home');
        }, 1500);
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

// ===========================================
// 新增組件: BookDetail (書籍詳細資訊頁面)
// 用於顯示單本書籍的詳細資訊，可從掃描頁面跳轉過來
// ===========================================
const BookDetail = ({ setCurrentPage, identifier }) => {
  const { currentUser } = useContext(AuthContext);
  const [book, setBook] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const messageTimeoutRef = useRef(null);

  const sendMessage = useCallback((msg, type) => {
    setMessage(msg);
    setMessageType(type);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  }, []);

  useEffect(() => {
    const fetchBook = async () => {
      if (!identifier) {
        sendMessage('未提供書籍識別碼', 'error');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/books/${identifier}/`);
        const data = await response.json();
        if (response.ok) {
          setBook(data.book);
          sendMessage('成功載入書籍資訊', 'success');
        } else {
          sendMessage(data.message || '找不到書籍', 'error');
          setBook(null);
        }
      } catch (error) {
        sendMessage('網路錯誤或無法載入書籍資訊', 'error');
        setBook(null);
        console.error('獲取書籍詳情失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [identifier, sendMessage]); // 加入 identifier 到依賴陣列

  const handleBorrowBook = async () => {
    if (!currentUser || !currentUser.id) {
      sendMessage('請先登入才能借閱書籍', 'error');
      setCurrentPage('login');
      return;
    }
    if (!book || book.status !== 'AVAILABLE') {
      sendMessage('該書籍目前無法借閱', 'error');
      return;
    }

    if (window.confirm(`確定要借閱 "${book.title}" 嗎？`)) {
      try {
        const response = await fetch(`/api/books/borrow/${book.id}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: currentUser.id }),
        });
        const data = await response.json();
        if (response.ok) {
          sendMessage('借閱成功', 'success');
          // 刷新書籍狀態
          setBook(prevBook => ({ ...prevBook, status: 'BORROWED', is_borrowed: true })); // 假設後端會更新這些狀態
        } else {
          sendMessage(data.message || '借閱失敗', 'error');
        }
      } catch (error) {
        console.error('借閱書籍錯誤:', error);
        sendMessage('網絡或伺服器錯誤', 'error');
      }
    }
  };

  const handleReturnBook = async () => {
    if (!currentUser || !currentUser.id) {
      sendMessage('請先登入才能歸還書籍', 'error');
      setCurrentPage('login');
      return;
    }
    if (!book || book.status === 'AVAILABLE') {
      sendMessage('該書籍未被借閱，無需歸還', 'error');
      return;
    }

    if (window.confirm(`確定要歸還 "${book.title}" 嗎？`)) {
      try {
        // 使用新增的根據書籍ID和用戶ID歸還的API
        const response = await fetch(`/api/books/return_by_book_and_user/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ book_id: book.id, user_id: currentUser.id }),
        });
        const data = await response.json();
        if (response.ok) {
          sendMessage('歸還成功', 'success');
          // 刷新書籍狀態
          setBook(prevBook => ({ ...prevBook, status: 'AVAILABLE', is_borrowed: false })); // 假設後端會更新這些狀態
        } else {
          sendMessage(data.message || '歸還失敗', 'error');
        }
      } catch (error) {
        console.error('歸還書籍錯誤:', error);
        sendMessage('網絡或伺服器錯誤', 'error');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-120px)] text-xl">載入中...</div>;
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">書籍不存在</h2>
          <MessageDisplay message={message} type={messageType} />
          <button
            onClick={() => setCurrentPage('quick_scan')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            返回掃描頁面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">書籍詳細資訊</h2>
        {message && <MessageDisplay message={message} type={messageType} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <p><strong>書名:</strong> {book.title}</p>
          <p><strong>作者:</strong> {book.author}</p>
          <p><strong>ISBN:</strong> {book.isbn}</p>
          <p><strong>分類:</strong> {CATEGORY_OPTIONS.find(cat => cat.value === book.category)?.label || book.category}</p>
          <p><strong>出版社:</strong> {book.publisher || 'N/A'}</p>
          <p><strong>出版年份:</strong> {book.publication_year || 'N/A'}</p>
          <p className="md:col-span-2">
            <strong>狀態:</strong> <span className={`font-semibold ${book.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-600'}`}>
              {STATUS_OPTIONS.find(s => s.value === book.status)?.label || book.status}
            </span>
          </p>
          <p className="md:col-span-2"><strong>描述:</strong> {book.description || '無描述'}</p>
        </div>

        {currentUser && currentUser.id && (
          <div className="flex justify-center gap-4 mt-6">
            {book.status === 'AVAILABLE' ? (
              <button
                onClick={handleBorrowBook}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
              >
                借閱書籍
              </button>
            ) : (
              <button
                onClick={handleReturnBook}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
              >
                歸還書籍
              </button>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => setCurrentPage('quick_scan')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            返回掃描頁面
          </button>
          <button
            onClick={() => setCurrentPage('book_list')}
            className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            返回書籍列表
          </button>
        </div>
      </div>
    </div>
  );
};

const QuickScanPage = ({ setCurrentPage }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [decodedText, setDecodedText] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [scanning, setScanning] = useState(false);
  const scanIntervalRef = useRef(null);
  const messageTimeoutRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // 新增：防止重複處理

  const { currentUser } = useContext(AuthContext);

  // 發送訊息的輔助函數
  const sendMessage = useCallback((msg, type) => {
    console.log(`訊息 (${type.toUpperCase()}): ${msg}`);
    setMessage(msg);
    setMessageType(type);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  }, []);

  // 停止攝影機功能
  const stopCamera = useCallback(() => {
    console.log("停止攝影機中...");
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      console.log("視訊流已停止。");
    }
    setScanning(false);
    setIsProcessing(false); // 重置處理狀態
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
      console.log("掃描定時器已清除。");
    }
    sendMessage('攝影機已停止', 'info');
    setDecodedText('');
  }, [sendMessage]);

  // 改進的 QR Code 解碼函數
  const decodeQRCodeFromCamera = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // 檢查基本條件
    if (!scanning || !video || !canvas || isProcessing) {
      return;
    }

    // 檢查視頻就緒狀態
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      console.log("Video not ready yet, skipping frame");
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (width === 0 || height === 0) {
      console.log(`Invalid video dimensions: ${width}x${height}`);
      return;
    }

    setIsProcessing(true); // 設置處理狀態

    try {
      const ctx = canvas.getContext('2d');
      
      // 設置 Canvas 尺寸
      canvas.width = width;
      canvas.height = height;

      // 繪製當前幀到 Canvas
      ctx.drawImage(video, 0, 0, width, height);
      
      // 獲取圖像數據
      const imageData = ctx.getImageData(0, 0, width, height);
      
      // 檢查 jsQR 是否可用
      if (typeof jsQR === 'undefined') {
        console.error('jsQR library not found. Please install jsqr package.');
        sendMessage('QR Code 掃描庫未載入，請重新整理頁面', 'error');
        stopCamera();
        return;
      }

      // 使用 jsQR 解碼
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert", // 優化性能
      });

      if (code && code.data) {
        console.log(`QR Code 掃描成功: ${code.data}`);
        setDecodedText(code.data);
        sendMessage(`掃描成功：${code.data}`, 'success');
        
        // 停止掃描並導航
        stopCamera();
        setTimeout(() => {
          setCurrentPage({ name: 'book_detail', params: { identifier: code.data } });
        }, 500); // 稍微延遲以顯示成功消息
      }
    } catch (err) {
      console.error('QR Code 解碼錯誤:', err);
      
      // 只有在嚴重錯誤時才顯示錯誤消息
      if (err.name === 'SecurityError' || err.name === 'InvalidStateError') {
        sendMessage('掃描過程中發生錯誤，請重試', 'error');
        stopCamera();
      }
    } finally {
      setIsProcessing(false); // 重置處理狀態
    }
  }, [scanning, isProcessing, stopCamera, sendMessage, setCurrentPage]);

  // 啟動攝影機功能（改進版）
  const startCamera = async () => {
    if (!selectedCameraId) {
      sendMessage('請選擇一個攝影機', 'error');
      return;
    }

    // 檢查 jsQR 庫
    if (typeof jsQR === 'undefined') {
      sendMessage('QR Code 掃描庫未載入，請確保已正確安裝 jsqr 套件', 'error');
      return;
    }

    stopCamera(); // 停止現有流
    console.log("啟動攝影機，ID:", selectedCameraId);

    try {
      // 請求媒體流時使用更寬鬆的約束條件
      const constraints = {
        video: {
          deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          facingMode: 'environment' // 優先使用後置攝像頭
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // 監聽視頻載入事件
        const handleLoadedData = () => {
          console.log(`攝影機已啟動，解析度: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
          
          // 啟動掃描
          setScanning(true);
          sendMessage('攝影機已啟動，正在掃描... 請將 QR Code 置於框內', 'info');
          
          // 使用較長的間隔以提高穩定性
          if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = setInterval(decodeQRCodeFromCamera, 700); // 改為 300ms
          
          // 移除事件監聽器
          videoRef.current.removeEventListener('loadeddata', handleLoadedData);
        };

        videoRef.current.addEventListener('loadeddata', handleLoadedData);
        
        // 設置錯誤處理
        videoRef.current.addEventListener('error', (e) => {
          console.error('Video error:', e);
          sendMessage('影片載入失敗', 'error');
          stopCamera();
        });

        await videoRef.current.play();
      }
    } catch (err) {
      console.error('啟動攝影機失敗:', err);
      
      // 更詳細的錯誤處理
      let errorMessage = '無法啟動攝影機：';
      switch (err.name) {
        case 'NotAllowedError':
          errorMessage += '您已拒絕攝影機權限。請在瀏覽器設定中啟用攝影機權限。';
          break;
        case 'NotFoundError':
          errorMessage += '找不到指定的攝影機設備。';
          break;
        case 'NotReadableError':
          errorMessage += '攝影機正在被其他應用程式使用。';
          break;
        case 'OverconstrainedError':
          errorMessage += '攝影機不支援請求的設定。';
          break;
        case 'SecurityError':
          errorMessage += '安全性限制。請確保在 HTTPS 環境下使用。';
          break;
        default:
          errorMessage += err.message || '未知錯誤';
      }
      
      sendMessage(errorMessage, 'error');
      setScanning(false);
    }
  };

  // 獲取攝影機列表
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        // 請求權限
        await navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            // 立即停止流
            stream.getTracks().forEach(track => track.stop());
          });

        // 枚舉設備
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        
        setCameras(videoDevices);
        
        if (videoDevices.length > 0) {
          // 優先選擇後置攝像頭
          const backCamera = videoDevices.find(camera => 
            camera.label.toLowerCase().includes('back') || 
            camera.label.toLowerCase().includes('rear') ||
            camera.label.toLowerCase().includes('environment')
          );
          
          setSelectedCameraId(backCamera ? backCamera.deviceId : videoDevices[0].deviceId);
          console.log(`找到 ${videoDevices.length} 個攝影機`);
        } else {
          sendMessage('未找到任何攝影機設備', 'error');
        }
      } catch (err) {
        console.error('獲取攝影機列表失敗:', err);
        sendMessage('無法獲取攝影機列表，請允許瀏覽器訪問攝影機', 'error');
      }
    };

    if (currentUser?.id) {
      fetchCameras();
    } else {
      setCurrentPage('login');
    }

    // 清理函數
    return () => {
      stopCamera();
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, [currentUser, setCurrentPage, stopCamera, sendMessage]);

  // 檢查 jsQR 可用性
  useEffect(() => {
    if (typeof jsQR === 'undefined') {
      console.warn('jsQR library not detected. QR code scanning will not work.');
    }
  }, []);

  if (!currentUser?.id) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-center">快速掃描 QR Code</h2>

      <MessageDisplay message={message} type={messageType} />

      {/* 攝影機選擇 */}
      {cameras.length > 0 ? (
        <div className="mb-4">
          <label htmlFor="camera-select" className="block mb-1 font-semibold">選擇攝影機</label>
          <select
            id="camera-select"
            value={selectedCameraId}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={scanning} // 掃描時禁用選擇
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `攝影機 ${camera.deviceId.slice(0, 6)}...`}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-yellow-700">正在載入攝影機列表...</p>
        </div>
      )}

      {/* 攝影機預覽區域 */}
      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-200 h-[300px] flex justify-center items-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* 掃描框 */}
        {scanning && (
          <>
            <div className="absolute w-3/4 h-3/4 border-4 border-green-400 rounded-lg animate-pulse z-10 pointer-events-none" />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm z-20">
              {isProcessing ? '處理中...' : '掃描中...'}
            </div>
          </>
        )}
        
        {!scanning && (
          <div className="text-center z-0">
            <p className="text-gray-500 text-lg mb-2">點擊「啟動掃描」開始</p>
            <p className="text-gray-400 text-sm">請確保光線充足並將 QR Code 置於框內</p>
          </div>
        )}
      </div>

      {/* 控制按鈕 */}
      <div className="flex justify-center gap-4 mt-4">
        {!scanning ? (
          <button
            onClick={startCamera}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!selectedCameraId || cameras.length === 0}
          >
            啟動掃描
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg"
          >
            停止掃描
          </button>
        )}
      </div>

      {/* 掃描結果顯示 */}
      {decodedText && (
        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">掃描成功！</h3>
          <p className="text-green-700 font-mono break-words bg-white p-2 rounded border">
            {decodedText}
          </p>
          <p className="text-sm text-green-600 mt-2">正在跳轉至書籍詳情頁面...</p>
        </div>
      )}

      {/* 使用說明 */}
      <div className="mt-4 bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-1">使用提示：</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 確保光線充足</li>
          <li>• 將 QR Code 完整置於綠框內</li>
          <li>• 保持攝影機穩定，避免抖動</li>
          <li>• 如掃描失敗，請嘗試調整距離</li>
        </ul>
      </div>

      {/* 返回按鈕 */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setCurrentPage('user_home')}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg"
        >
          返回個人主頁
        </button>
      </div>
    </div>
  );
};



// Footer: 應用程式底部信息
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

// App: 主要應用程式組件
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
    // 當 currentPage 是一個物件時
    if (typeof currentPage === 'object' && currentPage !== null) {
      switch (currentPage.name) {
        case 'edit_book':
          if (currentUser.username === 'yucheng' && currentPage.params && currentPage.params.bookId) {
            return <BookEdit setCurrentPage={setCurrentPage} bookId={currentPage.params.bookId} />;
          }
          return <Home setCurrentPage={setCurrentPage} />;
        case 'book_detail': // 處理從 QuickScanPage 跳轉過來的書籍詳情頁面
          if (currentPage.params && currentPage.params.identifier) {
            return <BookDetail setCurrentPage={setCurrentPage} identifier={currentPage.params.identifier} />;
          }
          return <BookList setCurrentPage={setCurrentPage} />; // 如果沒有識別碼，返回書籍列表
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
        case 'quick_scan': // <-- 快速掃描頁面路由
        if (currentUser.id) { // 只有登入用戶才能使用掃描功能
          return <QuickScanPage setCurrentPage={setCurrentPage} />;
        }
        return <Login setCurrentPage={setCurrentPage} />;
      default: // 預設頁面
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
