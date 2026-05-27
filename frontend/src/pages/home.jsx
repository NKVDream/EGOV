import { useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import { AppBar, Box, Toolbar, IconButton, Typography, InputBase, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
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
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

export default function Home() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);//состояние открытия/закрытия боковой панели
  const username = localStorage.getItem('username') || 'Пользователь';

  return (
    <Box sx={{ flexGrow: 1 }}>
      <HideOnScroll>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={() => setIsDrawerOpen(true)} //ВКЛЮЧАЕМ ТРИГГЕР ОТКРЫТИЯ
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
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
        </Toolbar>
      </AppBar>
      </HideOnScroll>

      {/* 3. ВЫДВИГАЮЩАЯСЯ БОКОВАЯ ПАНЕЛЬ (DRAWER) */}
      <Drawer
        anchor="left" // Откуда выдвигается (left, right, top, bottom)
        open={isDrawerOpen} // Связано с состоянием
        onClose={() => setIsDrawerOpen(false)} // Закрывается при клике на оверлей позади панели
      >
        {/* Контейнер списка внутри Drawer с фиксированной шириной */}
        <Box 
          sx={{ width: 250 }} 
          role="presentation" 
          onClick={() => setIsDrawerOpen(false)} // Закрывать меню при клике на любой пункт
        >
          {/* Блок профиля пользователя сверху меню */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f5f5f5' }}>
            <AccountCircleIcon color="action" fontSize="large" />
            <Typography variant="body1" fontWeight="bold">{username}</Typography>
          </Box>
          <Divider />
          
          {/* Сводный список навигации */}
          <List>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="Главная страница" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="Личный кабинет" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="Настройки" />
              </ListItemButton>
            </ListItem>
          </List>
          
          <Divider />
          
          {/* Кнопка Выхода */}
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => {
                localStorage.clear();
                window.location.href = '/login'; // Простая очистка сессии и редирект
              }}>
                <ListItemText primary="Выйти из системы" sx={{ color: 'error.main' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* ОСНОВНОЙ КОНТЕНТ СТРАНИЦЫ */}
      <Box component="main" sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Добро пожаловать, {username}!</Typography>
        <Typography variant="body1">Здесь будет располагаться основной контент вашего домашнего экрана.</Typography>
      </Box>
    </Box>
  );
}
