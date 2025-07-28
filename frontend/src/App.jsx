// frontend/src/App.jsx

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import TablesPage from './pages/TablesPage';
import FormBuilderPage from './pages/FormBuilderPage';
import SubmissionPage from './pages/SubmissionPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import UsuariosPage from './pages/UsuariosPage';


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

function App() {
  const [forms, setForms] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchForms();
  }, [navigate]);

  const addForm = async (newFormPayload) => {
    try {
      const token = localStorage.getItem('japhub-token');
      const response = await axios.post('http://localhost:8000/api/formularios', newFormPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Após criar, chama fetchForms() para buscar a lista mais recente do BD e garantir consistência
      fetchForms();
      alert('Formulário criado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error("Erro ao criar formulário:", error);
      alert("Não foi possível criar o formulário.");
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={<ProtectedRoute><MainLayout><MainContent forms={forms} /></MainLayout></ProtectedRoute>} />
      
      <Route path="/tabelas/:formId" element={<ProtectedRoute><MainLayout><TablesPage forms={forms} /></MainLayout></ProtectedRoute>} />
      
      <Route path="/construtor" element={<ProtectedRoute><MainLayout><FormBuilderPage onSaveForm={addForm} /></MainLayout></ProtectedRoute>} />
      
      {/* A CORREÇÃO CRÍTICA ESTÁ AQUI. GARANTIMOS QUE 'forms' É PASSADO PARA A SUBMISSIONPAGE */}
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
      
    </Routes>
  );
}

export default App;