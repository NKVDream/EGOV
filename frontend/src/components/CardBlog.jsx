import React from 'react';
import { Card, CardContent, Button, Box, Typography } from '@mui/material';

export function CardBlog({ article, onClick }) {
  // Функция для безопасной обрезки текста
  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  // Безопасно извлекаем текст для вывода
  const contentText = article?.content || article?.Content || article?.text || article?.Text || '';
  const titleText = article?.title || article?.Title || 'Без названия';
  const dateText = article?.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'НЕДАВНО';

  return (
    <Card
      onClick={onClick}
      sx={(theme) => ({
        width: '100%',
        maxWidth: 500,
        borderRadius: 2, // theme.spacing(2) заменен на стандартное число радиуса для MUI v5/v6
        transition: '0.3s',
        cursor: 'pointer',
        boxShadow: '0px 14px 80px rgba(34, 35, 58, 0.15)',
        background: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 20px 80px rgba(34, 35, 58, 0.25)',
        },
      })}
    >
      <CardContent sx={{ width: '100%', paddingBottom: '0 !important' }}>
        {/* Заменяем внешние компоненты Info на встроенный Typography */}
        <Typography 
          variant="caption" 
          sx={{ textTransform: 'uppercase', fontSize: 11, display: 'block', mb: 0.5, color: 'text.secondary' }}
        >
          {dateText}
        </Typography>

        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ fontSize: 22, fontWeight: 'bold', mb: 1, color: 'text.primary' }}
        >
          {titleText}
        </Typography>

        <Typography 
          variant="body2" 
          sx={{ mb: 2, fontSize: '0.9rem', lineHeight: '1.5', color: 'text.secondary' }}
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
