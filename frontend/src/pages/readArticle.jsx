import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, CircularProgress, Alert, 
  Chip, Divider, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, 
  List, ListItem, ListItemText 
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History'; 
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import Layout from '../components/Layout';
import { SidebarTree } from '../components/SidebarTree';


export default function ReadArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('role') === 'admin';

  const[sidebarTree, setSidebarTree] = useState([]);//stuff for the sidebar
  const[activeArticleId, setActiveArticleId] = useState(parseInt(id, 10));

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  //Новые состояния для управления историей изменений
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Функция загрузки самой статьи
  const fetchArticle = async () => {
    try {
      const response = await fetch(`http://localhost:5170/api/Article/${id}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
      } else if (response.status === 404) {
        setError('Статья не найдена.');
      } else {
        setError('Не удалось загрузить статью.');
      }
    } catch (err) {
      console.error(err);
      setError('Нет связи с сервером.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchArticle();
  }, [id]);

  //Функция загрузки истории изменений с бэкенда
  const fetchHistory = async () => {
    setLoadingHistory(true);
    const token = localStorage.getItem('token');
    try {
      // Подставьте ваш точный адрес эндпоинта истории
      const response = await fetch(`http://localhost:5170/api/Article/${id}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.error("Ошибка загрузки истории:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Открытие диалогового окна истории
  const handleOpenHistory = () => {
    setHistoryDialogOpen(true);
    fetchHistory();
  };

  //Функция отката к выбранной версии
const handleRollback = async (versionId) => {
  if (!window.confirm('Вы уверены, что хотите восстановить эту версию статьи? Текущий текст будет заменен.')) {
    return;
  }

  const token = localStorage.getItem('token');
  try {
    // URL эндпоинта зависит от вашего бэкенда (например, /api/Article/rollback/{versionId})
    const response = await fetch(`http://localhost:5170/api/Article/rollback/${versionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      alert('Статья успешно восстановлена к выбранной версии!');
      setHistoryDialogOpen(false);
      
      // Принудительно перезапрашиваем статью с бэкенда, чтобы обновить текст на экране
      setLoading(true);
      const updatedResp = await fetch(`http://localhost:5170/api/Article/${id}`);
      if (updatedResp.ok) {
        const updatedData = await updatedResp.json();
        setArticle(updatedData);
      }
    } else {
      alert('Не удалось откатить изменения. Ошибка сервера.');
    }
  } catch (error) {
    console.error('Ошибка при откате статьи:', error);
    alert('Ошибка соединения с сервером.');
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async () => {
    const titleText = article?.title || article?.Title || 'Без названия';
    if (!window.confirm(`Вы уверены, что хотите удалить статью "${titleText}"?`)) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5170/api/Article/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Статья успешно удалена');
        navigate('/home');
      }
    } catch (error) {
      console.error(error);
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
      <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#f9f9f9', boxSizing: 'border-box', px: { xs: 2, md: 4 }, pt: 4, pb: 5 }}>
        <Box sx={{ maxWidth: '900px', width: '100%', mx: 'auto', position: 'relative' }}>
          
          {/* КНОПКА НАЗАД */}
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/home')} sx={{ mb: 3, textTransform: 'none', fontWeight: 'bold' }} color="inherit">
            Назад
          </Button>

          {/* БЛОК КНОПОК ДЛЯ АДМИНИСТРАТОРА (Добавлена кнопка истории) */}
          {isAdmin && (
            <Box sx={{ position: 'absolute', top: 45, right: 0, display: 'flex', gap: 1, zIndex: 2 }}>
              
              {/* Кнопка «История изменений» */}
              <Tooltip title="История изменений">
                <IconButton 
                  color="default"
                  onClick={handleOpenHistory}
                  sx={{ backgroundColor: '#ffffff', boxShadow: '0px 2px 8px rgba(0,0,0,0.1)', '&:hover': { backgroundColor: '#f5f5f5' } }}
                >
                  <HistoryIcon />
                </IconButton>
              </Tooltip>

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

          {/* БЛОК ЗАГОЛОВКА */}
          <Box sx={(theme) => ({ borderLeft: `6px solid ${theme.palette.primary.main}`, pl: 2, mb: 3, width: '100%', boxSizing: 'border-box' })}>
            <Typography variant="h3" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '2.2rem', md: '3.2rem' }, color: 'text.primary', lineHeight: 1.2, pr: isAdmin ? { xs: 18, md: 22 } : 0 }}>
              {titleText}
            </Typography>
          </Box>

          {/* МЕТА-ИНФОРМАЦИЯ */}
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
                  <Chip key={idx} label={typeof cat === 'object' ? (cat.name || cat.Name) : cat} size="small" variant="outlined" sx={{ fontWeight: '500', backgroundColor: '#ffffff' }} />
                ))}
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* СОДЕРЖИМОЕ СТАТЬИ */}
          <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#2c3e50', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
            {contentText}
          </Typography>

        </Box>
      </Box>

      {/* ========================================================================= */}
      {/* 🟢 ИСПРАВЛЕННЫЙ БЛОК МОДАЛЬНОГО ОКНО ИСТОРИИ ИЗМЕНЕНИЙ */}
      {/* ========================================================================= */}
      <Dialog 
        open={historyDialogOpen} 
        onClose={() => setHistoryDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>История изменений статьи</DialogTitle>
        <DialogContent dividers>
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : !Array.isArray(historyList) || historyList.length === 0 ? ( /* 🟢 ДОБАВЛЕНА ЗАЩИТА ОТ NULL */
            <Typography color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
              История изменений пуста. Это первоначальная версия статьи.
            </Typography>
          ) : (
            <List disablePadding>
              {historyList.map((version, index) => {
                const verDate = version?.changedAt || version?.ChangedAt;
                const formattedVerDate = verDate 
                  ? new Date(verDate).toLocaleString('ru-RU', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) 
                  : 'Дата неизвестна';
                
                const editorName = version?.editorName || version?.EditorName || 'Администратор';
                const versionId = version?.id || version?.Id;

                return (
                  <React.Fragment key={versionId || index}>
                    <ListItem
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<RestoreIcon />} /* Иконка восстанавливается здесь */
                          onClick={() => handleRollback(versionId)}
                          sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                          Откатиться
                        </Button>
                      }
                      sx={{ py: 2 }}
                    >
                      <ListItemText
                        primary={`Версия от ${formattedVerDate}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Изменил: {editorName}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              display="block" 
                              color="text.secondary" 
                              sx={{ 
                                mt: 0.5, 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                maxWidth: '300px' 
                              }}
                            >
                              {version?.content || version?.Content || 'Без текста'}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < historyList.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setHistoryDialogOpen(false)} color="inherit">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

    </Layout>
  );
}
