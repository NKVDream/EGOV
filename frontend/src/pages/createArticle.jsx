import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, TextField, Button, Typography, Paper, Container, 
  CircularProgress, Alert, MenuItem, Select, InputLabel, FormControl, Chip, OutlinedInput
} from '@mui/material';

export default function CreateArticle() {
  const { id } = useParams(); // Извлекаем ID из URL (если мы в режиме редактирования)
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

  // 1. ПРИ ИНИЦИАЛИЗАЦИИ: Загружаем список всех доступных категорий
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('http://localhost:5170/api/Category'); // Замените на ваш эндпоинт категорий
        if (response.ok) {
          const data = await response.json();
          setCategoriesList(data);
        }
      } catch (err) {
        console.error("Не удалось загрузить категории:", err);
      }
    }
    loadCategories();

    // 2. ЕСЛИ РЕЖИМ РЕДАКТИРОВАНИЯ: Подтягиваем старые данные статьи
    if (isEditMode) {
      async function fetchArticleData() {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:5170/api/Article/${id}`);
          if (response.ok) {
            const data = await response.json();
            setTitle(data.title || data.Title);
            setContent(data.content || data.Content);
            // Заполняем выбранные категории массивом их ID
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

  // 3. ОБРАБОТЧИК ОТПРАВКИ ФОРМЫ (ОБЩИЙ ДЛЯ POST И PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !content.trim()) {
      setError('Название и содержимое статьи не могут быть пустыми.');
      return;
    }

    // Вытаскиваем токен и ID пользователя из localStorage (сохраненные при логине)
    const token = localStorage.getItem('token'); 
    const authorId = parseInt(localStorage.getItem('userId')) || 1; // ID текущего админа

    // Формируем DTO, строго соответствующий вашему ArticleCreateDto на бэке
    const articleDto = {
      title: title.trim(),          // ⇄ public string Title
      content: content.trim(),      // ⇄ public string Content
      authorId: authorId,           // ⇄ public int AuthorId
      categoryIds: selectedCategories // ⇄ public List<int> CategoryIds
    };

    setLoading(true);
    try {
      // Меняем метод и URL в зависимости от режима (PUT или POST)
      const url = isEditMode 
        ? `http://localhost:5170/api/Article/${id}` 
        : 'http://localhost:5170/api/Article';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Передаем токен для [Authorize(Roles = "admin")]
        },
        body: JSON.stringify(articleDto)
      });

      if (response.ok) {
        setSuccess(isEditMode ? 'Статья успешно обновлена!' : 'Статья успешно создана!');
        setTimeout(() => {
          navigate('/home'); // Перенаправляем на главную ленту через 1.5 секунды
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
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {isEditMode ? 'Редактирование статьи' : 'Создание новой статьи'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Заполните форму ниже. Изменения будут сохранены в общую базу EgovWiki.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* ПОЛЕ НАЗВАНИЯ */}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Название статьи"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />

          {/* МНОЖЕСТВЕННЫЙ ВЫБОР КАТЕГОРИЙ (MUI Select Multiple + Chips) */}
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

          {/* ПОЛЕ ТЕКСТА СТАТЬИ */}
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={12} // Делаем поле большим, как полноценный текстовый редактор
            label="Содержимое статьи (Поддерживает текст)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            sx={{ mt: 2 }}
          />

          {/* КНОПКИ ДЕЙСТВИЯ */}
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
  );
}
