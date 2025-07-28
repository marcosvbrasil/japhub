// src/pages/LoginPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/login', formData);

      // Pega o token da resposta da API
      const { token } = response.data;

      // --- A LINHA NOVA E IMPORTANTE ESTÁ AQUI ---
      // Guarda o token no localStorage do navegador para uso futuro
      localStorage.setItem('japhub-token', token);

      alert('Login bem-sucedido!');
      navigate('/');

    } catch (error) {
      console.error('Erro no login:', error);
      if (error.response) {
        alert(error.response.data.erro || 'Erro vindo do servidor.');
      } else if (error.request) {
        alert('Não foi possível conectar ao servidor. Por favor, verifica se o backend está a rodar.');
      } else {
        alert('Ocorreu um erro inesperado. Tente novamente.');
      }
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo_japura.png" alt="Logo Japurá" style={{ width: 150, marginBottom: 20 }} />
          <h2>JAPHub</h2>
          <p>Por favor, inicie a sessão para continuar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input 
              type="password" 
              id="senha" 
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;