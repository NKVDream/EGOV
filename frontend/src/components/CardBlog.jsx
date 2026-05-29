import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Box, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Добавили onDeleteRefresh в свойства, чтобы обновлять список на главной после удаления
export function CardBlog({ article, onClick, onDeleteRefresh }) {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('role') === 'admin';

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const contentText = article?.content || article?.Content || article?.text || article?.Text || '';
  const titleText = article?.title || article?.Title || 'Без названия';
  const articleId = article?.id || article?.Id;
  const rawDate = article?.createdAt || article?.CreatedAt || article?.date || article?.Date;
  const dateText = rawDate ? new Date(rawDate).toLocaleDateString() : 'НЕДАВНО';

  // Функция удаления статьи
  const handleDelete = async (e) => {
    e.stopPropagation(); // Предотвращаем клик по всей карточке (переход на статью)
    
    if (!window.confirm(`Вы уверены, что хотите удалить статью "${titleText}"?`)) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5170/api/Article/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // Передаем токен для [Authorize(Roles = "admin")]
        }
      });

      if (response.ok) {
        alert('Статья успешно удалена!');
        if (typeof onDeleteRefresh === 'function') {
          onDeleteRefresh(); // Вызываем обновление списка на главной странице
        }
      } else {
        alert('Не удалось удалить статью. Ошибка сервера.');
      }
    } catch (error) {
      console.error('Ошибка при удалении статьи:', error);
      alert('Ошибка соединения с сервером.');
    }
  };

  // Функция перехода на редактирование
  const handleEdit = (e) => {
    e.stopPropagation(); // Предотвращаем клик по всей карточке
    navigate(`/article/edit/${articleId}`);
  };

  return (
    <Card
      onClick={onClick}
      sx={(theme) => ({
        width: '100%',
        maxWidth: 500,
        borderRadius: 2,
        transition: '0.3s',
        cursor: 'pointer',
        boxShadow: '0px 14px 80px rgba(34, 35, 58, 0.15)',
        background: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 20px 80px rgba(34, 35, 58, 0.25)',
        },
      })}
    >
      {isAdmin && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12, 
            display: 'flex', 
            gap: 0.5,
            zIndex: 2
          }}
        >
          <IconButton 
            size="small" 
            onClick={handleEdit}
            sx={{ backgroundColor: 'rgba(0,0,0,0.04)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)', color: 'primary.main' } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={handleDelete}
            sx={{ backgroundColor: 'rgba(0,0,0,0.04)', '&:hover': { backgroundColor: 'rgba(211,47,47,0.1)', color: 'error.main' } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <CardContent sx={{ width: '100%', paddingBottom: '0 !important', pt: isAdmin ? 2 : 1 }}>
        <Typography 
          variant="caption" 
          sx={{ textTransform: 'uppercase', fontSize: 11, display: 'block', mb: 0.5, color: 'text.secondary' }}
        >
          {dateText}
        </Typography>

        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ fontSize: 22, fontWeight: 'bold', mb: 1, color: 'text.primary', pr: isAdmin ? 8 : 0 }}
        >
          {titleText}
        </Typography>

        <Typography 
          variant="body2" 
          sx={{ mb: 2, fontSize: '0.9rem', lineHeight: '1.5', color: 'text.secondary', wordBreak: 'break-word' }}
        >
          {truncateText(contentText)}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            variant="contained"
            sx={{
              backgroundImage: 'linear-gradient(147deg, #fe8a39 0%, #fd3838 74%)',
              boxShadow: '0px 4px 32px rgba(252, 56, 56, 0.3)',
              borderRadius: 100,
              px: 3,
              textTransform: 'none',
              color: '#ffffff',
            }}
          >
            Читать далее
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
