import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, CircularProgress, Alert, 
  Chip, Divider, IconButton, Tooltip 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../components/Layout';

export default function ReadArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('role') === 'admin';

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`http://localhost:5170/api/Article/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setArticle(data);
        } else if (response.status === 404) {
          setError('Статья не найдена. Возможно, она была удалена администратором.');
        } else {
          setError('Не удалось загрузить статью. Ошибка сервера.');
        }
      } catch (err) {
        console.error("Ошибка при получении статьи:", err);
        setError('Нет связи с сервером. Проверьте подключение.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const handleDelete = async () => {
    const titleText = article?.title || article?.Title || 'Без названия';
    
    if (!window.confirm(`Вы уверены, что хотите навсегда удалить статью "${titleText}"?`)) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5170/api/Article/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Статья успешно удалена');
        navigate('/home');
      } else {
        alert('Не удалось удалить статью. Ошибка сервера.');
      }
    } catch (error) {
      console.error('Ошибка при удалении статьи:', error);
      alert('Ошибка соединения с сервером.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ p: 3, maxWidth: '900px', margin: '0 auto', mt: 5 }}>
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/home')} color="primary">
            Вернуться на главную
          </Button>
        </Box>
      </Layout>
    );
  }

  const titleText = article?.title || article?.Title || 'Без названия';
  const contentText = article?.content || article?.Content || article?.text || article?.Text || '';
  const authorName = article?.authorName || article?.AuthorName || 'Автор';
  const rawDate = article?.createdAt || article?.CreatedAt;
  const dateText = rawDate ? new Date(rawDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Дата неизвестна';
  const categories = article?.categories || article?.Categories || [];

  return (
    <Layout>
      <Box 
        sx={{ 
          width: '100%',            
          minHeight: '100vh',
          backgroundColor: '#f9f9f9',
          boxSizing: 'border-box',
          px: { xs: 2, md: 4 },     
          pt: 4, 
          pb: 5
        }}
      >
        {/* Контейнер-ограничитель контента для идеального чтения */}
        <Box 
          sx={{ 
            maxWidth: '900px',
            width: '100%',          
            mx: 'auto',
            position: 'relative'              
          }}
        >
          
          {/* КНОПКА НАЗАД */}
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/home')} 
            sx={{ mb: 3, textTransform: 'none', fontWeight: 'bold' }}
            color="inherit"
          >
            Назад
          </Button>

          {/* БЛОК КНОПОК ДЛЯ АДМИНИСТРАТОРА */}
          {isAdmin && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 45, 
                right: 0, 
                display: 'flex', 
                gap: 1,
                zIndex: 2
              }}
            >
              <Tooltip title="Редактировать статью">
                <IconButton 
                  color="primary"
                  onClick={() => navigate(`/article/edit/${id}`)}
                  sx={{ backgroundColor: '#ffffff', boxShadow: '0px 2px 8px rgba(0,0,0,0.1)', '&:hover': { backgroundColor: '#f5f5f5' } }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Удалить статью">
                <IconButton 
                  color="error"
                  onClick={handleDelete}
                  sx={{ backgroundColor: '#ffffff', boxShadow: '0px 2px 8px rgba(0,0,0,0.1)', '&:hover': { backgroundColor: '#fff5f5' } }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* БЛОК ЗАГОЛОВКА С ВЕРТИКАЛЬНОЙ ПОЛОСОЙ СЛЕВА */}
          <Box 
            sx={(theme) => ({
              borderLeft: `6px solid ${theme.palette.primary.main}`,
              pl: 2,
              mb: 3,
              width: '100%',
              boxSizing: 'border-box'
            })}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              fontWeight="bold" 
              sx={{ 
                fontSize: { xs: '2.2rem', md: '3.2rem' }, 
                color: 'text.primary',
                lineHeight: 1.2,
                pr: isAdmin ? { xs: 12, md: 16 } : 0 
              }}
            >
              {titleText}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3, mt: 2, mb: 3, color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PersonIcon fontSize="small" />
              <Typography variant="body2" fontWeight="medium">{authorName}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body2">{dateText}</Typography>
            </Box>

            {categories.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, ml: { md: 'auto' } }}>
                {categories.map((cat, idx) => (
                  <Chip 
                    key={idx} 
                    label={typeof cat === 'object' ? (cat.name || cat.Name) : cat} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontWeight: '500', backgroundColor: '#ffffff' }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: '1.2rem', 
              lineHeight: '1.8', 
              color: '#2c3e50', 
              whiteSpace: 'pre-line', 
              wordBreak: 'break-word' 
            }}
          >
            {contentText}
          </Typography>

        </Box>
      </Box>
    </Layout>
  );
}

