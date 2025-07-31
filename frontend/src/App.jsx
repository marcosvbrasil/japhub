import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Importações dos nossos componentes e páginas
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import ProtectedRoute from './components/ProtectedRoute';
import TablesPage from './pages/TablesPage';
import FormBuilderPage from './pages/FormBuilderPage';
import SubmissionPage from './pages/SubmissionPage';
import LoginPage from './pages/LoginPage';
import UsuariosPage from './pages/UsuariosPage';
import UserPortalPage from './pages/UserPortalPage';

// Componente de Layout Principal (com a barra lateral para áreas internas)
const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content-area">
        {children}
      </main>
    </div>
  );
};

// Componente "Despachante": decide para onde o utilizador vai após o login
const HomeDispatcher = () => {
    const token = localStorage.getItem('japhub-token');
    if (!token) return <Navigate to="/login" replace />;

    try {
        const user = jwtDecode(token);
        // Se o utilizador for 'admin', é redirecionado para o dashboard de administração.
        // Qualquer outro 'role' é redirecionado para o portal do utilizador.
        return user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/portal" replace />;
    } catch (error) {
        // Se o token for inválido ou malformado, limpa-o e manda para o login
        console.error("Erro ao decodificar o token:", error);
        localStorage.removeItem('japhub-token');
        return <Navigate to="/login" replace />;
    }
};


function App() {
  const [forms, setForms] = useState([]);
  const navigate = useNavigate();

  // Função para buscar os formulários da API
  const fetchForms = async () => {
    try {
      const token = localStorage.getItem('japhub-token');
      if (!token) return;
      
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
    }
  };

  // useEffect para buscar os formulários sempre que o utilizador navegar, garantindo dados frescos
  useEffect(() => {
    const token = localStorage.getItem('japhub-token');
    if (token) {
        fetchForms();
    }
  }, [navigate]);

  // Função para adicionar um novo formulário (chamada pelo FormBuilder)
  const addForm = async (newFormPayload) => {
    try {
      const token = localStorage.getItem('japhub-token');
      await axios.post('http://localhost:8000/api/formularios', newFormPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Após criar, busca a lista fresca do servidor em vez de atualizar localmente
      fetchForms();
      alert('Formulário criado com sucesso!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error("Erro ao criar formulário:", error);
      alert("Não foi possível criar o formulário.");
    }
  };

  return (
    <Routes>
      {/* Rota pública de Login */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rota principal agora é o nosso "despachante" que decide o destino */}
      <Route path="/" element={<ProtectedRoute><HomeDispatcher /></ProtectedRoute>} />

      {/* Rota do Portal do Utilizador (para não-admins) */}
      <Route 
        path="/portal" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <UserPortalPage forms={forms} />
            </MainLayout>
          </ProtectedRoute>
        } 
      />

      {/* Agrupamos todas as rotas de administração */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <MainContent forms={forms} />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/usuarios" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <UsuariosPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas partilhadas (acessíveis por todos os utilizadores logados) */}
      <Route 
        path="/tabelas/:formId" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <TablesPage forms={forms} />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/construtor" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <FormBuilderPage onSaveForm={addForm} />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/form/:formId" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <SubmissionPage forms={forms} />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;