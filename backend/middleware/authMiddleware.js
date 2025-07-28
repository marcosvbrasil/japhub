const jwt = require('jsonwebtoken');

const proteger = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Pega apenas a parte do token (depois de 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // Verifica se o token é válido usando a nossa chave secreta
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // --- O NOSSO ESPIÃO PARA DEPURAÇÃO ---
      console.log("--- DEBUG: CONTEÚDO DO TOKEN NO MIDDLEWARE ---");
      console.log("Token Decodificado:", decoded);
      // O 'exp' está em segundos (timestamp Unix). Vamos converter para uma data legível.
      // Isto vai mostrar-nos a data e hora exatas em que o token expira.
      console.log("Data de Expiração do Token:", new Date(decoded.exp * 1000));
      console.log("Hora Atual do Servidor:", new Date());
      // ------------------------------------

      // Adiciona a informação do utilizador ao objeto 'req'
      req.user = decoded; 

      // Se tudo estiver certo, chama 'next()' para deixar o pedido passar para a rota principal
      next(); 
    } catch (error) {
      // O erro 'TokenExpiredError' está a ser apanhado aqui.
      // Vamos imprimir o erro para ter a certeza.
      console.error("❌ ERRO NO MIDDLEWARE 'proteger':", error.name, error.message);
      
      res.status(401).json({ erro: 'Não autorizado, token falhou.' });
    }
  }

  if (!token) {
    res.status(401).json({ erro: 'Não autorizado, sem token.' });
  }
};

// Este "segurança VIP" verifica se o utilizador é um administrador
const checkAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ erro: 'Acesso negado. Requer privilégios de administrador.' });
  }
};

module.exports = { proteger, checkAdmin };