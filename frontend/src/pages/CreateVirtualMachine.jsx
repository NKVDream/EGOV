import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, TextField, Button, Typography, Container, 
  CircularProgress, Alert, MenuItem, Select, InputLabel, 
  FormControl, Divider, Chip, OutlinedInput, Checkbox, ListItemText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '../components/Layout';

export default function CreateVirtualMachine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id); // Флаг: true — редактирование, false — создание

  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [os, setOs] = useState('');
  const [status, setStatus] = useState('Active');

  const [selectedArticleIds, setSelectedArticleIds] = useState([]); 
  const [articlesList, setArticlesList] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadArticles() {
      try {
        const response = await fetch('http://localhost:5170/api/Article');
        if (response.ok) {
          const data = await response.json();
          setArticlesList(data);
        }
      } catch (err) {
        console.error("Не удалось загрузить подсистемы:", err);
      }
    }
    loadArticles();

    if (isEditMode) {
      async function fetchVmData() {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:5170/api/VirtualMachine/${id}`);
          if (response.ok) {
            const data = await response.json();
            setName(data.name || data.Name || '');
            setIpAddress(data.ipAddress || data.IpAddress || '');
            setOs(data.os || data.OS || '');
            setStatus(data.status || data.Status || 'Active');
          
            const articleIds = data.articleIds || data.ArticleIds || [];
            setSelectedArticleIds(articleIds);
          } else {
            setError('Виртуальная машина не найдена.');
          }
        } catch (err) {
          setError('Ошибка при загрузке данных виртуальной машины.');
        } finally {
          setLoading(false);
        }
      }
      fetchVmData();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !ipAddress.trim()) {
      setError('Название машины и IP-адрес обязательны для заполнения.');
      return;
    }

    const token = localStorage.getItem('token'); 

    const vmDto = {
      name: name.trim(),
      ipAddress: ipAddress.trim(),
      os: os.trim() || null,
      status: status,
      articleIds: selectedArticleIds
    };

    setLoading(true);
    try {
      const url = isEditMode 
        ? `http://localhost:5170/api/VirtualMachine/${id}` 
        : 'http://localhost:5170/api/VirtualMachine';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vmDto)
      });

      if (response.ok) {
        setSuccess(isEditMode ? 'Данные машины успешно обновлены!' : 'Виртуальная машина успешно добавлена!');
        setTimeout(() => {
          navigate('/vms');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Произошла ошибка при сохранении машины.');
      }
    } catch (err) {
      setError('Нет связи с сервером. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };
  if (loading && isEditMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Layout>
      <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#f9f9f9', boxSizing: 'border-box', px: { xs: 2, md: 4 }, pt: 4, pb: 5 }}>
        <Container maxWidth="md" disableGutters sx={{ width: '100%', mx: 'auto' }}>
          
          {/* КНОПКА НАЗАД */}
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/vms')} 
            sx={{ mb: 3, textTransform: 'none', fontWeight: 'bold' }} 
            color="inherit"
          >
            К списку машин
          </Button>

          {/* ДИНАМИЧЕСКИЙ ЗАГОЛОВОК СТРАНИЦЫ */}
          <Box sx={{ mb: 1, width: '100%', boxSizing: 'border-box' }}>
            <Typography variant="h3" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, color: 'text.primary', lineHeight: 1.2 }}>
              {isEditMode ? 'Редактирование виртуальной машины' : 'Добавление виртуальной машины'}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {isEditMode ? 'Измените параметры сервера. Изменения сохранятся в общую базу данных.' : 'Заполните параметры сервера. Новая машина появится в реестре инфраструктуры.'}
          </Typography>

          <Divider sx={{ mb: 4 }} />

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          {/* ФОРМА ВВОДА */}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            
            <TextField
              required
              fullWidth
              label="Название виртуальной машины"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              variant="outlined"
              sx={{ backgroundColor: '#ffffff', borderRadius: 1 }}
            />

            <TextField
              required
              fullWidth
              label="IP-Адрес сервера"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              disabled={loading}
              variant="outlined"
              sx={{ backgroundColor: '#ffffff', borderRadius: 1 }}
              inputProps={{ style: { fontFamily: 'monospace' } }}
            />

            <TextField
              fullWidth
              label="Операционная система"
              value={os}
              onChange={(e) => setOs(e.target.value)}
              disabled={loading}
              variant="outlined"
              sx={{ backgroundColor: '#ffffff', borderRadius: 1 }}
            />

            {/* ВЫБОР СТАТУСА */}
            <FormControl fullWidth sx={{ backgroundColor: '#ffffff', borderRadius: 1 }}>
              <InputLabel id="status-label">Статус машины</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                label="Статус машины"
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="Active">Active (Работает)</MenuItem>
                <MenuItem value="Stopped">Stopped (Остановлен)</MenuItem>
                <MenuItem value="Maintenance">Maintenance (Обслуживание)</MenuItem>
              </Select>
            </FormControl>

            {/* КНОПКИ УПРАВЛЕНИЯ ФОРМОЙ */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={() => navigate('/vms')}
                disabled={loading}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                Отмена
              </Button>
              
              <Button
                type="submit"
                disabled={loading}
                variant="contained"
                sx={{
                  backgroundImage: 'linear-gradient(147deg, #fe8a39 0%, #fd3838 74%)',
                  px: 5,
                  py: 1.2,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0px 4px 12px rgba(253, 56, 56, 0.3)'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : isEditMode ? 'Сохранить изменения' : 'Добавить машину'}
              </Button>
            </Box>

          </Box>
        </Container>
      </Box>
    </Layout>
  );
}
