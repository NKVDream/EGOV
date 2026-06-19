import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, CircularProgress, Alert, 
  Chip, Divider, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, 
  List, ListItem, ListItemText 
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import Layout from '../components/Layout';
import AddIcon from '@mui/icons-material/Add';
import { SidebarTree } from '../components/SidebarTree';


export default function ReadArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('role') === 'admin';

  // 🟢 ВСЕ СТ ChouСЕ СТЕЙТЫ ДОЛЖНЫ БЫТЬ ОБЪЯВЛЕНЫ СТРОГО ПО ОДНОМУ РАЗУ:
  const [sidebarTree, setSidebarTree] = useState([]); 
  const [expandedItems, setExpandedItems] = useState([]); // Наш новый стейт для путей папок
  const [activeArticleId, setActiveArticleId] = useState(parseInt(id, 10));

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Состояния для управления историей изменений
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Стейт для закрытия/открытия сайдбара
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
  if (id) {
    fetch(`http://localhost:5170/api/Article/${id}/sidebar`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки");
        return res.json();
      })
      .then((data) => {
        // 🟢 ТАК КАК В КОНСОЛИ ЧИСТЫЙ МАССИВ: записываем data напрямую!
        const nodes = Array.isArray(data) ? data : [];
        setSidebarTree(nodes);

        // Автоматически вычисляем цепочку раскрытия прямо на фронтенде,
        // чтобы вообще не трогать и не ломать бэкенд!
        const expanded = [];
        const findActivePath = (items) => {
          for (const item of items) {
            const currentId = item.id !== undefined ? item.id : item.Id;
            const currentChildren = item.children || item.Children;
            
            // Если нашли текущую статью, возвращаем true
            if (currentId === parseInt(id, 10)) return true;

            // Ищем вглубь по подстатьям
            if (currentChildren && currentChildren.length > 0) {
              const found = findActivePath(currentChildren);
              if (found) {
                expanded.push(currentId.toString());
                return true;
              }
            }
          }
          return false;
        };

        findActivePath(nodes);
        setExpandedItems(expanded);
      })
      .catch((err) => {
        console.error("Ошибка в fetch сайдбара:", err);
        setSidebarTree([]);
      });
  }
}, [id]);


  // 3. Функция загрузки самой статьи
  const fetchArticle = async () => {
    setLoading(true);
    setError(''); // Сбрасываем старую ошибку при переключении статей
    try {
      const response = await fetch(`http://localhost:5170/api/Article/${activeArticleId}`);
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
    fetchArticle();
  }, [activeArticleId]);

  // 4. ДОБАВЛЕНО: Обработчик клика по элементу в SidebarTree
  // Вместо ручного выставления стейта мы меняем URL, запуская красивую цепочку обновлений реакта
  const handleNodeSelect = (selectedId) => {
    if (selectedId && selectedId !== activeArticleId) {
      navigate(`/article/${selectedId}`); // Предполагается, что ваш роут выглядит как /article/:id
    }
  };


  //Функция загрузки истории изменений с бэкенда
  const fetchHistory = async () => {
    setLoadingHistory(true);
    const token = localStorage.getItem('token');
    try {
      // Подставьте ваш точный адрес эндпоинта истории
      const response = await fetch(`http://localhost:5170/api/Article/${activeArticleId}/history`, {
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
      const response = await fetch(`http://localhost:5170/api/Article/${activeArticleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Статья успешно удалена');

        if(activeArticleId === parseInt(id, 10)) {
          navigate('/home');
        }
        else {
        window.location.reload();
        }
        
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading && !article) {
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
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9f9f9', position: 'relative' }}>
      
        {/* ЛЕВАЯ КОЛОНКА: Боковая панель */}
  <Box sx={{ 
    width: isSidebarOpen ? '320px' : '0px',
    minWidth: isSidebarOpen ? { xs: '100%', md: '320px' } : '0px',
    overflow: 'hidden',
    transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s ease',
    backgroundColor: '#ffffff',
    borderRight: isSidebarOpen ? '1px solid #e0e0e0' : 'none',
    zIndex: 5,
    position: { xs: 'absolute', md: 'relative' },
    height: { xs: '100%', md: 'auto' },
    display: 'flex',
    flexDirection: 'column'
  }}>
    {/* Шапка сайдбара с кнопкой скрытия меню */}
    {isSidebarOpen && (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, pr: 2, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <Tooltip title="Скрыть содержание">
          <IconButton onClick={() => setIsSidebarOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
            <MenuOpenIcon />
          </IconButton>
        </Tooltip>
      </Box>
    )}
    
    {/* Само дерево статей */}
    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
      {/* 🟢 ДОБАВЛЕНА ПРОВЕРКА: Если данные пришли, рендерим компонент дерева */}
      {sidebarTree && sidebarTree.length > 0 ? (
        <SidebarTree 
          treeData={sidebarTree} 
          activeId={activeArticleId} 
          expandedItems={expandedItems} 
          onNodeSelect={handleNodeSelect} 
        />
      ) : (
        // Временная заглушка во время загрузки, чтобы сайдбар не выглядел абсолютно пустым
        <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
          Загрузка содержания...
        </Typography>
      )}
    </Box>
  </Box>

      {/* 🟢 КНОПКА «ОТКРЫТЬ САЙДБАР» (Теперь она фиксированная и парит слева, не сдвигая верстку статьи) */}
      {!isSidebarOpen && (
        <Box sx={{ position: 'fixed', top: 85, left: 24, zIndex: 10 }}>
          <Tooltip title="Открыть содержание" placement="right">
            <IconButton 
              onClick={() => setIsSidebarOpen(true)}
              sx={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e0e0e0',
                boxShadow: '0px 2px 6px rgba(0,0,0,0.05)', 
                '&:hover': { backgroundColor: '#f5f5f5' } 
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* ПРАВАЯ КОЛОНКА: Контент статьи (Исправлено: убраны динамические padding-отступы) */}
      <Box sx={{ 
        flexGrow: 1, 
        boxSizing: 'border-box', 
        px: { xs: 3, md: 6 }, 
        pt: 5, 
        pb: 6
      }}>
        <Box sx={{ maxWidth: '850px', width: '100%', mx: 'auto', position: 'relative' }}>
          
          {/* КНОПКА НАЗАД */}
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/home')} sx={{ mb: 4, textTransform: 'none', fontWeight: 'bold' }} color="inherit">
            Назад
          </Button>

          {/* БЛОК КНОПОК ДЛЯ АДМИНИСТРАТОРА (Теперь они жестко привязаны к контейнеру статьи) */}
          {isAdmin && (
            <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 1, zIndex: 2 }}>
              <Tooltip title="Создать подстатью">
                <IconButton color="success" onClick={() => navigate(`/article/create?parentId=${id}`)} sx={{ backgroundColor: '#ffffff', boxShadow: '0px 2px 8px rgba(0,0,0,0.08)' }}><AddIcon /></IconButton>
              </Tooltip>
              <Tooltip title="История изменений">
                <IconButton color="default" onClick={handleOpenHistory} sx={{ backgroundColor: '#ffffff', boxShadow: '0px 2px 8px rgba(0,0,0,0.08)' }}><HistoryIcon /></IconButton>
              </Tooltip>
              <Tooltip title="Редактировать статью">
                <IconButton color="primary" onClick={() => navigate(`/article/edit/${id}`)} sx={{ backgroundColor: '#ffffff', boxShadow: '0px 2px 8px rgba(0,0,0,0.08)' }}><EditIcon /></IconButton>
              </Tooltip>
              <Tooltip title="Удалить статью">
                <IconButton color="error" onClick={handleDelete} sx={{ backgroundColor: '#ffffff', boxShadow: '0px 2px 8px rgba(0,0,0,0.08)' }}><DeleteIcon /></IconButton>
              </Tooltip>
            </Box>
          )}

          {/* БЛОК ЗАГОЛОВКА */}
          <Box sx={(theme) => ({ borderLeft: `6px solid ${theme.palette.primary.main}`, pl: 2.5, mb: 3, width: '100%' })}>
            <Typography variant="h3" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '2.2rem', md: '3rem' }, color: 'text.primary', lineHeight: 1.2, pr: isAdmin ? { xs: 18, md: 22 } : 0 }}>
              {titleText}
            </Typography>
          </Box>

          {/* МЕТА-ИНФОРМАЦИЯ */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3, mt: 2, mb: 4, color: 'text.secondary' }}>
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
          <Typography variant="body1" sx={{ fontSize: '1.15rem', lineHeight: '1.85', color: '#2c3e50', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
            {contentText}
          </Typography>

        </Box>
      </Box>
    </Box>

      {/* Модальное окно истории изменений (осталось без изменений) */}
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
          ) : !Array.isArray(historyList) || historyList.length === 0 ? (
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
                          startIcon={<RestoreIcon />}
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
                        secondary = {
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
