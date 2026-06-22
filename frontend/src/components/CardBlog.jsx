import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Collapse, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // 🟢 Новая иконка стрелочки
import { SidebarTree } from './SidebarTree'; // Испольуем наш готовый компонент дерева

export function CardBlog({ article, onClick, onDelete, onEdit, onNodeSelect }) {
  const isAdmin = localStorage.getItem('role') === 'admin';
  
  // 🟢 Состояние для управления раскрытием поддерева внутри карточки
  const [isExpanded, setIsExpanded] = useState(false);

  const titleText = article?.title || article?.Title || 'Без названия';
  const contentText = article?.content || article?.Content || article?.text || article?.Text || '';
  const rawDate = article?.createdAt || article?.CreatedAt;
  const dateText = rawDate ? new Date(rawDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  
  // Безопасно проверяем наличие дочерних подстатей
  const hasChildren = (article?.children && article.children.length > 0) || 
                      (article?.Children && article.Children.length > 0);

  // Функция переключения раскрытия поддерева
  const handleToggleExpand = (e) => {
    e.stopPropagation(); // 🟢 КРИТИЧНО: Чтобы клик по стрелке не вызывал onClick всей карточки
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        width: '100%',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: isExpanded ? '1px solid #1976d2' : '1px solid #e3e8ed', // Подсвечиваем рамку при раскрытии
        boxShadow: isExpanded ? '0 8px 16px rgba(0, 0, 0, 0.05)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        
        '&:hover': {
          transform: isExpanded ? 'none' : 'translateY(-4px)', // Не дергаем карточку вверх, если она уже открыта
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
          className="article-title"
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
            mb: 4,
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 2 : 4, // 🟢 Делаем текст компактнее (2 строки), если дерево раскрыто
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            transition: 'all 0.2s'
          }}
        >
          {contentText}
        </Typography>

        {/* НИЖНЯЯ ПАНЕЛЬ: ДАТА, АДМИН И СТРЕЛКА */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          
          {/* Дата аккуратно снизу */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
            <CalendarTodayIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {dateText}
            </Typography>
          </Box>

          {/* Правая часть панели: Кнопки админа + Кнопка раскрытия */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            
            {/* Иконки админа */}
            {isAdmin && (
              <Box 
                className="admin-box"
                onClick={(e) => e.stopPropagation()}
                sx={{ 
                  display: 'flex', 
                  gap: 0.5, 
                  opacity: { xs: 1, md: 0 }, // На мобилках всегда видны, на десктопе при наведении
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

            {/* 🟢 КНОПКА КРУГЛОЙ СТРЕЛОЧКИ (Отображается только если у статьи есть подстатьи) */}
            {hasChildren && (
              <Tooltip title={isExpanded ? "Свернуть темы" : "Развернуть темы"}>
                <IconButton 
                  size="small" 
                  onClick={handleToggleExpand}
                  sx={{ 
                    color: isExpanded ? 'primary.main' : '#64748b',
                    border: '1px solid',
                    borderColor: isExpanded ? 'primary.main' : '#e2e8f0',
                    backgroundColor: isExpanded ? 'rgba(25, 118, 210, 0.04)' : '#ffffff',
                    // Плавный переворот стрелки на 180 градусов
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease, border-color 0.2s, background-color 0.2s',
                    '&:hover': {
                      backgroundColor: isExpanded ? 'rgba(25, 118, 210, 0.08)' : '#f8fafc',
                      borderColor: 'primary.main',
                      color: 'primary.main'
                    }
                  }}
                >
                  <ExpandMoreIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}

          </Box>
        </Box>

      </CardContent>

      {/*БЛОК С ПЛАВНОЙ АНИМАЦИЕЙ РАСКРЫТИЯ ДЕРЕВА */}
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Divider sx={{ mx: 3, my: 1, borderColor: 'rgba(0,0,0,0.06)' }} />
        <Box 
          onClick={(e) => e.stopPropagation()} // Перехватываем клик по дереву, чтобы карточка сама не закрылась
          sx={{ 
            px: 1, 
            pb: 2, 
            pt: 0.5,
            backgroundColor: '#fafafa', // Слегка затеняем подложку раскрытого дерева
          }}
        >
          <SidebarTree 
            treeData={article.children || article.Children || []} 
            activeId={null} // На главной странице нет активного ID статьи
            onNodeSelect={onNodeSelect} // Проп для перехода на кликнутую подстатью
          />
        </Box>
      </Collapse>

    </Card>
  );
}
