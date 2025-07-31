// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { proteger, checkAdmin } = require('./middleware/authMiddleware');

dotenv.config();
const app = express();
const PORT = 8000;

app.use(cors()); 
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  idleTimeoutMillis: 30000,
});

// --- ROTAS DE AUTENTICAÇÃO ---
app.post('/api/registro', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(senha, salt);
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO utilizadores (email, password_hash) VALUES ($1, $2) RETURNING id, email, role, created_at',
      [email, password_hash]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro na rota de registro:", err);
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Este email já está em uso.' });
    }
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM utilizadores WHERE email = $1', [email]);
    client.release();
    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(senha, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }
    
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expira em 1 hora
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.json({ token: token });
  } catch (err) {
    console.error("Erro na rota de login:", err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// --- ROTAS DE FORMULÁRIOS ---
app.get('/api/formularios', proteger, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM formularios ORDER BY created_at DESC');
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar formulários:", err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

app.post('/api/formularios', proteger, async (req, res) => {
  try {
    // CORREÇÃO: Agora também extraímos a 'categoria' do corpo do pedido
    const { name, fields, categoria } = req.body;
    const owner_id = req.user.id; 
    if (!name || !fields || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ erro: 'O nome e pelo menos um campo são obrigatórios.' });
    }
    const client = await pool.connect();
    // CORREÇÃO: O nosso comando SQL agora inclui a coluna 'categoria'
    const result = await client.query(
      'INSERT INTO formularios (name, fields, owner_id, categoria) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, JSON.stringify(fields), owner_id, categoria || 'Sem Categoria']
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar formulário:", err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// --- ROTAS DE RESPOSTAS ---
app.post('/api/formularios/:formId/respostas', async (req, res) => {
  try {
    const { formId } = req.params;
    const { data } = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ erro: 'Os dados da resposta são obrigatórios e devem ser um objeto.' });
    }
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO respostas (form_id, data) VALUES ($1, $2) RETURNING *',
      [formId, data]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao salvar resposta:", err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

app.get('/api/formularios/:formId/respostas', proteger, async (req, res) => {
  try {
    const { formId } = req.params;
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM respostas WHERE form_id = $1 ORDER BY created_at DESC', [formId]);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar respostas:", err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// --- ROTAS DE ADMIN ---
app.get('/api/admin/usuarios', proteger, checkAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id, email, role, created_at FROM utilizadores ORDER BY created_at DESC');
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar utilizadores:", err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// ... (outras rotas de admin que já fizemos)

// --- ROTA PRINCIPAL ---
app.get('/', (req, res) => {
  res.send('API do JAPHub está a funcionar!');
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor a rodar na porta ${PORT}`);
});