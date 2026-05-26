const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/login', async (req, res) => {
  const { login, senha } = req.body;

  if (!login || !senha) {
    return res.status(400).json({ error: 'Login e senha são obrigatórios.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuario WHERE login = ? AND senha = ?',
      [login.trim(), senha]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Login ou senha inválidos. Verifique suas credenciais.' });
    }

    const usuario = rows[0];
    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      login: usuario.login
    };

    res.json({ message: 'Login realizado com sucesso.', usuario: req.session.usuario });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao encerrar sessão.' });
    }
    res.json({ message: 'Logout realizado com sucesso.' });
  });
});

router.get('/me', (req, res) => {
  if (req.session && req.session.usuario) {
    res.json({ usuario: req.session.usuario });
  } else {
    res.status(401).json({ error: 'Não autenticado.' });
  }
});

module.exports = router;
