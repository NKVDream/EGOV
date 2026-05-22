import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  // Переименовали email в login, чтобы пользователь понимал, что можно ввести никнейм
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://localhost:5000/api/User/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login: login, password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка авторизации');
      }

      // Сохраняем сессию в браузере
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);

      navigate('/home');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '350px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Вход в систему</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          {/* Поменяли текст подсказки для пользователя */}
          <label style={{ display: 'block', marginBottom: '5px' }}>NickName или Email:</label>
          <input 
            type="text" // Изменили тип на text, чтобы браузер не ругался на отсутствие знака @
            value={login} 
            onChange={(e) => setLogin(e.target.value)} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required 
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Пароль:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required 
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
          Войти
        </button>
      </form>
    </div>
  );
}
