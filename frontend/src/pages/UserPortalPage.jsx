// frontend/src/pages/UserPortalPage.jsx

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWpforms } from '@fortawesome/free-brands-svg-icons'; // Usando um ícone genérico de formulário

function UserPortalPage({ forms }) {

  const groupedForms = useMemo(() => {
    if (!forms) return {};
    return forms.reduce((acc, form) => {
      const category = form.categoria || 'Geral';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(form);
      return acc;
    }, {});
  }, [forms]);

  const categories = Object.keys(groupedForms).sort();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Portal de Formulários</h1>
          <p>Selecione um formulário abaixo para iniciar um novo processo.</p>
        </div>
      </div>
      
      {/* O container da nossa lista agora será o menu */}
      <div className="user-portal-menu-list">
        {!forms || forms.length === 0 ? (
          <div className="canvas-empty-state">
            <h3>Nenhum formulário disponível</h3>
            <p>Contacte um administrador para mais informações.</p>
          </div>
        ) : (
          categories.map(category => (
            <section key={category} className="category-group">
              <h2 className="category-title">{category}</h2>
              {/* O nosso novo menu em grelha */}
              <div className="menu-grid">
                {groupedForms[category].map(form => (
                  <Link to={`/form/${form.id}`} key={form.id} className="menu-card-link">
                    <div className="menu-card">
                      <FontAwesomeIcon icon={faWpforms} className="menu-card-icon" />
                      <span className="menu-card-title">{form.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

export default UserPortalPage;