import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';
import Registration from './pages/registration';
import CreateArticle from './pages/createArticle';
import ReadArticle from './pages/readArticle';
import VirtualMachinesList from './pages/VirtualMachinesList';
import CreateVirtualMachine from './pages/CreateVirtualMachine'; 

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration/>}/>
        <Route path="/article/create" element={<CreateArticle />} />
        <Route path="/article/edit/:id" element={<CreateArticle />} />
        <Route path="/article/:id" element={<ReadArticle />} />

        {/* Защищенные маршруты */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vms" 
          element={
            <ProtectedRoute>
              <VirtualMachinesList />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/vms/create" 
          element={
            <ProtectedRoute>
              <CreateVirtualMachine />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/vms/edit/:id" 
          element={
            <ProtectedRoute>
              <CreateVirtualMachine />
            </ProtectedRoute>
          } 
        />

        {/* Если пользователь ввел любой другой адрес — перенаправляем его */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
