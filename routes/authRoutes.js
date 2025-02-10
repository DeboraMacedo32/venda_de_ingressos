const express = require('express');
const { login } = require('../services/auth');
const User = require('../models/user');
const router = express.Router();

// Rota GET para exibir o formulário de login
router.get('/login', (req, res) => {
  res.render('login'); // Renderiza o arquivo login.mustache
});

// Rota POST para processar o login
router.post('/login', async (req, res) => {
  try {
    const token = await login(req.body.email, req.body.password);

    // Armazena o token em um cookie seguro
    res.cookie('token', token, {
      httpOnly: true, // O cookie só pode ser acessado pelo servidor
      secure: process.env.NODE_ENV === 'production', // Use HTTPS em produção
      maxAge: 3600000, // 1 hora
    });

    // Redireciona para a página de ingressos (interface web)
    return res.redirect('/ticket');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota de cadastro
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validação básica
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verifica se o e-mail já está cadastrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    // Cria o novo usuário
    const user = new User({ username, email, password, role });
    await user.save();
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;