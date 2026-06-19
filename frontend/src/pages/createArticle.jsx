import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, TextField, Button, Typography, Container, 
  CircularProgress, Alert, MenuItem, Select, InputLabel, 
  FormControl, Chip, OutlinedInput, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

  // Системные состояния
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Извлекаем parentId из URL при создании подстатьи
  useEffect(() => {
    if (!isEditMode) {
      const queryParams = new URLSearchParams(location.search);
      const urlParentId = queryParams.get('parentId');
      if (urlParentId) {
        setParentId(parseInt(urlParentId, 10));
      }
    }
  }, [location.search, isEditMode]);

  // 2. Подгружаем название родительской статьи вместо вывода её ID
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
    async function loadCategories() {
      try {
        const response = await fetch('http://localhost:5170/api/Category');
        if (response.ok) {
          const data = await response.json();
          setCategoriesList(data);
        }
      } catch (err) {
        console.error("Не удалось загрузить категории:", err);
      }
    }
    loadCategories();

    if (isEditMode) {
      async function fetchArticleData() {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:5170/api/Article/${id}`);
          if (response.ok) {
            const data = await response.json();
            setTitle(data.title || data.Title);
            setContent(data.content || data.Content);
            setParentId(data.parentId || data.ParentId || null);
            if (data.categoryIds || data.CategoryIds) {
              setSelectedCategories(data.categoryIds || data.CategoryIds);
            }
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

    const articleDto = {
      title: title.trim(),
      content: content.trim(),
      authorId: authorId,
      parentId: parentId,
      categoryIds: selectedCategories
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

        {/* ЗАГОЛОВКА С СИНЕЙ ЛИНИЕЙ (КАК НА СТРАНИЦЕ ЧТЕНИЯ) */}
        <Box sx={(theme) => ({ borderLeft: `6px solid ${theme.palette.primary.main}`, pl: 2, mb: 1, width: '100%', boxSizing: 'border-box' })}>
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

          <TextField
            required
            fullWidth
            multiline
            rows={14}
            label="Содержимое статьи"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            variant="outlined"
            sx={{ backgroundColor: '#ffffff', borderRadius: 1 }}
            inputProps={{ 
              spellCheck: true, 
              lang: 'ru',
              style: { fontFamily: 'inherit', lineHeight: '1.6' }
            }} 
          />

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
