// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { proteger, checkAdmin } = require('./middleware/authMiddleware');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();
const app = express();
const PORT = 8000;

app.use(cors()); 
app.use(express.json());

// Inicializa o cliente do Supabase com as suas chaves do .env
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

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
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 8) // Expira em 8 horas
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
    // Esta nova consulta SQL junta as tabelas e conta as respostas
    const result = await client.query(`
      SELECT 
        f.*, 
        CAST(COUNT(r.id) AS INTEGER) AS submissions 
      FROM 
        formularios f
      LEFT JOIN 
        respostas r ON f.id = r.form_id
      GROUP BY 
        f.id
      ORDER BY 
        f.created_at DESC
    `);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar formulários:", err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

app.post('/api/formularios', proteger, async (req, res) => {
  try {
    const { name, fields, categoria } = req.body;
    const owner_id = req.user.id; 
    if (!name || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ erro: 'O nome e os campos são obrigatórios.' });
    }
    const client = await pool.connect();
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

app.get('/api/formularios/:formId', proteger, async (req, res) => {
    try {
        const { formId } = req.params;
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM formularios WHERE id = $1', [formId]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Formulário não encontrado.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao buscar formulário específico:", err);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});

app.put('/api/formularios/:formId', proteger, async (req, res) => {
    try {
        const { formId } = req.params;
        const { name, fields, categoria } = req.body;

        if (!name || !fields) {
            return res.status(400).json({ erro: 'O nome e os campos são obrigatórios.' });
        }

        const client = await pool.connect();
        const result = await client.query(
            'UPDATE formularios SET name = $1, fields = $2, categoria = $3 WHERE id = $4 RETURNING *',
            [name, JSON.stringify(fields), categoria || 'Sem Categoria', formId]
        );
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Formulário não encontrado para atualizar.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao atualizar formulário:", err);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});

// --- ROTA PARA ANÁLISE DE RESPOSTAS (VERSÃO CORRIGIDA) ---
app.get('/api/formularios/:formId/analise', proteger, async (req, res) => {
    try {
        const { formId } = req.params;
        const client = await pool.connect();

        const formResult = await client.query('SELECT fields FROM formularios WHERE id = $1', [formId]);
        if (formResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ erro: 'Formulário não encontrado.' });
        }
        
        const fields = formResult.rows[0].fields;

        const respostasResult = await client.query('SELECT data FROM respostas WHERE form_id = $1', [formId]);
        const respostas = respostasResult.rows.map(r => r.data);
        
        const totalSubmissions = respostas.length;
        
        if (!Array.isArray(fields)) {
            client.release();
            return res.json({ totalSubmissions, analysis: [] });
        }

        const analysis = fields
            .filter(field => field.type === 'radio' && Array.isArray(field.options))
            .map(field => {
                const counts = {};
                field.options.forEach(option => {
                    counts[option.label] = 0;
                });

                respostas.forEach(resposta => {
                    const answer = resposta[field.label];
                    if (answer in counts) {
                        counts[answer]++;
                    }
                });
                
                const chartData = Object.keys(counts).map(name => ({
                    name: name,
                    value: counts[name],
                }));

                return {
                    fieldLabel: field.label,
                    type: field.type,
                    data: chartData,
                };
            });

        client.release();
        res.json({ totalSubmissions, analysis });

    } catch (err) {
        console.error("Erro ao gerar análise:", err);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});


// --- ROTAS DE RESPOSTAS ---
app.post('/api/formularios/:formId/respostas', proteger, async (req, res) => {
  try {
    const { formId } = req.params;
    const { data } = req.body;
    const submitter_id = req.user.id; 

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ erro: 'Os dados da resposta são obrigatórios e devem ser um objeto.' });
    }
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO respostas (form_id, data, submitter_id) VALUES ($1, $2, $3) RETURNING *',
      [formId, data, submitter_id]
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

app.get('/api/respostas/me', proteger, async (req, res) => {
    try {
        const submitter_id = req.user.id;
        const client = await pool.connect();
        const result = await client.query(`
            SELECT 
                r.id, 
                r.data, 
                r.created_at, 
                f.name as form_name 
            FROM 
                respostas r
            JOIN 
                formularios f ON r.form_id = f.id
            WHERE 
                r.submitter_id = $1
            ORDER BY 
                r.created_at DESC
        `, [submitter_id]);
        
        client.release();
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao buscar histórico de respostas:", err);
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

// --- ROTA DE UPLOAD ---
app.post('/api/uploads/assinar-url', proteger, async (req, res) => {
    const { fileName, fileType } = req.body;
    const userId = req.user.id;

    if (!fileName || !fileType) {
        return res.status(400).json({ erro: 'O nome e o tipo do ficheiro são obrigatórios.' });
    }

    const path = `${userId}/${Date.now()}_${fileName}`;

    try {
        const { data, error } = await supabase
            .storage
            .from('upload-formularios')
            .createSignedUploadUrl(path);

        if (error) {
            console.error("Erro ao criar URL assinado no Supabase:", error);
            throw error;
        }

        res.status(200).json({ signedUrl: data.signedUrl, path: data.path });

    } catch (err) {
        console.error("Erro na rota /api/uploads/assinar-url:", err);
        res.status(500).json({ erro: 'Não foi possível obter o URL de upload.' });
    }
});


// --- ROTA PRINCIPAL ---
app.get('/', (req, res) => {
  res.send('API do JAPHub está a funcionar!');
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor a rodar na porta ${PORT}`);
});