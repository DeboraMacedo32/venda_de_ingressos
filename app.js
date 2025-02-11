require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { authMiddleware, isAdmin } = require('./middleware/authMiddleware');
const mustache = require('mustache');
const fs = require('fs');
const path = require('path');
const Purchase = require('./models/purchase');
const app = express();

// Conexão com o banco de dados
connectDB();

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

// Configuração do mecanismo de visualização Mustache
app.engine('mustache', (filePath, options, callback) => {
  fs.readFile(filePath, 'utf-8', (err, content) => {
    if (err) return callback(err);
    const rendered = mustache.render(content, options);
    return callback(null, rendered);
  });
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

// Rotas públicas
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/register', (req, res) => {
  res.render('register');
});

// Rotas protegidas por autenticação
app.use('/auth', authRoutes);
app.use('/ticket', authMiddleware, ticketRoutes);
app.use('/purchase', authMiddleware, purchaseRoutes);

// Rota específica para administradores
app.use('/admin-route', authMiddleware, isAdmin, (req, res) => {
  res.send('Esta rota só pode ser acessada por administradores.');
});
// Rota para listar ingressos
app.get('/ticket', authMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.render('ticket', { 
      tickets, 
      isAdmin: req.user.role === 'admin',
      username: req.user.username // Passa o nome do usuário para o template
    });
  } catch (error) {
    res.status(500).send('Erro ao carregar ingressos.');
  }
});

// Rota para o histórico de compras
app.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const purchases = await Purchase.find({ user: userId }).populate('tickets.ticket');
    res.render('history', { 
      purchases,
      username: req.user.username // Passa o nome do usuário para o template
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Middleware de tratamento de erros
app.use(errorHandler);

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});