import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Добавили для навигации
import { styled, alpha } from '@mui/material/styles';
import { CardBlog } from '../components/CardBlog';
import { 
  AppBar, Box, Toolbar, IconButton, Typography, InputBase, 
  Drawer, List, ListItem, ListItemButton, ListItemText, Divider,
  Paper, MenuItem, MenuList, CircularProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide appearance="none" direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '15ch',
      '&:focus': {
        width: '25ch',
      },
    },
  },
}));

export default function Home() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // состояние открытия/закрытия боковой панели
  const username = localStorage.getItem('username') || 'Пользователь';
  const navigate = useNavigate();

  // Состояния для автокомплита поиска
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // ДОБАВЛЕНО: Состояния для хранения ленты статей и анимации загрузки
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // ДОБАВЛЕНО: Хук для загрузки списка всех статей для ленты
  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch('http://localhost:5170/api/Article');
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
        }
      } catch (error) {
        console.error("Ошибка загрузки ленты статей:", error);
      } finally {
        setLoading(false); // Выключаем спиннер загрузки
      }
    }
    fetchArticles();
  }, []);

  // Хук автокомплита поиска с задержкой (Ваш код)
  useEffect(() => {
    if (input.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:5170/api/Article/suggestions?query=${encodeURIComponent(input)}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setSuggestions(data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Ошибка загрузки подсказок:", error);
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [input]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* ВЕРХНЯЯ ПАНЕЛЬ С АНИМАЦИЕЙ СКРЫТИЯ */}
      <HideOnScroll>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
              onClick={() => setIsDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
            >
              EgovWiki
            </Typography>
            
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              
              <StyledInputBase
                placeholder="Поиск…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
              />

              {/* Выпадающий список подсказок поиска */}
              {Array.isArray(suggestions) && suggestions.length > 0 && (
                <Paper
                  elevation={4}
                  sx={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    maxHeight: '250px',
                    overflowY: 'auto',
                    backgroundColor: '#ffffff',
                    color: '#333333',
                  }}
                >
                  <MenuList disablePadding>
                    {suggestions.map((item, index) => {
                      let displayName = "";
                      if (item && typeof item === 'object') {
                        displayName = item.title || item.Title || JSON.stringify(item);
                      } else {
                        displayName = String(item);
                      }

                      return (
                        <MenuItem 
                          key={index} 
                          onClick={() => {
                            setInput(displayName);
                            setSuggestions([]);
                          }}
                          sx={{
                            whiteSpace: 'normal',
                            borderBottom: '1px solid #eee',
                            '&:last-child': { borderBottom: 'none' },
                            color: '#333333',
                          }}
                        >
                          {displayName}
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </Paper>
              )}
            </Search>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      {/* Toolbar-заглушка, чтобы AppBar fixed не перекрывал контент */}
      <Toolbar />

      {/* ВЫДВИГАЮЩАЯСЯ БОКОВАЯ ПАНЕЛЬ (DRAWER) */}
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Box 
          sx={{ width: 250 }} 
          role="presentation" 
          onClick={() => setIsDrawerOpen(false)}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f5f5f5' }}>
            <AccountCircleIcon color="action" fontSize="large" />
            <Typography variant="body1" fontWeight="bold">{username}</Typography>
          </Box>
          <Divider />
          
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/home')}>
                <ListItemText primary="Главная страница" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/profile')}>
                <ListItemText primary="Личный кабинет" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/settings')}>
                <ListItemText primary="Настройки" />
              </ListItemButton>
            </ListItem>
          </List>
          
          <Divider />
          
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}>
                <ListItemText primary="Выйти из системы" sx={{ color: 'error.main' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* ОСНОВНОЙ КОНТЕНТ (ЛЕНТА СТАТЕЙ КАРТОЧКАМИ) */}
      <Box 
        component="main" 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 4, 
          alignItems: 'center',
          backgroundColor: '#f9f9f9', 
          minHeight: '100vh'
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 500, mb: 1 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Лента EgovWiki
          </Typography>
        </Box>

        {/* Проверка состояния загрузки ленты */}
        {loading ? (
          <CircularProgress sx={{ mt: 5 }} />
        ) : articles.length === 0 ? (
          <Typography color="text.secondary">Статей пока нет.</Typography>
        ) : (
          articles.map((article) => (
            <CardBlog 
              key={article.id || article.Id} 
              article={article} 
              onClick={() => navigate(`/article/${article.id || article.Id}`)} 
            />
          ))
        )}
      </Box>
    </Box>
  );
}
