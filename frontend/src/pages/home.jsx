import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Masonry } from '@mui/lab';
import { CardBlog } from '../components/CardBlog';
import Layout from '../components/Layout';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const response = await fetch('http://localhost:5170/api/Article');
      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const sortedArticles = data.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.CreatedAt || 0);
            const dateB = new Date(b.createdAt || b.CreatedAt || 0);
            return dateB - dateA;
          });
          setArticles(sortedArticles);
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки ленты статей:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <Layout>
      {/* ОСНОВНОЙ КОНТЕНТ СЕТКИ СТАТЕЙ */}
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 4, 
          alignItems: 'stretch',
          backgroundColor: '#f9f9f9', 
          minHeight: 'calc(100vh - 64px)',
          width: '100%',             
          boxSizing: 'border-box'
        }}
      >

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : articles.length === 0 ? (
          <Typography color="text.secondary">Статей пока нет.</Typography>
        ) : (
          <Masonry 
            columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }} 
            spacing={6}                              
            sx={{ 
              width: '100%', 
              maxWidth: '100%',                    
              margin: 0,                           
              padding: 0
            }}
          >
            {articles.map((article) => (
              <Box 
                key={article.id || article.Id} 
                sx={{ width: '100%' }}               
              >
                <CardBlog 
                  article={article} 
                  onClick={() => navigate(`/article/${article.id || article.Id}`)} 
                />
              </Box>
            ))}
          </Masonry>
        )}
      </Box>
    </Layout>
  );
}