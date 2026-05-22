import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Registration() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Убрали лишние кавычки из вызова hook

  const handleSubmit = async (e) => {
    e.preventDefault(); // Исправлена опечатка
    setError('');

    try {
      // Весь сетевой код теперь строго внутри функции отправки формы
      const response = await fetch('http://localhost:5170/api/User/Registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Передаем правильные переменные из useState
        body: JSON.stringify({ name: name, email: email, password: password })
      });

      const data = await response.json(); // Удалена лишняя точка

      if (!response.ok) {
        // Убрали кавычки, чтобы читать реальное сообщение с бэкенда
        throw new Error(data.message || 'Ошибка регистрации');
      }

      // После успешной регистрации обычно отправляют на страницу входа
      navigate('/login'); 
    } catch (err) {
      setError(err.message); // Исправлена опечатка massege -> message
    }
  };

  return (
    <div style={{ maxWidth: '350px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Регистрация в систему</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Имя:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email" // Поменяли на email для базовой валидации браузером
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}