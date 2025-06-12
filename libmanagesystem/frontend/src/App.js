import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

// ----------------------------------------------------
// AuthContext: 用於管理全局使用者狀態
// ----------------------------------------------------
export const AuthContext = createContext(null);

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
// Header: 應用程式頂部導航欄 (新增下拉選單)
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
        <h1 className="text-2xl font-semibold cursor-pointer" onClick={() => handleNavLinkClick('home')}>圖書館管理系統</h1>
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
          {currentUser.id && currentUser.username === 'admin' && (
            <button
              onClick={() => handleNavLinkClick('book_create')}
              className="px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
            >
              新增書籍 (管理員)
            </button>
          )}
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
          立即開始探索我們的豐富藏書吧！
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
    if (currentUser.username !== 'admin') {
      setMessage('只有管理員才能刪除書籍');
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
          {currentUser.username === 'admin' && (
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
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">狀態</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">{book.title}</td>
                    <td className="py-3 px-4 text-gray-800">{book.author}</td>
                    <td className="py-3 px-4 text-gray-800">{book.isbn}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${book.is_borrowed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {book.is_borrowed ? '已借出' : '可借閱'}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      {!book.is_borrowed && currentUser.id && (
                        <button
                          onClick={() => handleBorrowBook(book.id, book.title)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-sm shadow-md transition duration-300 ease-in-out"
                        >
                          借閱
                        </button>
                      )}
                      {currentUser.username === 'admin' && (
                        <button
                          onClick={() => handleDeleteBook(book.id, book.title)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm shadow-md transition duration-300 ease-in-out"
                        >
                          刪除
                        </button>
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
// BookCreate: 新增書籍 (管理員專用) (已更新 Tailwind 樣式)
// ----------------------------------------------------
const BookCreate = ({ setCurrentPage }) => {
  const { currentUser } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (currentUser.username !== 'admin') {
      setMessage('您沒有權限訪問此頁面。');
      setMessageType('error');
      setCurrentPage('home');
    }
  }, [currentUser.username, setCurrentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!title || !author || !isbn) {
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
        body: JSON.stringify({ title, author, isbn }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        setTitle('');
        setAuthor('');
        setIsbn('');
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

  if (currentUser.username !== 'admin') {
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
        if (currentUser.username === 'admin') {
          return <BookCreate setCurrentPage={setCurrentPage} />;
        }
        return <Home setCurrentPage={setCurrentPage} />;
      case 'edit_profile': // <--- 新增的路由
        if (currentUser.id) {
          return <EditProfile setCurrentPage={setCurrentPage} />;
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
