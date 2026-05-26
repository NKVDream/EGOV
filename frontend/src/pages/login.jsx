import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import '../components/buttons.css';
import {TextField, Button, Box, Typography, Divider, InputAdornment, IconButton, CircularProgress} from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);

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
      setIsLoading(false)
    }
  };
  return (
  <div className='app-wrapper' style={{ position: 'relative', minHeight: '100vh' }}>
    {isLoading && (
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <CircularProgress aria-label="Loading…" size={60} />
      </div>
    )}

    <div style={{ 
      maxWidth: '350px', 
      margin: '100px auto', 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '10px',
      filter: isLoading ? 'blur(4px)' : 'none',
      opacity: isLoading ? 0.7 : 1,
      transition: 'filter 0.3s ease, opacity 0.3s ease',
      pointerEvents: isLoading ? 'none' : 'auto'
    }}>
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          margin="normal"
          type={showPassword ? 'text' : 'password'}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='Переключить видимость пароля'
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />

        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ mt: 2, mb: 2 }} // Отступы: сверху и снизу
          disabled={isLoading} //блокирует кнопку при загрузке
        >
          Войти
        </Button>
        
        <Divider sx={{my: 2}}>или</Divider>
        
        <p style={{ margin: '10px 0 5px 0', fontSize: '14px', color: '#666' }}>
          У меня нет аккаунта:
        </p>

        <Button 
          type="button" 
          onClick={() => navigate('/registration')} 
          variant="outlined" 
          color="success" 
          fullWidth
          disabled={isLoading}
        >
          Зарегистрироваться
        </Button>
      </form>
    </div>
  </div>
);

}
