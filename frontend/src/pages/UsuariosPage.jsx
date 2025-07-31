import { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar os utilizadores da API
  const fetchUsuarios = async () => {
    const token = localStorage.getItem('japhub-token');
    if (!token) {
      setError("Não foi possível validar a sua sessão.");
      setLoading(false);
      return;
    }
    try {
      // Não precisamos de setLoading(true) aqui, pois já está no estado inicial
      const response = await axios.get('http://localhost:8000/api/admin/usuarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(response.data);
    } catch (err) {
        if (err.response && err.response.status === 403) {
            setError("Acesso negado. Apenas administradores podem ver esta página.");
        } else {
            setError("Ocorreu um erro ao buscar os utilizadores.");
        }
        console.error("Erro ao buscar utilizadores:", err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect para buscar os dados quando a página carrega
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Função para mudar o role de um utilizador
  const handleRoleChange = async (userId, newRole) => {
    const token = localStorage.getItem('japhub-token');
    try {
      await axios.put(`http://localhost:8000/api/admin/usuarios/${userId}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Atualiza a lista de utilizadores na tela após a mudança
      fetchUsuarios(); 
    } catch (error) {
      console.error("Erro ao atualizar o role:", error);
      alert("Não foi possível atualizar o papel do utilizador.");
    }
  };

  // Função para apagar um utilizador
  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Tem a certeza de que quer apagar o utilizador ${userEmail}? Esta ação é irreversível.`)) {
        return;
    }
    const token = localStorage.getItem('japhub-token');
    try {
      await axios.delete(`http://localhost:8000/api/admin/usuarios/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Utilizador ${userEmail} apagado com sucesso.`);
      // Atualiza a lista de utilizadores na tela após apagar
      fetchUsuarios();
    } catch (error) {
      console.error("Erro ao apagar o utilizador:", error);
      alert(error.response?.data?.erro || "Não foi possível apagar o utilizador.");
    }
  };

  if (loading) {
    return <div><h1>A carregar utilizadores...</h1></div>;
  }

  if (error) {
    return <div><h1 style={{ color: 'red' }}>{error}</h1></div>;
  }

  return (
    // O div principal já não precisa de classes de layout, pois elas vêm do .page-content
    <div>
        <div className="page-header">
            <div>
                <h1>Gestão de Utilizadores</h1>
                <p>Adicione, remova e gira as permissões dos utilizadores da plataforma.</p>
            </div>
            <button className="add-user-btn">
                <FontAwesomeIcon icon={faPlus} />
                <span>Convidar Utilizador</span>
            </button>
        </div>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Papel (Role)</th>
            <th>Data de Criação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.email}</td>
              <td>
                <select 
                    value={usuario.role} 
                    onChange={(e) => handleRoleChange(usuario.id, e.target.value)}
                    className="role-select"
                >
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                </select>
              </td>
              <td>{new Date(usuario.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
              <td>
                <button 
                    onClick={() => handleDeleteUser(usuario.id, usuario.email)}
                    className="delete-button"
                    title="Apagar Utilizador"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsuariosPage;