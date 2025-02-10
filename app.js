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
const app = express();

// Conexão com o banco de dados
connectDB();

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger); // Registra logs de requisições

// Configuração do Mustache como template engine
app.engine('mustache', (filePath, options, callback) => {
  fs.readFile(filePath, 'utf-8', (err, content) => {
    if (err) return callback(err);
    const rendered = mustache.render(content, options);
    return callback(null, rendered);
  });
});

// Definir o diretório de views e o motor de templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

// Rotas públicas
app.get('/login', (req, res) => {
  res.render('login'); // Renderiza o arquivo login.mustache
});

// Rotas protegidas
app.use('/auth', authRoutes);
app.use('/ticket', authMiddleware, ticketRoutes);
app.use('/purchase', authMiddleware, purchaseRoutes);

// Rota protegida para administradores
app.use('/admin-route', authMiddleware, isAdmin, (req, res) => {
  res.send('Esta rota só pode ser acessada por administradores.');
});

// Rota de histórico de compras
app.use('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const purchases = await Purchase.find({ user: userId }).populate('tickets.ticket');
    res.render('history', { purchases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tratamento de erros global
app.use(errorHandler);

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});