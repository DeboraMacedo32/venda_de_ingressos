const express = require('express');
const { login } = require('../services/auth');
const User = require('../models/user');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login'); 
});

router.post('/login', async (req, res) => {
  try {
    const token = await login(req.body.email, req.body.password);

    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 3600000,
    });

    return res.redirect('/ticket');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/register', (req, res) => {
  res.render('register'); 
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const user = new User({ username, email, password, role });
    await user.save();

    if (req.accepts('html')) {
      return res.redirect('/login'); 
    }

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota GET para logout
router.get('/logout', (req, res) => {
  // Limpa o cookie contendo o token
  res.clearCookie('token'); // Substitua 'token' pelo nome do cookie que você usa para armazenar o token
  res.redirect('/login'); // Redireciona para a página de login
});

module.exports = router;