import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Container, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Alert, Chip, IconButton, Tooltip 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import ComputerIcon from '@mui/icons-material/Computer';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../components/Layout';

export default function VirtualMachinesList() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('role') === 'admin';
  
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  //Загрузка данных обо всех виртуальных машинах с бэкенда
  const fetchVirtualMachines = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5170/api/VirtualMachine');
      if (response.ok) {
        const data = await response.json();
        setVms(data);
      } else {
        setError('Не удалось загрузить список виртуальных машин.');
      }
    } catch (err) {
      console.error(err);
      setError('Нет связи с сервером. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    const currentRole = localStorage.getItem('role');
    if (currentRole !== 'admin') {
        navigate('/home');
        return;
    }

    // Если всё хорошо и это админ — загружаем список машин
    fetchVirtualMachines();
    }, [navigate]);

  //ункция удаления виртуальной машины администратором
  const handleDeleteVM = async (e, vmId, vmName) => {
    e.stopPropagation(); // Изолируем клик, чтобы не срабатывало нажатие на саму строку таблицы
    if (!window.confirm(`Вы уверены, что хотите удалить виртуальную машину "${vmName}"?`)) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5170/api/VirtualMachine/${vmId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Машина успешно удалена');
        setVms((prev) => prev.filter(vm => (vm.id || vm.Id) !== vmId));
      } else {
        alert('Не удалось удалить машину. Ошибка сервера.');
      }
    } catch (err) {
      console.error(err);
    }
  };
  //Функция для цветного отображения статусов серверов
  const getStatusChip = (status) => {
    const currentStatus = status?.toLowerCase() || 'active';
    switch (currentStatus) {
      case 'active':
        return <Chip label="Active" color="success" size="small" sx={{ fontWeight: 'bold' }} />;
      case 'stopped':
        return <Chip label="Stopped" color="error" size="small" sx={{ fontWeight: 'bold' }} />;
      case 'maintenance':
        return <Chip label="Maintenance" color="warning" size="small" sx={{ fontWeight: 'bold' }} />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  return (
    <Layout>
      <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#f9f9f9', boxSizing: 'border-box', px: { xs: 2, md: 4 }, pt: 4, pb: 5 }}>
        <Container maxWidth="lg" disableGutters sx={{ width: '100%', mx: 'auto' }}>
          
          {/* ВЕРХНЯЯ ПАНЕЛЬ С КНОПКАМИ НАВИГАЦИИ И УПРАВЛЕНИЯ */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate('/home')} 
              sx={{ textTransform: 'none', fontWeight: 'bold' }} 
              color="inherit"
            >
              На главную
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/vms/create')}
              sx={{ 
                backgroundImage: 'linear-gradient(147deg, #fe8a39 0%, #fd3838 74%)',
                textTransform: 'none', 
                fontWeight: 'bold', 
                borderRadius: 2, 
                px: 3,
                boxShadow: '0px 4px 12px rgba(253, 56, 56, 0.2)'
              }}
            >
              Добавить VM
            </Button>
          </Box>

          {/* БЛОК ЗАГОЛОВКА СТРАНИЦЫ */}
          <Box sx={{ mb: 4, pl: 0, width: '100%', boxSizing: 'border-box' }}>
            <Typography variant="h3" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, color: 'text.primary', lineHeight: 1.2 }}>
              Виртуальные машины
            </Typography>
          </Box>

          {/* ОБРАБОТЧИК ЛОАДЕРА И ОШИБОК */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          ) : vms.length === 0 ? (
            <Typography color="text.secondary" sx={{ pl: 1 }}>Виртуальных машин в реестре пока нет.</Typography>
          ) : (
            
            /* ТАБЛИЦА СЕРВЕРОВ */
            <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 3, overflow: 'visible' }}>
              <Table sx={{ minWidth: 650 }} aria-label="vms table">
                <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Название VM</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>IP-Адрес</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>ОС</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Статус</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Подсистемы (статьи)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vms.map((vm) => {
                    const vmId = vm.id || vm.Id;
                    const vmName = vm.name || vm.Name;
                    const articles = vm.articles || vm.Articles || [];

                    return (
                      <TableRow 
                        key={vmId}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 }, 
                          '&:hover': { backgroundColor: '#f8fafc' },
                          '&:hover .vm-admin-box': { opacity: 1 }
                        }}
                      >
                        {/* Имя машины + Кнопки админа */}
                        <TableCell component="th" scope="row" sx={{ fontWeight: 600, minWidth: '220px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ComputerIcon fontSize="small" sx={{ color: '#64748b' }} />
                              {vmName}
                            </Box>

                            {isAdmin && (
                              <Box 
                                className="vm-admin-box"
                                sx={{ 
                                  display: 'flex', 
                                  gap: 0.5, 
                                  opacity: 0, 
                                  transition: 'opacity 0.2s ease-in-out',
                                  ml: 2
                                }}
                              >
                                <Tooltip title="Редактировать">
                                  <IconButton size="small" onClick={() => navigate(`/vms/edit/${vmId}`)} sx={{ color: '#64748b', '&:hover': { color: 'primary.main' } }}>
                                    <EditIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Удалить">
                                  <IconButton size="small" onClick={(e) => handleDeleteVM(e, vmId, vmName)} sx={{ color: '#64748b', '&:hover': { color: 'error.main' } }}>
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.95rem', color: '#334155' }}>
                          {vm.ipAddress || vm.IpAddress}
                        </TableCell>
                        <TableCell sx={{ color: '#475569' }}>
                          {vm.os || vm.OS || 'Не указана'}
                        </TableCell>
                        <TableCell>
                          {getStatusChip(vm.status || vm.Status)}
                        </TableCell>
                        
                        {/* Вывод связанных подсистем списком чипов */}
                        <TableCell>
                          {articles.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {articles.map((art, idx) => {
                                const artId = art.id || art.Id;
                                const artTitle = art.title || art.Title;
                                return (
                                  <Chip 
                                    key={idx}
                                    label={artTitle}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => navigate(`/article/${artId}`)}
                                    sx={{ cursor: 'pointer', fontWeight: '500', '&:hover': { backgroundColor: '#e2e8f0' } }}
                                  />
                                );
                              })}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                              Не привязана
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

        </Container>
      </Box>
    </Layout>
  );
}
