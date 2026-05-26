const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const produtosRoutes = require('./routes/produtos');
const estoqueRoutes = require('./routes/estoque');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'saep_farmacia_2026_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/estoque', estoqueRoutes);

// Serve o build do React (producao: npm run build dentro de frontend/)
const distPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log('Backend rodando em http://localhost:' + PORT);
  console.log('Desenvolvimento: cd frontend && npm run dev (porta 5173)');
  console.log('Producao: cd frontend && npm run build, depois acesse porta 3000');
});
