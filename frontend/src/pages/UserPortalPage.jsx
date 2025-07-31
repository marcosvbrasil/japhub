// frontend/src/pages/UserPortalPage.jsx

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

function UserPortalPage({ forms }) {

  // A lógica de agrupamento acontece aqui, dentro de um useMemo para otimização.
  const groupedForms = useMemo(() => {
    if (!forms) return {};

    // Usamos o método 'reduce' para transformar a nossa lista num objeto de categorias
    return forms.reduce((acc, form) => {
      const category = form.categoria || 'Outros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(form);
      return acc;
    }, {});
  }, [forms]);

  // Pega nos nomes das categorias para podermos iterar sobre eles
  const categories = Object.keys(groupedForms).sort();

  return (
    <div className="table-page-container">
      <h1>Portal do Utilizador</h1>
      <p>Selecione um formulário abaixo para começar a preencher.</p>
      
      <div className="user-portal-form-list">
        {!forms || forms.length === 0 ? (
          <p>Nenhum formulário disponível no momento.</p>
        ) : (
          // Agora, mapeamos as nossas 'categorias'
          categories.map(category => (
            <section key={category} className="category-group">
              <h2 className="category-title">{category}</h2>
              {/* Para cada categoria, mapeamos os formulários que pertencem a ela */}
              {groupedForms[category].map(form => (
                <div key={form.id} className="user-form-card">
                  <span className="user-form-title">{form.name}</span>
                  <Link to={`/form/${form.id}`} className="action-button">
                    <FontAwesomeIcon icon={faPenToSquare} />
                    <span>Preencher</span>
                  </Link>
                </div>
              ))}
            </section>
          ))
        )}
      </div>
    </div>
  );
}

export default UserPortalPage;