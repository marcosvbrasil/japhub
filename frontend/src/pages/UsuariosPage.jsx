import { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar os utilizadores (reutilizável)
  const fetchUsuarios = async () => {
    const token = localStorage.getItem('japhub-token');
    if (!token) {
      setError("Não foi possível validar a sua sessão.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/admin/usuarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(response.data);
    } catch (err) {
        // ... (código de tratamento de erro)
    } finally {
      setLoading(false);
    }
  };

  // useEffect para buscar os dados quando a página carrega
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // --- NOSSAS NOVAS FUNÇÕES DE GESTÃO ---

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
    // Janela de confirmação para evitar acidentes
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

  // ... (código de loading e error)

  return (
    <div className="table-page-container">
      <h1>Painel de Administração - Utilizadores</h1>
      <p>Total de utilizadores registados: {usuarios.length}</p>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Papel (Role)</th>
            <th>Data de Criação</th>
            <th>Ações</th> {/* Nova coluna */}
          </tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.email}</td>
              <td>
                {/* Menu dropdown para mudar o role */}
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
                {/* Botão para apagar o utilizador */}
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