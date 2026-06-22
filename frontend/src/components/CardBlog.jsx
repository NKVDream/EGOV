import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Collapse, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; 
import { LineSidebarTree } from './LineSidebarTree'; 

export function CardBlog({ article, onClick, onDelete, onEdit, onNodeSelect }) {
  const isAdmin = localStorage.getItem('role') === 'admin';
  const [isExpanded, setIsExpanded] = useState(false);

  const titleText = article?.title || article?.Title || 'Без названия';
  const contentText = article?.content || article?.Content || article?.text || article?.Text || '';
  const rawDate = article?.createdAt || article?.CreatedAt;
  const dateText = rawDate ? new Date(rawDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  
  const hasChildren = (article?.children && article.children.length > 0) || 
                      (article?.Children && article.Children.length > 0);

  const handleToggleExpand = (e) => {
    e.stopPropagation(); 
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        width: '100%',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: isExpanded ? '1px solid #1976d2' : '1px solid #e3e8ed', 
        boxShadow: isExpanded ? '0 10px 24px rgba(0, 0, 0, 0.06)' : 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
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
      <CardContent sx={{ p: 3, pb: 2, '&:last-child': { pb: 2 } }}>
        
        {/* ЗАГОЛОВОК */}
        <Typography 
          className="article-title"
          variant="h6" 
          component="h2" 
          sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.3, mb: 1.5, transition: 'color 0.2s' }}
        >
          {titleText}
        </Typography>

        <Typography 
          variant="body2" 
          sx={{ 
            color: '#475569', lineHeight: 1.6, mb: 3,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}
        >
          {contentText}
        </Typography>

        {/* НИЖНЯЯ ПАНЕЛЬ С КНОПКАМИ */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
            <CalendarTodayIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>{dateText}</Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAdmin && (
              <Box 
                className="admin-box"
                onClick={(e) => e.stopPropagation()}
                sx={{ display: 'flex', gap: 0.5, opacity: { xs: 1, md: 0 }, transition: 'opacity 0.2s' }}
              >
                <Tooltip title="Редактировать"><IconButton size="small" onClick={onEdit} sx={{ color: '#64748b', '&:hover': { color: 'primary.main' } }}><EditIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                <Tooltip title="Удалить"><IconButton size="small" onClick={onDelete} sx={{ color: '#64748b', '&:hover': { color: 'error.main' } }}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
              </Box>
            )}

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
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease, border-color 0.2s, background-color 0.2s',
                    '&:hover': { borderColor: 'primary.main', color: 'primary.main' }
                  }}
                >
                  <ExpandMoreIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Divider sx={{ mx: 3, my: 0.5, borderColor: 'rgba(0,0,0,0.06)' }} />
        
        <Box 
          onClick={(e) => e.stopPropagation()} 
          sx={{ 
            p: 2.5,
            pt: 1.5,
            backgroundColor: '#fafafa',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <Typography variant="subtitle2" sx={{ pl: 1, color: 'text.secondary', fontWeight: 'bold', mb: 1.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
            Содержание темы
          </Typography>
          
          <LineSidebarTree 
            treeData={article.children || article.Children || []} 
            onNodeSelect={onNodeSelect} 
          />
        </Box>
      </Collapse>
    </Card>
  );
}
