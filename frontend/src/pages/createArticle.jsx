import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, TextField, Button, Typography, Paper, Container, 
  CircularProgress, Alert, MenuItem, Select, InputLabel, FormControl, Chip, OutlinedInput
} from '@mui/material';

export default function CreateArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id); // Флаг: true — редактирование, false — создание

  // Состояния для полей формы
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]); // Выбранные ID категорий
  
  // Системные состояния
  const [categoriesList, setCategoriesList] = useState([]); // Список всех категорий для выпадающего меню
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {//Загружаем список всех доступных категорий
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

    if (isEditMode) {//будучи в режиме редактирования -> подтягиваем старые данные
      async function fetchArticleData() {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:5170/api/Article/${id}`);
          if (response.ok) {
            const data = await response.json();
            setTitle(data.title || data.Title);
            setContent(data.content || data.Content);
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

  const handleSubmit = async (e) => {// отправка формы
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
      categoryIds: selectedCategories
    };

    setLoading(true);
    try {
      const url = isEditMode// метод в зависимости от режима
        ? `http://localhost:5170/api/Article/${id}` 
        : 'http://localhost:5170/api/Article';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` //Передаем токен
        },
        body: JSON.stringify(articleDto)
      });

    if (response.ok) {
      setSuccess(isEditMode ? 'Статья успешно обновлена!' : 'Статья успешно создана!');
      
      setTimeout(() => {
        if (isEditMode) {
          navigate(`/article/${id}`); 
        } else {
          navigate('/home'); 
        }
      }, 1500);
    }
else {
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
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'flex-start',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      pt: 5,
      pb: 5,
      width: '100vw'
    }}
  >
    <Container 
      maxWidth="lg" 
      disableGutters
      sx={{ 
        width: '100%',
        mx: 'auto'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {isEditMode ? 'Редактирование статьи' : 'Создание новой статьи'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Заполните форму ниже. Изменения будут сохранены в общую базу EgovWiki.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Название статьи"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />

          <FormControl fullWidth margin="normal">
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
                    return <Chip key={value} label={cat ? (cat.name || cat.Name) : value} />;
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
            margin="normal"
            required
            fullWidth
            multiline
            rows={12}
            label="Содержимое статьи (Поддерживает только текст)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            sx={{ mt: 2 }}
              inputProps={{ 
              spellCheck: true, 
              lang: 'ru'
            }} 
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button 
              variant="outlined" 
              color="inherit" 
              onClick={() => navigate('/home')}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                backgroundImage: 'linear-gradient(147deg, #fe8a39 0%, #fd3838 74%)',
                px: 4,
                fontWeight: 'bold'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : isEditMode ? 'Сохранить изменения' : 'Опубликовать'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  </Box>
);
}