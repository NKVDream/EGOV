import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export function CardBlog({ article, onClick, onDelete, onEdit }) {
  const isAdmin = localStorage.getItem('role') === 'admin';
  
  const titleText = article?.title || article?.Title || 'Без названия';
  const contentText = article?.content || article?.Content || article?.text || article?.Text || '';
  const rawDate = article?.createdAt || article?.CreatedAt;
  const dateText = rawDate ? new Date(rawDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <Card
      onClick={onClick}
      sx={{
        width: '100%',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e3e8ed',
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px rgba(0, 0, 0, 0.05)',
          borderColor: 'primary.main',
          '& .article-title': { color: 'primary.main' },
          '& .admin-box': { opacity: 1 }
        },
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 2 } }}>
        
        {/* ЗАГОЛОВОК СТАТЬИ */}
        <Typography 
          className="article-title" // Класс для анимации цвета
          variant="h6" 
          component="h2" 
          sx={{ 
            fontWeight: 700, 
            color: '#1e293b', 
            lineHeight: 1.3,
            mb: 1.5,
            transition: 'color 0.2s'
          }}
        >
          {titleText}
        </Typography>

        {/* КРАТКОЕ ОПИСАНИЕ */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#475569', 
            lineHeight: 1.6,
            mb: 4, // Оставляем место внизу под дату
            display: '-webkit-box',
            WebkitLineClamp: 4, // Автоматически обрезает текст после 4-й строки, добавляя «...»
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {contentText}
        </Typography>

        {/* НИЖНЯЯ ПАНЕЛЬ: ДАТА И КНОПКИ АДМИНА */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          
          {/* Дата аккуратно снизу */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
            <CalendarTodayIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {dateText}
            </Typography>
          </Box>

          {/* Иконки админа появляются только при наведении */}
          {isAdmin && (
            <Box 
              className="admin-box"
              onClick={(e) => e.stopPropagation()} // Чтобы клик по кнопке не открывал саму статью
              sx={{ 
                display: 'flex', 
                gap: 0.5, 
                opacity: 0, // По умолчанию скрыты
                transition: 'opacity 0.2s ease-in-out' 
              }}
            >
              <Tooltip title="Редактировать">
                <IconButton size="small" onClick={onEdit} sx={{ color: '#64748b', '&:hover': { color: 'primary.main' } }}>
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Удалить">
                <IconButton size="small" onClick={onDelete} sx={{ color: '#64748b', '&:hover': { color: 'error.main' } }}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

      </CardContent>
    </Card>
  );
}
