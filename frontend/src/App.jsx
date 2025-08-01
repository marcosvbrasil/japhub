import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBars, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

// Importações das páginas e componentes
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import ProtectedRoute from './components/ProtectedRoute';
import TablesPage from './pages/TablesPage';
import FormBuilderPage from './pages/FormBuilderPage';
import SubmissionPage from './pages/SubmissionPage';
import LoginPage from './pages/LoginPage';
import UsuariosPage from './pages/UsuariosPage';
import UserPortalPage from './pages/UserPortalPage';
import MinhasSubmissoesPage from './pages/MinhasSubmissoesPage';
import AnalisePage from './pages/AnalisePage';

// Componente de Layout Mestre
const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="page-wrapper">
        <header className="main-header">
          <div className="header-logo">
            <FontAwesomeIcon icon={faLayerGroup} className="logo-icon" />
            <h2>JAPHub</h2>
          </div>
          <div className="header-actions">
            <FontAwesomeIcon icon={faSearch} />
            <FontAwesomeIcon icon={faBars} />
          </div>
        </header>
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

// Componente para redirecionar o utilizador com base no seu papel (role)
const HomeDispatcher = () => {
    const token = localStorage.getItem('japhub-token');
    if (!token) return <Navigate to="/login" replace />;

    try {
        const user = jwtDecode(token);
        return user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/portal" replace />;
    } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        localStorage.removeItem('japhub-token');
        return <Navigate to="/login" replace />;
    }
};


function App() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const token = localStorage.getItem('japhub-token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get('http://localhost:8000/api/formularios', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForms(response.data);
      } catch (error) {
        console.error("Erro ao buscar formulários:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('japhub-token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchForms();
  }, [navigate]);

  if (loading && localStorage.getItem('japhub-token')) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f9' }}>
        <h2>A carregar aplicação...</h2>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><HomeDispatcher /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute><MainLayout><MainContent forms={forms} /></MainLayout></ProtectedRoute>} />
      
      <Route 
        path="/portal" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <UserPortalPage forms={forms} loading={loading} />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route path="/admin/usuarios" element={<ProtectedRoute><MainLayout><UsuariosPage /></MainLayout></ProtectedRoute>} />
      <Route path="/tabelas/:formId" element={<ProtectedRoute><MainLayout><TablesPage forms={forms} /></MainLayout></ProtectedRoute>} />
      <Route path="/construtor" element={<ProtectedRoute><MainLayout><FormBuilderPage /></MainLayout></ProtectedRoute>} />
      <Route path="/construtor/editar/:formId" element={<ProtectedRoute><MainLayout><FormBuilderPage /></MainLayout></ProtectedRoute>} />
      <Route path="/form/:formId" element={<ProtectedRoute><MainLayout><SubmissionPage forms={forms} /></MainLayout></ProtectedRoute>} />
      <Route path="/portal/minhas-submissoes" element={<ProtectedRoute><MainLayout><MinhasSubmissoesPage /></MainLayout></ProtectedRoute>} />
      <Route path="/admin/analise/:formId" element={<ProtectedRoute><MainLayout><AnalisePage /></MainLayout></ProtectedRoute>} />
    </Routes>
  );
}

export default App;