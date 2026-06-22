import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardBlog } from '../components/CardBlog';
import Layout from '../components/Layout';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка статей с сервера
  const fetchArticles = async () => {
    try {
      const response = await fetch('http://localhost:5170/api/Article');
      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const sortedArticles = data.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.CreatedAt || 0);
            const dateB = new Date(b.createdAt || b.CreatedAt || 0);
            return dateB - dateA;
          });
          setArticles(sortedArticles);
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки ленты статей:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDeleteFromFeed = async (articleId) => {
    if (!window.confirm('Вы уверены, что хотите навсегда удалить эту статью?')) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5170/api/Article/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Статья успешно удалена');
        setArticles((prevArticles) => prevArticles.filter(a => (a.id || a.Id) !== articleId));
      } else {
        alert('Не удалось удалить статью. Ошибка сервера.');
      }
    } catch (error) {
      console.error('Ошибка при удалении статьи из ленты:', error);
      alert('Ошибка соединения с сервером.');
    }
  };

  return (
    <Layout>
      {/* ОСНОВНОЙ КОНТЕНТ СЕТКИ СТАТЕЙ */}
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 4, 
          alignItems: 'stretch',
          backgroundColor: '#f9f9f9', 
          minHeight: 'calc(100vh - 64px)',
          width: '100%',             
          boxSizing: 'border-box'
        }}
      >

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : articles.length === 0 ? (
          <Typography color="text.secondary">Статей пока нет.</Typography>
        ) : (
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr', // 1 колонка на смартфонах
                sm: 'repeat(auto-fill, minmax(320px, 1fr))' // Динамические колонки на ПК
              },
              gap: 4, // Фиксированное расстояние между карточками                       
              width: '100%', 
              margin: 0,                           
              padding: 0
            }}
          >
            {articles.map((article) => {
              const articleId = article.id || article.Id;

              // Проверяем, есть ли у карточки дочерние подстатьи
              const hasChildren = (article?.children && article.children.length > 0) || 
                                  (article?.Children && article.Children.length > 0);

              return (
                <Box 
                  key={articleId} 
                  sx={{ 
                    width: '100%',
                    gridColumn: {
                      xs: 'auto',
                      sm: hasChildren ? 'span 1' : 'auto'
                    },
                    // Позволяем стилям из CardBlog.jsx управлять gridColumn контейнера
                    '&:has(.MuiCollapse-entered)': {
                      gridColumn: '1 / -1 !important'
                    }
                  }}               
                >
                  <CardBlog 
                    article={article} 
                    onClick={() => navigate(`/article/${articleId}`)} 
                    onNodeSelect={(subArticleId) => navigate(`/article/${subArticleId}`)}
                    onEdit={() => navigate(`/article/edit/${articleId}`)}
                    onDelete={() => handleDeleteFromFeed(articleId)}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Layout>
  );
}
