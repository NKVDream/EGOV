import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/home.css';

export default function Home(){
  const navigate = useNavigate();
  const [article, setArticle] = useEffect();
  const [selectedArticle, setSelectedArticle] =useState(null);
  const [loading, setLoading] = useState();

  const userRole = localStorage.getItem('role');

  useEffect(() =>{
    fetch('http://localhost:5170/api/Article')
    .then((res) => res.json())
  })
}
