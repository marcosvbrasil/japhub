import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Importa todos os ícones necessários, incluindo o de "Mais" (ellipsis)
import { faTableList, faPenToSquare, faEdit, faPlus, faChartPie, faShareSquare, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { faWpforms } from '@fortawesome/free-brands-svg-icons';
import ShareModal from './ShareModal'; // Assumindo que ShareModal.jsx está na mesma pasta de componentes


function MainContent({ forms }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('created_at_desc');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  
  // Estado para controlar qual menu dropdown está aberto
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const handleShareClick = (formId) => {
    const link = `${window.location.origin}/form/${formId}`;
    setShareableLink(link);
    setShowShareModal(true);
    setOpenDropdownId(null); // Fecha o dropdown ao abrir o modal
  };

  // Função para abrir/fechar o dropdown de um card específico
  const handleMoreClick = (formId) => {
    setOpenDropdownId(openDropdownId === formId ? null : formId);
  };
  
  const displayedForms = useMemo(() => {
    let filtered = [...forms];
    if (searchTerm) {
      filtered = filtered.filter(form => 
        form.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'created_at_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'created_at_desc':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
    return filtered;
  }, [forms, searchTerm, sortOption]);

  return (
    <>
      <div className="form-list-section">
        <Link to="/construtor">
          <button className="btn-create-new">Criar novo formulário</button>
        </Link>
        
        <div className="workspace-controls">
          <input 
            type="text"
            placeholder="Buscar formulários..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="filter-select" 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="created_at_desc">Mais Recentes</option>
            <option value="created_at_asc">Mais Antigos</option>
            <option value="name_asc">Nome (A-Z)</option>
            <option value="name_desc">Nome (Z-A)</option>
          </select>
        </div>
        
        {displayedForms.length === 0 ? (
          <div className="canvas-empty-state" style={{ padding: '40px' }}>
              <FontAwesomeIcon icon={faWpforms} style={{ fontSize: '48px', color: '#ccc', marginBottom: '24px' }} />
              <h3>Ainda não há formulários</h3>
              <p style={{ maxWidth: '400px', margin: '0 auto 24px' }}>
                  Parece que a sua área de trabalho está vazia. Comece a sua primeira criação agora mesmo!
              </p>
              <Link to="/construtor" className="publish-btn" style={{ textDecoration: 'none' }}>
                  <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }}/>
                  Criar Primeiro Formulário
              </Link>
          </div>
        ) : (
          displayedForms.map((form) => (
            <div key={form.id} className="form-card">
              <div className="form-card-info">
                <span>{form.name}</span>
                <small>{form.submissions || 0} respostas</small>
              </div>
              
              <div className="form-card-actions">
                {/* O botão "Editar" fica sempre visível como ação principal */}
                <Link to={`/construtor/editar/${form.id}`} className="action-button">
                    <FontAwesomeIcon icon={faEdit} />
                    <span>Editar</span>
                </Link>

                {/* Container para o menu "Mais" */}
                <div className="actions-dropdown-container">
                  <button onClick={() => handleMoreClick(form.id)} className="action-button more-button">
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>

                  {/* O menu dropdown (só é renderizado se o ID corresponder) */}
                  {openDropdownId === form.id && (
                    <div className="dropdown-menu">
                      <button onClick={() => handleShareClick(form.id)} className="dropdown-item">
                          <FontAwesomeIcon icon={faShareSquare} />
                          <span>Partilhar</span>
                      </button>
                      <Link to={`/form/${form.id}`} className="dropdown-item">
                        <FontAwesomeIcon icon={faPenToSquare} />
                        <span>Preencher</span>
                      </Link>
                      <Link to={`/tabelas/${form.id}`} className="dropdown-item">
                        <FontAwesomeIcon icon={faTableList} />
                        <span>Respostas</span>
                      </Link>
                      <Link to={`/admin/analise/${form.id}`} className="dropdown-item">
                        <FontAwesomeIcon icon={faChartPie} />
                        <span>Análise</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* O Modal de Partilha (só é renderizado quando showShareModal for true) */}
      {showShareModal && (
        <ShareModal link={shareableLink} onClose={() => setShowShareModal(false)} />
      )}
    </>
  );
}

export default MainContent;