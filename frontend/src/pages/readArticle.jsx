import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Paper, Typography, Button, 
  CircularProgress, Alert, Chip, Divider, IconButton, Tooltip 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/home')} color="primary">
          Вернуться на главную
        </Button>
      </Container>
    );
  }

  const titleText = article?.title || article?.Title || 'Без названия';
  const contentText = article?.content || article?.Content || article?.text || article?.Text || '';
  const authorName = article?.authorName || article?.AuthorName || 'Автор';
  const rawDate = article?.createdAt || article?.CreatedAt;
  const dateText = rawDate ? new Date(rawDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Дата неизвестна';
  const categories = article?.categories || article?.Categories || [];

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-start',
        width: '100%',            
        minHeight: '100vh',
        backgroundColor: '#f5f5f5', 
        boxSizing: 'border-box',
        px: { xs: 2, md: 4 },     
        pt: 5, 
        pb: 5
      }}
    >
      <Container 
        maxWidth="lg" 
        disableGutters 
        sx={{ 
          width: '100%',          
          mx: 'auto'              
        }}
      >
        
        {/* КНОПКА НАЗАД */}
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/home')} 
          sx={{ mb: 3, textTransform: 'none', fontWeight: 'bold' }}
          color="inherit"
        >
          Назад к ленте
        </Button>

        {/* ОСНОВНАЯ КАРТОЧКА СТАТЬИ */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 3, 
            boxSizing: 'border-box',
            width: '100%',
            position: 'relative' // Важно для позиционирования кнопок админа
          }}
        >
          
          {/* БЛОК КНОПОК ДЛЯ АДМИНИСТРАТОРА */}
          {isAdmin && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: { xs: 16, md: 24 }, 
                right: { xs: 16, md: 24 }, 
                display: 'flex', 
                gap: 1 
              }}
            >
              <Tooltip title="Редактировать статью">
                <IconButton 
                  color="primary"
                  onClick={() => navigate(`/article/edit/${id}`)}
                  sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)', '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Удалить статью">
                <IconButton 
                  color="error"
                  onClick={handleDelete}
                  sx={{ backgroundColor: 'rgba(211, 47, 47, 0.04)', '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' } }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* ЗАГОЛОВОК СТАТЬИ */}
          <Typography 
            variant="h3" 
            component="h1" 
            fontWeight="bold" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '2rem', md: '3rem' }, 
              color: 'text.primary',
              pr: isAdmin ? { xs: 12, md: 16 } : 0 // Отступ справа, чтобы текст не наезжал на кнопки
            }}
          >
            {titleText}
          </Typography>

          {/* МЕТА-ДАННЫЕ */}
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
                    sx={{ fontWeight: '500' }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* СОДЕРЖИМОЕ СТАТЬИ */}
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: '1.15rem', 
              lineHeight: '1.8', 
              color: 'text.primary',
              whiteSpace: 'pre-line', 
              wordBreak: 'break-word' 
            }}
          >
            {contentText}
          </Typography>

        </Paper>
      </Container>
    </Box>
  );
}
