import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWpforms } from '@fortawesome/free-brands-svg-icons';
import { faHistory } from '@fortawesome/free-solid-svg-icons';

// Adicionamos a prop 'loading' aqui
function UserPortalPage({ forms, loading }) {

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

  // Se estiver a carregar, mostra uma mensagem simples
  if (loading) {
    return (
      <div className="page-header">
        <h1>A carregar formulários...</h1>
      </div>
    );
  }

  return (
    // 1. Substituímos a <div className="page-container"> por um Fragmento <>
    <>
      <div className="page-header">
        <div>
          <h1>Portal de Formulários</h1>
          <p>Selecione um formulário abaixo para iniciar um novo processo.</p>
        </div>
      </div>

       <section className="category-group">
        <h2 className="category-title">Ações Rápidas</h2>
        <div className="menu-grid">
            <Link to={`/portal/minhas-submissoes`} className="menu-card-link">
                <div className="menu-card">
                  <FontAwesomeIcon icon={faHistory} className="menu-card-icon" />
                  <span className="menu-card-title">Ver Meu Histórico</span>
                </div>
            </Link>
            {/* Poderíamos adicionar mais ações aqui no futuro */}
        </div>
    </section>
      
      <div className="user-portal-menu-list">
        {forms.length === 0 ? (
          <div className="canvas-empty-state">
            <h3>Nenhum formulário disponível</h3>
            <p>De momento, não existem formulários publicados. Contacte um administrador para mais informações.</p>
          </div>
        ) : (
          categories.map(category => (
            <section key={category} className="category-group">
              <h2 className="category-title">{category}</h2>
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
    </>
  );
}

export default UserPortalPage;