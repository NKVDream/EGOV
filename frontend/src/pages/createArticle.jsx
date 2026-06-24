import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, TextField, Button, Typography, Container, 
  CircularProgress, Alert, MenuItem, Select, InputLabel, 
  FormControl, Chip, OutlinedInput, Divider, Checkbox, ListItemText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextEditor from '../components/TextEditor';


export default function CreateArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEditMode = Boolean(id);

  // Состояния для полей формы
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [parentId, setParentId] = useState(null);
  const [parentTitle, setParentTitle] = useState('');

  const [vmsList, setVmsList] = useState([]); // Все машины из базы данных
  const [selectedVmIds, setSelectedVmIds] = useState([]); // Выбранные ID машин для этой статьи

  // Системные состояния
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  //Извлекаем parentId из URL при создании подстатьи
  useEffect(() => {
    if (!isEditMode) {
      const queryParams = new URLSearchParams(location.search);
      const urlParentId = queryParams.get('parentId');
      if (urlParentId) {
        setParentId(parseInt(urlParentId, 10));
      }
    }
  }, [location.search, isEditMode]);

  useEffect(() => {
    if (parentId) {
      fetch(`http://localhost:5170/api/Article/${parentId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error();
        })
        .then((data) => setParentTitle(data.title || data.Title))
        .catch(() => setParentTitle(`Статья #${parentId}`));
    }
  }, [parentId]);

    useEffect(() => {
    async function loadInitialFormData() {
      try {
        const catResponse = await fetch('http://localhost:5170/api/Category');
        if (catResponse.ok) setCategoriesList(await catResponse.json());

        const vmResponse = await fetch('http://localhost:5170/api/VirtualMachine');
        if (vmResponse.ok) setVmsList(await vmResponse.json());
      } catch (err) {
        console.error("Не удалось инициализировать данные формы:", err);
      }
    }
    loadInitialFormData();

    if (isEditMode) {
  async function fetchArticleData() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); 
      const response = await fetch(`http://localhost:5170/api/Article/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Полные данные статьи из БД при редактировании:", data);

        setTitle(data.title || data.Title || '');
        setContent(data.content || data.Content || '');
        setParentId(data.parentId || data.ParentId || null);
        
        if (data.categoryIds || data.CategoryIds) {
          setSelectedCategories(data.categoryIds || data.CategoryIds);
        }

        // Безопасно извлекаем ID виртуальных машин для галочек
        let vmIds = [];
        if (data.virtualMachineIds || data.VirtualMachineIds) {
          vmIds = data.virtualMachineIds || data.VirtualMachineIds;
        } else {
          const rawVms = data.virtualMachines || data.VirtualMachines || [];
          vmIds = rawVms.map(vm => vm.id !== undefined ? vm.id : vm.Id);
        }

        const cleanVmIds = vmIds.filter(vId => vId !== undefined && vId !== null).map(vId => Number(vId));
        setSelectedVmIds(cleanVmIds);

      } else {
        setError('Статья не найдена или удалена');
      }
    } catch (err) {
      setError('Ошибка при загрузке данных статьи');
    } finally {
      setLoading(false);
    }
  }
  fetchArticleData();
}
}, [id, isEditMode]);

  //Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !content.trim()) {
      setError('Название и содержимое статьи не могут быть пустыми.');
      return;
    }

    const token = localStorage.getItem('token'); 
    const authorId = parseInt(localStorage.getItem('userId')) || 1;

    // Собираем объект DTO
    const articleDto = {
      title: title.trim(),
      content: content.trim(),
      authorId: authorId,
      parentId: parentId,
      categoryIds: selectedCategories,
      virtualMachineIds: selectedVmIds 
    };

    setLoading(true);
    try {
      const url = isEditMode
        ? `http://localhost:5170/api/Article/${id}` 
        : 'http://localhost:5170/api/Article';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(articleDto)
      });

      if (response.ok) {
        setSuccess(isEditMode ? 'Статья успешно обновлена!' : 'Статья успешно создана!');
        
        setTimeout(() => {
          if (isEditMode) {
            navigate(`/article/${id}`); 
          } else {
            if (parentId) {
              navigate(`/article/${parentId}`);
            } else {
              navigate('/home'); 
            }
          }
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Произошла ошибка при сохранении статьи.');
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
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#f9f9f9', boxSizing: 'border-box', px: { xs: 2, md: 4 }, pt: 4, pb: 5 }}>
      <Container maxWidth="md" disableGutters sx={{ width: '100%', mx: 'auto' }}>
        
        {/* КНОПКА НАЗАД */}
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => parentId ? navigate(`/article/${parentId}`) : navigate('/home')} 
          sx={{ mb: 3, textTransform: 'none', fontWeight: 'bold' }} 
          color="inherit"
        >
          Назад
        </Button>
        
        <Box>
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ fontSize: { xs: '2.2rem', md: '3.2rem' }, color: 'text.primary', lineHeight: 1.2 }}>
            {isEditMode ? 'Редактирование статьи' : 'Создание новой статьи'}
          </Typography>
        </Box>

        {/* ПОДСКАЗКА С НАЗВАНИЕМ РОДИТЕЛЬСКОЙ СТАТЬИ */}
        {!isEditMode && parentId && (
          <Typography variant="subtitle1" sx={{ pl: 2, mb: 2, color: 'primary.main', fontWeight: '500' }}>
            Эта статья создается как подстатья к: <strong>«{parentTitle || 'Загрузка...'}»</strong>
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ pl: 2, mb: 3 }}>
          Изменения будут сохранены в общую базу знаний EgovWiki.
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          
          <TextField
            required
            fullWidth
            label="Название статьи"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            variant="outlined"
            sx={{ backgroundColor: '#ffffff', borderRadius: 1 }}
          />

          <FormControl fullWidth sx={{ backgroundColor: '#ffffff', borderRadius: 1 }}>
            <InputLabel id="categories-label">Категории</InputLabel>
            <Select
              labelId="categories-label"
              multiple
              value={selectedCategories}
              onChange={(e) => setSelectedCategories(e.target.value)}
              input={<OutlinedInput label="Категории" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const cat = categoriesList.find(c => c.id === value || c.Id === value);
                    return <Chip key={value} label={cat ? (cat.name || cat.Name) : value} size="small" />;
                  })}
                </Box>
              )}
            >
              {categoriesList.map((category) => (
                <MenuItem key={category.id || category.Id} value={category.id || category.Id}>
                  {category.name || category.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* МНОЖЕСТВЕННЫЙ ВЫБОР ВИРТУАЛЬНЫХ МАШИН ДЛЯ ПОДСИСТЕМЫ */}
          <FormControl fullWidth sx={{ backgroundColor: '#ffffff', borderRadius: 1 }}>
            <InputLabel id="vms-multiple-label">Виртуальные машины инфраструктуры</InputLabel>
            <Select
              labelId="vms-multiple-label"
              multiple
              value={selectedVmIds.map(id => Number(id))}
              onChange={(e) => {
                const values = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
                setSelectedVmIds(values.map(v => Number(v)));
              }}
              input={<OutlinedInput label="Виртуальные машины инфраструктуры" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const vm = vmsList.find(v => Number(v.id || v.Id) === Number(value));
                    return <Chip key={value} label={vm ? `${vm.name || vm.Name} (${vm.ipAddress || vm.IpAddress})` : `VM #${value}`} size="small" color="primary" variant="outlined" />;
                  })}
                </Box>
              )}
            >
              {vmsList.map((vm) => {
                const vmId = Number(vm.id || vm.Id);
                const vmName = vm.name || vm.Name;
                const vmIp = vm.ipAddress || vm.IpAddress;
              
                const isChecked = selectedVmIds.map(id => Number(id)).includes(vmId);

                return (
                  <MenuItem key={vmId} value={vmId}>
                    <Checkbox checked={isChecked} />
                    <ListItemText primary={`${vmName} [${vmIp}]`} />
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>


          {/*ПОЛНОЦЕННЫЙ ТЕКСТОВЫЙ РЕДАКТОР С ПОДДЕРЖКОЙ КАРТИНОК И ЗАГОЛОВКОВ */}
          <Box 
            sx={{ 
              width: '100%', 
              backgroundColor: '#ffffff', 
              borderRadius: 1, // Сохраняем borderRadius: 1 как у TextField
              mt: 1,
              // Блокируем интерфейс редактора визуально, если идет отправка/загрузка данных (loading)
              opacity: loading ? 0.6 : 1,
              pointerEvents: loading ? 'none' : 'auto',
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                pl: 1, 
                mb: 0.5, 
                color: 'text.secondary', 
                fontWeight: 500,
                fontSize: '0.85rem'
              }}
            >
              Содержимое статьи *
            </Typography>

            <TextEditor 
              value={content} 
              // Напрямую передаем HTML-строку из редактора в ваш существующий стейт setContent
              onChange={(htmlContent) => setContent(htmlContent)} 
              placeholder="содержание"
            />
          </Box>

          {/* КНОПКИ УПРАВЛЕНИЯ */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
            <Button 
              variant="outlined" 
              color="inherit" 
              onClick={() => parentId ? navigate(`/article/${parentId}`) : navigate('/home')}
              disabled={loading}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Отмена
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                backgroundImage: 'linear-gradient(147deg, #fe8a39 0%, #fd3838 74%)',
                px: 5,
                py: 1.2,
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: '0px 4px 12px rgba(253, 56, 56, 0.3)'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : isEditMode ? 'Сохранить изменения' : 'Опубликовать'}
            </Button>
          </Box>

        </Box>
      </Container>
    </Box>
  );
}
