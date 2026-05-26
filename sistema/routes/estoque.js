const express = require('express');
const router = express.Router();
const pool = require('../db');

function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) return next();
  res.status(401).json({ error: 'Não autenticado.' });
}

// Retorna produtos em ordem alfabética (bubble sort)
router.get('/produtos', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produto');

    const sorted = [...rows];
    for (let i = 0; i < sorted.length - 1; i++) {
      for (let j = 0; j < sorted.length - 1 - i; j++) {
        if (sorted[j].nome.localeCompare(sorted[j + 1].nome, 'pt-BR') > 0) {
          const temp = sorted[j];
          sorted[j] = sorted[j + 1];
          sorted[j + 1] = temp;
        }
      }
    }

    res.json(sorted);
  } catch (err) {
    console.error('Erro ao listar produtos para estoque:', err);
    res.status(500).json({ error: 'Erro ao listar medicamentos.' });
  }
});

router.get('/historico', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.id, e.tipo, e.quantidade, e.data_movimentacao, e.observacao,
             p.nome AS produto_nome,
             u.nome AS usuario_nome
      FROM estoque e
      JOIN produto p ON e.produto_id = p.id
      JOIN usuario u ON e.usuario_id = u.id
      ORDER BY e.data_movimentacao DESC, e.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar histórico:', err);
    res.status(500).json({ error: 'Erro ao buscar histórico.' });
  }
});

router.post('/movimentacao', requireAuth, async (req, res) => {
  const { produto_id, tipo, quantidade, data_movimentacao, observacao } = req.body;
  const usuario_id = req.session.usuario.id;

  if (!produto_id) return res.status(400).json({ error: 'Medicamento é obrigatório.' });
  if (!tipo || !['entrada', 'saida'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo deve ser "entrada" ou "saida".' });
  }
  if (!quantidade || isNaN(Number(quantidade)) || !Number.isInteger(Number(quantidade)) || Number(quantidade) <= 0) {
    return res.status(400).json({ error: 'Quantidade deve ser um número inteiro positivo.' });
  }
  if (!data_movimentacao || !/^\d{4}-\d{2}-\d{2}$/.test(data_movimentacao)) {
    return res.status(400).json({ error: 'Data inválida. Use o formato AAAA-MM-DD.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [produtos] = await conn.query('SELECT * FROM produto WHERE id = ? FOR UPDATE', [produto_id]);
    if (produtos.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Medicamento não encontrado.' });
    }

    const produto = produtos[0];
    let novoEstoque = produto.estoque_atual;

    if (tipo === 'entrada') {
      novoEstoque += Number(quantidade);
    } else {
      if (Number(quantidade) > produto.estoque_atual) {
        await conn.rollback();
        return res.status(400).json({
          error: `Quantidade insuficiente em estoque. Disponível: ${produto.estoque_atual} unidade(s).`
        });
      }
      novoEstoque -= Number(quantidade);
    }

    await conn.query(
      'INSERT INTO estoque (produto_id, usuario_id, tipo, quantidade, data_movimentacao, observacao) VALUES (?, ?, ?, ?, ?, ?)',
      [produto_id, usuario_id, tipo, Number(quantidade), data_movimentacao, observacao || null]
    );

    await conn.query('UPDATE produto SET estoque_atual = ? WHERE id = ?', [novoEstoque, produto_id]);

    await conn.commit();

    const abaixoMinimo = novoEstoque < produto.estoque_minimo;

    res.status(201).json({
      message: 'Movimentação registrada com sucesso.',
      estoque_atual: novoEstoque,
      alerta_estoque_minimo: abaixoMinimo,
      produto_nome: produto.nome,
      estoque_minimo: produto.estoque_minimo
    });
  } catch (err) {
    await conn.rollback();
    console.error('Erro ao registrar movimentação:', err);
    res.status(500).json({ error: 'Erro ao registrar movimentação.' });
  } finally {
    conn.release();
  }
});

module.exports = router;
