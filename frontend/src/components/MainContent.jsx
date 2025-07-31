import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableList, faPenToSquare } from '@fortawesome/free-solid-svg-icons';

function MainContent({ forms }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('created_at_desc');

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
  );
}

export default MainContent;