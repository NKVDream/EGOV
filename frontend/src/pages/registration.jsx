import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../App.css';
import {TextField, Button, Box, Typography, Divider, InputAdornment, IconButton, CircularProgress} from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';

export default function Registration() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);

    if(password !== confirmPassword){
      setError('Пароли не совпадают')
      return;
    }

    try {
      const response = await fetch('http://localhost:5170/api/User/Registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name, email: email, password: password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка регистрации');
      }

      // После успешной регистрации обычно отправляют на страницу входа
      navigate('/login'); 
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
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

      <h2 style={{ justifyContent: "center", display: "flex" }}>Регистрация в систему</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          required
        />
        
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          fullWidth
          variant="outlined"
          required
        />
        <Divider sx={{my: 2}}></Divider>
        <TextField
          label="Пароль"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          fullWidth
          required
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
        <TextField
          label="Подтвердить пароль"
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
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
          color="success"
          fullWidth
          disabled={isLoading}
          sx={{ mt: 2, mb: 2, py: 1.2 }} 
        >
          Зарегистрироваться
        </Button>
        <Divider sx={{my: 2}}>или</Divider>
        <p style={{ fontSize: '14px', margin: '10px 0 5px 0', color: '#666' }}>
          У меня уже есть аккаунт:
        </p>

        <Button 
          type="button" 
          onClick={() => navigate('/login')} 
          variant="outlined" 
          color="primary" 
          fullWidth
          disabled={isLoading}
          sx={{ py: 1.2 }}
        >
          Войти в аккаунт
        </Button>
      </form>
    </div>
  </div>
);

}