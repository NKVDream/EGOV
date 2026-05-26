import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../App.css';
import { TextField, Button, Box, Typography } from "@mui/material";

export default function Registration() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Убрали лишние кавычки из вызова hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
    }
  };


return (
  <div className="app-wrapper">
    <div style={{ maxWidth: '350px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
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

        <TextField
          label="Пароль"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          fullWidth
          required
        />

        <TextField
          label="Подтвердить пароль"
          type="password"
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

        <Button
          type="submit"
          variant="contained"
          color="success"
          fullWidth
          sx={{ mt: 2, mb: 2, py: 1.2 }} 
        >
          Зарегистрироваться
        </Button>

        <p style={{ fontSize: '14px', margin: '10px 0 5px 0', color: '#666' }}>
          У меня уже есть аккаунт:
        </p>

        <Button 
          type="button" 
          onClick={() => navigate('/login')} 
          variant="outlined" 
          color="primary" 
          fullWidth
          sx={{ py: 1.2 }}
        >
          Войти в аккаунт
        </Button>
      </form>
    </div>
  </div>
);

}