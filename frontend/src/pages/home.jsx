import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]); // Все статьи
  const [selectedArticle, setSelectedArticle] = useState(null); // Выбранная статья справа
  const [loading, setLoading] = useState(true);

  // Получаем роль текущего пользователя из localStorage
  const userRole = localStorage.getItem('role');

  // Шаг 1: Загрузка всех статей при открытии страницы
  useEffect(() => {
    fetch('https://localhost:5170/api/Article') // порт C# бэкенда
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        if (data.length > 0) setSelectedArticle(data[0]); // По умолчанию открываем первую статью
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки статей:', err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAddArticle = () => {
    alert('Тут будет открытие формы создания статьи (только для роли: ' + userRole + ')');
    // Здесь можно вызывать модальное окно или переходить на страницу /create
  };

  if (loading) return <div style={{ padding: '20px' }}>Загрузка статей...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* 1. СИНЯЯ ПАНЕЛЬ НАВЕРХУ */}
      <div style={{ backgroundColor: '#1e40af', height: '60px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 20px' }}>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }} title="Выйти">
          🚪
        </button>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ (РАЗДЕЛЕН НА ДВЕ ЧАСТИ) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* 2. ЛЕВАЯ ПАНЕЛЬ: СПИСОК СТАТЕЙ */}
        <div style={{ width: '250px', borderRight: '1px solid #e5e7eb', padding: '15px', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
          
          {/* Блок добавления статьи (показывается только админу) */}
          {userRole === 'admin' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', color: '#4b5563' }}>Добавить статью:</span>
              <button onClick={handleAddArticle} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                + добавить
              </button>
            </div>
          )}

          {/* Сам список карточек */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {articles.map((article) => (
              <div 
                key={article.id} 
                onClick={() => setSelectedArticle(article)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  marginBottom: '10px', 
                  cursor: 'pointer',
                  backgroundColor: selectedArticle?.id === article.id ? '#eff6ff' : 'white',
                  borderColor: selectedArticle?.id === article.id ? '#3b82f6' : '#d1d5db'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{article.title}</span>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>✖</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. ПРАВАЯ ЧАСТЬ: ДЕТАЛЬНЫЙ ПРОСМОТР СТАТЬИ */}
        <div style={{ flex: 1, padding: '40px', position: 'relative', overflowY: 'auto' }}>
          {selectedArticle ? (
            <div>
              <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>{selectedArticle.title}</h1>
              <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '20px' }}>
                Автор: {selectedArticle.authorName} | Категории: {selectedArticle.categories.join(', ') || 'Нет'}
              </p>
              <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#1f2937', whiteSpace: 'pre-wrap' }}>
                {selectedArticle.content}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '48px', color: '#d1d5db' }}>
              T
            </div>
          )}

          {/* Иконки управления внизу справа (видны только админу) */}
          {userRole === 'admin' && selectedArticle && (
            <div style={{ position: 'absolute', bottom: '30px', right: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }} title="Удалить">
                🗑️
              </button>
              <button style={{ backgroundColor: '#1f2937', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '20px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} title="Редактировать">
                Редактировать
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
