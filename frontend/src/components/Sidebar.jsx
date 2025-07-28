// frontend/src/components/Sidebar.jsx

import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faTableList, faRightFromBracket, faLayerGroup, faUsersCog } from '@fortawesome/free-solid-svg-icons'; // 1. Importa um ícone para Admin
import { jwtDecode } from 'jwt-decode'; // 2. Importa a nossa nova ferramenta

function Sidebar() {
    const navigate = useNavigate();

    // 3. Lógica para verificar o papel (role) do utilizador
    let userRole = null;
    const token = localStorage.getItem('japhub-token');
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            userRole = decodedToken.role;
        } catch (error) {
            console.error("Token inválido:", error);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('japhub-token');
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <FontAwesomeIcon icon={faLayerGroup} className="logo-icon" />
                <h1>JAPHub</h1>
            </div>
            <nav className="sidebar-nav">
                <Link to="/" className="nav-item">
                    <FontAwesomeIcon icon={faFileAlt} />
                    <span>Formulários</span>
                </Link>
                {/* Link de Tabelas removido para evitar confusão, já que o acesso é pelo card */}

                {/* 4. Renderização Condicional do link de Admin */}
                {userRole === 'admin' && (
                    <Link to="/admin/usuarios" className="nav-item">
                        <FontAwesomeIcon icon={faUsersCog} />
                        <span>Admin</span>
                    </Link>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="nav-item" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    <span>Sair</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;