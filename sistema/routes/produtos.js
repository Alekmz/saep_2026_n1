const express = require('express');
const router = express.Router();
const pool = require('../db');

function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) return next();
  res.status(401).json({ error: 'Não autenticado.' });
}

router.get('/', requireAuth, async (req, res) => {
  const { busca } = req.query;
  try {
    let query = 'SELECT * FROM produto';
    let params = [];
    if (busca && busca.trim()) {
      query += ' WHERE nome LIKE ? OR categoria LIKE ? OR fabricante LIKE ? OR principio_ativo LIKE ?';
      const termo = `%${busca.trim()}%`;
      params = [termo, termo, termo, termo];
    }
    query += ' ORDER BY nome ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    res.status(500).json({ error: 'Erro ao listar produtos.' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (isNaN(id) || Number(id) <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM produto WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    res.status(500).json({ error: 'Erro ao buscar produto.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { nome, categoria, fabricante, principio_ativo, preco, estoque_atual, estoque_minimo } = req.body;

  if (!nome || !nome.trim()) return res.status(400).json({ error: 'Nome do medicamento é obrigatório.' });
  if (!categoria || !categoria.trim()) return res.status(400).json({ error: 'Categoria é obrigatória.' });
  if (!fabricante || !fabricante.trim()) return res.status(400).json({ error: 'Fabricante é obrigatório.' });
  if (!principio_ativo || !principio_ativo.trim()) return res.status(400).json({ error: 'Princípio ativo é obrigatório.' });
  if (preco === undefined || preco === '' || isNaN(Number(preco)) || Number(preco) < 0) {
    return res.status(400).json({ error: 'Preço deve ser um número válido e não negativo.' });
  }
  if (estoque_atual === undefined || estoque_atual === '' || isNaN(Number(estoque_atual)) || !Number.isInteger(Number(estoque_atual)) || Number(estoque_atual) < 0) {
    return res.status(400).json({ error: 'Estoque atual deve ser um número inteiro não negativo.' });
  }
  if (estoque_minimo === undefined || estoque_minimo === '' || isNaN(Number(estoque_minimo)) || !Number.isInteger(Number(estoque_minimo)) || Number(estoque_minimo) < 0) {
    return res.status(400).json({ error: 'Estoque mínimo deve ser um número inteiro não negativo.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO produto (nome, categoria, fabricante, principio_ativo, preco, estoque_atual, estoque_minimo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nome.trim(), categoria.trim(), fabricante.trim(), principio_ativo.trim(), Number(preco), Number(estoque_atual), Number(estoque_minimo)]
    );
    res.status(201).json({ message: 'Medicamento cadastrado com sucesso.', id: result.insertId });
  } catch (err) {
    console.error('Erro ao cadastrar produto:', err);
    res.status(500).json({ error: 'Erro ao cadastrar medicamento.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (isNaN(id) || Number(id) <= 0) return res.status(400).json({ error: 'ID inválido.' });

  const { nome, categoria, fabricante, principio_ativo, preco, estoque_atual, estoque_minimo } = req.body;

  if (!nome || !nome.trim()) return res.status(400).json({ error: 'Nome do medicamento é obrigatório.' });
  if (!categoria || !categoria.trim()) return res.status(400).json({ error: 'Categoria é obrigatória.' });
  if (!fabricante || !fabricante.trim()) return res.status(400).json({ error: 'Fabricante é obrigatório.' });
  if (!principio_ativo || !principio_ativo.trim()) return res.status(400).json({ error: 'Princípio ativo é obrigatório.' });
  if (preco === undefined || preco === '' || isNaN(Number(preco)) || Number(preco) < 0) {
    return res.status(400).json({ error: 'Preço deve ser um número válido e não negativo.' });
  }
  if (estoque_atual === undefined || estoque_atual === '' || isNaN(Number(estoque_atual)) || !Number.isInteger(Number(estoque_atual)) || Number(estoque_atual) < 0) {
    return res.status(400).json({ error: 'Estoque atual deve ser um número inteiro não negativo.' });
  }
  if (estoque_minimo === undefined || estoque_minimo === '' || isNaN(Number(estoque_minimo)) || !Number.isInteger(Number(estoque_minimo)) || Number(estoque_minimo) < 0) {
    return res.status(400).json({ error: 'Estoque mínimo deve ser um número inteiro não negativo.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE produto SET nome=?, categoria=?, fabricante=?, principio_ativo=?, preco=?, estoque_atual=?, estoque_minimo=? WHERE id=?',
      [nome.trim(), categoria.trim(), fabricante.trim(), principio_ativo.trim(), Number(preco), Number(estoque_atual), Number(estoque_minimo), id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Medicamento não encontrado.' });
    res.json({ message: 'Medicamento atualizado com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).json({ error: 'Erro ao atualizar medicamento.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (isNaN(id) || Number(id) <= 0) return res.status(400).json({ error: 'ID inválido.' });
  try {
    const [result] = await pool.query('DELETE FROM produto WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Medicamento não encontrado.' });
    res.json({ message: 'Medicamento removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover produto:', err);
    res.status(500).json({ error: 'Erro ao remover medicamento.' });
  }
});

module.exports = router;
