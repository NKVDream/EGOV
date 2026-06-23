import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, CircularProgress, Alert, 
  Chip, Divider, IconButton, Tooltip, Dialog, DialogTitle, 
  DialogContent, DialogActions, List, ListItem, ListItemText 
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History'; 
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu'; 
import MenuOpenIcon from '@mui/icons-material/MenuOpen'; 
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; 
import Layout from '../components/Layout';
import { SidebarTree } from '../components/SidebarTree';
import { jsPDF } from 'jspdf'; 
import html2canvas from 'html2canvas'; 

export default function ReadArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('role') === 'admin';

  // Состояния для сайдбара
  const [sidebarTree, setSidebarTree] = useState([]); 
  const [expandedItems, setExpandedItems] = useState([]);
  const [activeArticleId, setActiveArticleId] = useState(parseInt(id, 10));

  // Состояния для контента статьи и инфраструктуры
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attachedVms, setAttachedVms] = useState([]);

  // Состояния для управления историей изменений
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Стейт для закрытия/открытия сайдбара
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 1. СИНХРОНИЗАЦИЯ: Принудительно обновляем внутренний стейт при смене ID в URL
  useEffect(() => {
    if (id) {
      setActiveArticleId(parseInt(id, 10));
    }
  }, [id]);

  // 2. ХУК: Загрузка структуры сайдбара при смене ID в URL
  useEffect(() => {
    if (id) {
      fetch(`http://localhost:5170/api/Article/${id}/sidebar`)
        .then((res) => {
          if (!res.ok) throw new Error("Ошибка сервера при загрузке меню");
          return res.json();
        })
        .then((data) => {
          console.log("Данные сайдбара из БД:", data);
          
          const nodes = data.tree || data.Tree || [];
          const expanded = data.expandedIds || data.ExpandedIds || [];
          const nodesArray = Array.isArray(nodes) ? nodes : [nodes];
          
          setSidebarTree(nodesArray);
          setExpandedItems(expanded);
        })
        .catch((err) => {
          console.error("Ошибка в fetch сайдбара:", err);
          setSidebarTree([]); 
        });
    }
  }, [id]);

  // 3. ФУНКЦИЯ: Загрузка содержимого статьи и связанных виртуальных машин
  const fetchArticle = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token'); 

      const response = await fetch(`http://localhost:5170/api/Article/${activeArticleId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setArticle(data);
        
        const vms = data.virtualMachines || data.VirtualMachines || [];
        setAttachedVms(vms);
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

  // 4. ФУНКЦИЯ: Выгрузка статьи и инфраструктуры в PDF
  const handleDownloadPDF = async () => {
    const element = document.getElementById('article-pdf-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; 
      const pageHeight = 295; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const rawTitle = article?.title || article?.Title || 'article';
      const fileName = `${rawTitle.replace(/[^a-zA-Z0-9а-яА-Я ]/g, '')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Ошибка при генерации PDF:", err);
      alert("Не удалось сгенерировать PDF файл.");
    }
  };

  // Обработчик клика по элементу в SidebarTree
  const handleNodeSelect = (selectedId) => {
    if (selectedId && selectedId !== activeArticleId) {
      navigate(`/article/${selectedId}`); 
    }
  };

  // Функция загрузки истории изменений с бэкенда
  const fetchHistory = async () => {
    setLoadingHistory(true);
    const token = localStorage.getItem('token');
    try {
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

  const handleOpenHistory = () => {
    setHistoryDialogOpen(true);
    fetchHistory();
  };

  const handleRollback = async (versionId) => {
    if (!window.confirm('Вы уверены, что хотите восстановить эту версию статьи? Текущий текст будет заменен.')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
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
        fetchArticle(); 
      } else {
        alert('Не удалось откатить изменения. Ошибка сервера.');
      }
    } catch (error) {
      console.error('Ошибка при откате статьи:', error);
      alert('Ошибка соединения с сервером.');
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

        if (activeArticleId === parseInt(id, 10)) {
          navigate('/home');
        } else {
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
      {/*Если данные пришли, рендерим компонент дерева */}
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

      {/* Контент статьи*/}
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

          {/* БЛОК КНОПОК ДЛЯ АДМИНИСТРАТОРА*/}
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
          
          {/* Виртуалки внизу */}
          {isAdmin && attachedVms && attachedVms.length > 0 && (
            <Box sx={{ mt: 6, width: '100%' }}>
              
              {/* Линия-разделитель */}
              <Divider sx={{ mb: 4, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
              
              <Typography 
                variant="h5" 
                component="h3" 
                fontWeight="bold" 
                sx={{ color: '#1e293b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                Связанная инфраструктура
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Виртуальные машины и сервера, развёрнутые для обеспечения работы данной подсистемы:
              </Typography>

              {/* Сетка горизонтальных карточек серверов */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {attachedVms.map((vm, idx) => {
                  const vmId = vm.id || vm.Id;
                  const vmStatus = (vm.status || vm.Status || 'active').toLowerCase();
                  
                  // Определяем цвет левой полоски карточки в зависимости от статуса сервера
                  const getStatusColor = (status) => {
                    if (status === 'active') return '#2e7d32'; // Зеленый
                    if (status === 'stopped') return '#d32f2f'; // Красный
                    return '#ed6c02'; // Оранжевый (Maintenance)
                  };

                  return (
                    <Box 
                      key={vmId || idx}
                      onClick={() => navigate('/vms')} // Клик по серверу переводит на общий реестр VM
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        p: 2,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderLeft: `4px solid ${getStatusColor(vmStatus)}`, // Цветная полоса статуса
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.04)',
                          borderColor: '#cbd5e1'
                        }
                      }}
                    >
                      {/* Название и статус */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1e293b' }}>
                          {vm.name || vm.Name}
                        </Typography>
                        <Box 
                          sx={{ 
                            width: '8px', height: '8px', borderRadius: '50%', 
                            backgroundColor: getStatusColor(vmStatus) 
                          }} 
                        />
                      </Box>

                      {/* IP-Адрес (Моноширинный) */}
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#475569', mb: 0.5, fontWeight: 500 }}>
                        IP: {vm.ipAddress || vm.IpAddress}
                      </Typography>

                      {/* Операционная система */}
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        ОС: {vm.os || vm.OS || 'Не указана'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}


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
