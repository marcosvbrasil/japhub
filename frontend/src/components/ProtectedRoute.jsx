// src/components/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom';

// Este componente recebe um 'children', que é a página que ele deve proteger
function ProtectedRoute({ children }) {
  // 1. Procura pelo nosso "crachá digital" (token) no localStorage
  const token = localStorage.getItem('japhub-token');

  // 2. Se NÃO houver token...
  if (!token) {
    // ...redireciona o utilizador para a página de login.
    // O 'replace' impede o utilizador de usar o botão "voltar" do navegador para aceder à página protegida.
    return <Navigate to="/login" replace />;
  }

  // 3. Se houver um token, simplesmente renderiza a página que ele está a proteger
  return children;
}

export default ProtectedRoute;