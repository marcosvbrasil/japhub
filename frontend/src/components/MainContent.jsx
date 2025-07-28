import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBars, faLayerGroup, faTableList, faPenToSquare } from '@fortawesome/free-solid-svg-icons';

function MainContent({ forms }) {
  // Estados para controlar a busca e a ordenação
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('created_at_desc'); // Padrão: mais recentes primeiro

  // Lógica de busca e ordenação
  // useMemo otimiza a performance, recalculando a lista apenas quando necessário
  const displayedForms = useMemo(() => {
    let filtered = [...forms];

    // Lógica de Busca: filtra os formulários cujo nome inclui o termo da busca
    if (searchTerm) {
      filtered = filtered.filter(form => 
        form.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lógica de Ordenação: reordena a lista com base na opção selecionada
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name_asc': // Ordena por nome de A a Z
          return a.name.localeCompare(b.name);
        case 'name_desc': // Ordena por nome de Z a A
          return b.name.localeCompare(a.name);
        case 'created_at_asc': // Ordena por data de criação (mais antigos primeiro)
          return new Date(a.created_at) - new Date(b.created_at);
        case 'created_at_desc': // Ordena por data de criação (mais recentes primeiro)
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  }, [forms, searchTerm, sortOption]); // Dependências: a lógica roda de novo se um destes mudar


  return (
    <main className="main-content">
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
      <div className="content-body">
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
          
          {/* O map agora usa a nossa lista processada 'displayedForms' */}
          {displayedForms.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                {searchTerm ? "Nenhum formulário encontrado para a sua busca." : "Nenhum formulário encontrado."}
            </p>
          ) : (
            displayedForms.map((form) => (
              <div key={form.id} className="form-card">
                <div className="form-card-info">
                  <span>{form.name}</span>
                  <small>{form.submissions || 0} respostas</small>
                </div>
                <div className="form-card-actions">
                  <Link to={`/form/${form.id}`} className="action-button">
                    <FontAwesomeIcon icon={faPenToSquare} />
                    <span>Preencher</span>
                  </Link>
                  <Link to={`/tabelas/${form.id}`} className="action-button">
                    <FontAwesomeIcon icon={faTableList} />
                    <span>Respostas</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
        
      </div>
    </main>
  );
}

export default MainContent;