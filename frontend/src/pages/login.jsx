import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import '../components/buttons.css'
import {TextField, Button, Box, Typography, Divider} from '@mui/material'

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5170/api/User/Login', {
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

      localStorage.setItem('token', data.token);// Сохраняем сессию в браузере
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);

      navigate('/home');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
  <div className='app-wrapper'>
    <div style={{ maxWidth: '350px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2 style={{justifyContent:'center', display:'flex'}}>Вход в систему</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Имя пользователя или Email"
          variant="outlined"
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
          fullWidth
          margin="normal"
        />

        <TextField
          label="Пароль"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          margin="normal"
        />

        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ mt: 2, mb: 2 }} // Отступы: сверху и снизу
        >
          Войти
        </Button>

        <p style={{ margin: '10px 0 5px 0', fontSize: '14px', color: '#666' }}>
          У меня нет аккаунта:
        </p>

        <Button 
          type="button" 
          onClick={() => navigate('/registration')} 
          variant="outlined" 
          color="success" 
          fullWidth
        >
          Зарегистрироваться
        </Button>
      </form>
    </div>
  </div>
);
}
