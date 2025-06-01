import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'; // 引入 useCallback

// 創建一個Context來管理全局使用者狀態
const AuthContext = createContext(null);

// 訊息顯示組件
const MessageDisplay = ({ message, type }) => {
  if (!message) return null;
  return (
    <div className={`p-3 rounded-md text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} mb-4`}>
      {message}
    </div>
  );
};

// 首頁組件
const Home = ({ setCurrentPage }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">圖書館首頁</h1>
        <p className="text-lg text-gray-600 mb-8">歡迎來到我們的圖書館系統！</p>
        <div className="space-y-4">
          <button
            onClick={() => setCurrentPage('login')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            登入
          </button>
          <button
            onClick={() => setCurrentPage('user_home')}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            借還書紀錄
          </button>
          <button
            onClick={() => setCurrentPage('book_list')}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            館藏查詢
          </button>
          <button
            onClick={() => alert('客服諮詢功能開發中')} // 簡單的提示
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            客服諮詢
          </button>
        </div>
      </div>
    </div>
  );
};

// 登入組件
const Login = ({ setCurrentPage }) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { loginUser } = useContext(AuthContext);

  const handleSubmit = async (action) => {
    setMessage(''); // 清除之前的訊息
    setMessageType('');

    if (!account || !password) {
      setMessage('請輸入帳號與密碼');
      setMessageType('error');
      return;
    }

    const apiUrl = action === 'login' ? '/api/login/' : '/api/register/'; // 確保 API URL 正確

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: account, password: password }), // 根據後端 API 調整鍵名
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || (action === 'login' ? `歡迎：${account}` : '註冊成功'));
        setMessageType('success');
        loginUser(data.user_id, data.username); // 更新全局狀態
        if (data.username === 'admin' && action === 'login') {
          setCurrentPage('book_create');
        } else {
          setCurrentPage('user_home');
        }
      } else {
        setMessage(data.message || '操作失敗');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`網路錯誤：${error.message}`);
      setMessageType('error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">登入</h2>
        <MessageDisplay message={message} type={messageType} />
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="account">
              帳號
            </label>
            <input
              type="text"
              id="account"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              密碼
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => handleSubmit('login')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              登入
            </button>
            <p className="text-center text-gray-600">還沒有帳號嗎？
              <button
                onClick={() => setCurrentPage('register')}
                className="text-blue-500 hover:underline ml-1"
              >
                註冊新帳號
              </button>
            </p>
            <button
              onClick={() => setCurrentPage('home')}
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              返回首頁
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 註冊組件
const Register = ({ setCurrentPage }) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { loginUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // 清除之前的訊息
    setMessageType('');

    if (!account || !password) {
      setMessage('請輸入帳號與密碼');
      setMessageType('error');
      return;
    }

    try {
      const response = await fetch('/api/register/', { // 確保 API URL 正確
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: account, password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || '註冊成功');
        setMessageType('success');
        loginUser(data.user_id, data.username);
        setCurrentPage('user_home');
      } else {
        setMessage(data.message || '註冊失敗');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`網路錯誤：${error.message}`);
      setMessageType('error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">註冊</h2>
        <MessageDisplay message={message} type={messageType} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reg_account">
              帳號
            </label>
            <input
              type="text"
              id="reg_account"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reg_password">
              密碼
            </label>
            <input
              type="password"
              id="reg_password"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              註冊
            </button>
            <p className="text-center text-gray-600">已有帳號？
              <button
                onClick={() => setCurrentPage('login')}
                className="text-blue-500 hover:underline ml-1"
              >
                登入
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// 使用者主頁組件
const UserHome = ({ setCurrentPage }) => {
  const { currentUser, logoutUser } = useContext(AuthContext);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);

  // 使用 useCallback 包裹 fetchUserData，並將其作為 useEffect 的依賴
  const fetchUserData = useCallback(async () => {
    if (!currentUser.id) {
      setCurrentPage('login'); // 如果沒有用戶ID，跳轉到登入頁面
      return;
    }
    setLoading(true);
    setMessage(''); // 清除之前的訊息
    setMessageType('');
    try {
      // 假設有 /api/user_home/ 端點，返回用戶借閱記錄
      // 在前後端分離中，user_id 通常會從認證 token 中解析，而不是作為 URL 參數
      const response = await fetch(`/api/user_home/?user_id=${currentUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setBorrowedBooks(data.borrowed_books);
        setAllRecords(data.all_records);
      } else {
        setMessage(data.message || '無法載入使用者資料');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`網路錯誤：${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id, setCurrentPage]); // 依賴 currentUser.id 和 setCurrentPage

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); // 將 fetchUserData 加入依賴陣列

  const handleReturnBook = async (recordId, bookTitle) => {
    setMessage(''); // 清除之前的訊息
    setMessageType('');

    // 替代 window.confirm
    if (!window.confirm(`確定要歸還書籍 "${bookTitle}" 嗎？`)) {
        return;
    }

    try {
      // 假設有 /api/books/return/<record_id>/ 端點
      const response = await fetch(`/api/books/return/${recordId}/`, {
        method: 'POST', // 或 'PUT'
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ user_id: currentUser.id }), // 如果後端需要 user_id
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || '書籍已成功歸還');
        setMessageType('success');
        // 重新載入數據以更新 UI
        fetchUserData();
      } else {
        setMessage(data.message || '歸還失敗');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`網路錯誤：${error.message}`);
      setMessageType('error');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">載入中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">歡迎，{currentUser.username}！</h2>
        <MessageDisplay message={message} type={messageType} />

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentPage('book_list')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            瀏覽所有書籍
          </button>
          <button
            onClick={() => { logoutUser(); setCurrentPage('home'); }}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            登出
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">您當前借閱的書籍：</h3>
          {borrowedBooks.length > 0 ? (
            <ul className="space-y-3">
              {borrowedBooks.map((record) => (
                <li key={record.id} className="bg-blue-50 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-800">{record.book_title}</p>
                    <p className="text-sm text-gray-600">借閱日期: {new Date(record.borrow_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">應還日期: {new Date(record.due_date).toLocaleDateString()}</p>
                    {record.is_overdue && <strong className="text-red-600 text-sm">(逾期)</strong>}
                  </div>
                  <button
                    onClick={() => handleReturnBook(record.id, record.book_title)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out mt-2 sm:mt-0"
                  >
                    歸還
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">目前沒有借閱中的書籍。</p>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">所有借閱記錄：</h3>
          {allRecords.length > 0 ? (
            <ul className="space-y-3">
              {allRecords.map((record) => (
                <li key={record.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <p className="text-lg font-medium text-gray-800">{record.book_title}</p>
                  <p className="text-sm text-gray-600">借閱日期: {new Date(record.borrow_date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">
                    歸還狀態: <span className={record.returned ? 'text-green-600' : 'text-red-600'}>{record.returned ? '已歸還' : '未歸還'}</span>
                  </p>
                  {record.returned && record.return_date && <p className="text-sm text-gray-600">歸還日期: {new Date(record.return_date).toLocaleDateString()}</p>}
                  {record.is_overdue && <strong className="text-red-600 text-sm">(逾期)</strong>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">沒有任何借閱記錄。</p>
          )}
        </div>
      </div>
    </div>
  );
};

// 書籍列表組件
const BookList = ({ setCurrentPage }) => {
  const { currentUser } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);

  // 使用 useCallback 包裹 fetchBooks，並將其作為 useEffect 的依賴
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setMessage(''); // 清除之前的訊息
    setMessageType('');
    try {
      // 假設有 /api/books/ 端點
      const booksResponse = await fetch('/api/books/');
      const booksData = await booksResponse.json();
      if (booksResponse.ok) {
        setBooks(booksData.books);
      } else {
        setMessage(booksData.message || '無法載入書籍列表');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`網路錯誤：${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }, []); // 這個函數不依賴於組件的 props 或 state，所以依賴陣列為空

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]); // 將 fetchBooks 加入依賴陣列

  const handleBorrowBook = async (bookId, bookTitle) => {
    setMessage(''); // 清除之前的訊息
    setMessageType('');

    if (!currentUser.id) {
      setMessage('請先登入才能借閱書籍');
      setMessageType('error');
      setCurrentPage('login');
      return;
    }

    // 替代 window.confirm
    if (!window.confirm(`確定要借閱書籍 "${bookTitle}" 嗎？`)) {
        return;
    }

    try {
      // 假設有 /api/books/borrow/<book_id>/ 端點
      const response = await fetch(`/api/books/borrow/${bookId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id }), // 將 user_id 傳遞給後端
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || '借閱成功');
        setMessageType('success');
        // 重新載入數據以更新 UI
        fetchBooks();
      } else {
        setMessage(data.message || '借閱失敗');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`網路錯誤：${error.message}`);
      setMessageType('error');
    }
  };

  const handleDeleteBook = async (bookId, bookTitle) => {
    setMessage(''); // 清除之前的訊息
    setMessageType('');

    if (currentUser.username !== 'admin') {
      setMessage('只有管理員才能刪除書籍');
      setMessageType('error');
      return;
    }
    // 替代 window.confirm
    if (!window.confirm(`確定要刪除書籍 "${bookTitle}" 嗎？這將無法復原！`)) {
        return;
    }

    try {
      // 假設有 /api/books/delete/<book_id>/ 端點
      const response = await fetch(`/api/books/delete/${bookId}/`, {
        method: 'DELETE', // 刪除操作通常使用 DELETE 方法
        headers: { 'Content-Type': 'application/json' },
        // 如果後端需要，可能需要傳遞 user_id 或認證 token
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || '書籍已成功刪除');
        setMessageType('success');
        fetchBooks(); // 重新載入書籍列表
      } else {
        setMessage(data.message || '刪除失敗');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`網路錯誤：${error.message}`);
      setMessageType('error');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">載入中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">圖書館書籍清單</h2>
        <MessageDisplay message={message} type={messageType} />

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
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
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-lg text-sm shadow-md transition duration-300 ease-in-out"
                        >
                          借閱
                        </button>
                      )}
                      {currentUser.username === 'admin' && (
                        <button
                          onClick={() => handleDeleteBook(book.id, book.title)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg text-sm shadow-md transition duration-300 ease-in-out"
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
          <p className="text-gray-600 text-center">目前沒有書籍。</p>
        )}
      </div>
    </div>
  );
};

// 新增書籍組件 (僅限管理員)
const BookCreate = ({ setCurrentPage }) => {
  const { currentUser } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // 只有管理員才能訪問此頁面
  useEffect(() => {
    if (currentUser.username !== 'admin') {
      setMessage('您沒有權限訪問此頁面。');
      setMessageType('error');
      setCurrentPage('home'); // 或重定向到其他頁面
    }
  }, [currentUser.username, setCurrentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // 清除之前的訊息
    setMessageType('');

    if (!title || !author || !isbn) {
      setMessage('請填寫所有欄位');
      setMessageType('error');
      return;
    }

    try {
      // 假設有 /api/books/create/ 端點
      const response = await fetch('/api/books/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, author, isbn }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || '書籍新增成功');
        setMessageType('success');
        setTitle('');
        setAuthor('');
        setIsbn('');
        // 新增成功後不直接跳轉，而是讓用戶決定
        // setCurrentPage('book_list'); // 如果需要自動跳轉
      } else {
        setMessage(data.message || '新增失敗');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`網路錯誤：${error.message}`);
      setMessageType('error');
    }
  };

  if (currentUser.username !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <MessageDisplay message={message} type={messageType} />
          <button
            onClick={() => setCurrentPage('home')}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">新增書籍</h2>
        <MessageDisplay message={message} type={messageType} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="book_title">
              書名
            </label>
            <input
              type="text"
              id="book_title"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="book_author">
              作者
            </label>
            <input
              type="text"
              id="book_author"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="book_isbn">
              ISBN
            </label>
            <input
              type="text"
              id="book_isbn"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              新增書籍
            </button>
            <button
              onClick={() => setCurrentPage('book_list')}
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              返回書籍列表
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// 主應用程式組件
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentUser, setCurrentUser] = useState({ id: null, username: null });

  // 在應用程式載入時檢查 localStorage 中的用戶狀態
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
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'login':
        return <Login setCurrentPage={setCurrentPage} />;
      case 'register':
        return <Register setCurrentPage={setCurrentPage} />;
      case 'user_home':
        // 只有登入用戶才能訪問用戶主頁
        if (currentUser.id) {
          return <UserHome setCurrentPage={setCurrentPage} />;
        }
        return <Login setCurrentPage={setCurrentPage} />; // 未登入則導向登入頁面
      case 'book_list':
        return <BookList setCurrentPage={setCurrentPage} />;
      case 'book_create':
        // 只有管理員才能訪問新增書籍頁面
        if (currentUser.username === 'admin') {
          return <BookCreate setCurrentPage={setCurrentPage} />;
        }
        return <Home setCurrentPage={setCurrentPage} />; // 非管理員導向首頁
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loginUser, logoutUser }}>
      {renderPage()}
    </AuthContext.Provider>
  );
}
