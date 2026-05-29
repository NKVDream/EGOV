import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';
import Registration from './pages/registration';
import CreateArticle from './pages/createArticle';

// Компонент защиты маршрутов (не пустит без токена)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  // Если токена нет в браузере, принудительно отправляем на авторизацию
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичный маршрут: страница входа */}
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration/>}/>
        <Route path="/article/create" element={<CreateArticle />} />
        <Route path="/article/edit/:id" element={<CreateArticle />} />

        
        {/* Защищенный маршрут: главная страница со статьями */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />

        {/* Если пользователь ввел любой другой адрес — перенаправляем его */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
