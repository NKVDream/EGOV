import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import { 
  AppBar, Box, Toolbar, IconButton, Typography, InputBase, 
  Drawer, List, ListItem, ListItemButton, ListItemText, Divider,
  Paper, MenuItem, MenuList, Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';
import AddIcon from '@mui/icons-material/Add';

//Анимация скрытия шапки при скролле вниз
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide appearance="none" direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

//Стили для строки поиска
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

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const username = localStorage.getItem('username') || 'Пользователь';

  // Состояния для автокомплита поиска
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Эффект для живого поиска подсказок на сервере (с задержкой 250мс)
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
    <Box sx={{ flexGrow: 1, width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
      {/* Верхняя адаптивная панель навигации */}
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

            {/* Кнопка создания статьи доступна только Админу */}
            {localStorage.getItem('role') === 'admin' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/article/create')}
                sx={{
                  mr: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.35)',
                  },
                  display: 'flex',
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: 0, sm: 1 }
                  },
                  px: { xs: 1.5, sm: 2 }
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Создать статью
                </Box>
              </Button>
            )}

            {/* Поисковый блок */}
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

              {/* Выпадающие подсказки поиска */}
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
                      const articleId = item?.id || item?.Id;
                      const displayName = item?.title || item?.Title || String(item);

                      return (
                        <MenuItem 
                          key={index} 
                          onClick={() => {
                            setInput('');
                            setSuggestions([]);
                            if (articleId) {
                              navigate(`/article/${articleId}`);
                            }
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

      <Toolbar />

      {/* Выдвижная боковая панель (Drawer) */}
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

      {/* Место для уникального контента любой из страниц сайта */}
      <Box component="main" sx={{ width: '100%', boxSizing: 'border-box' }}>
        {children}
      </Box>
    </Box>
  );
}