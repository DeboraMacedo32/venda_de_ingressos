const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config(); // Carrega as variáveis do .env

// Função para gerar o token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Função de login
const login = async (email, password) => {
  // Validação simples de entrada
  if (!email || !password) {
    throw new Error('E-mail e senha são obrigatórios');
  }

  // Procura o usuário no banco de dados pelo e-mail
  const user = await User.findOne({ email });

  // Verificação de usuário
  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  // Verificação de senha (supondo que você tenha uma função comparePassword no modelo User)
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Senha incorreta');
  }

  // Retorna o token gerado
  return generateToken(user);
};

module.exports = { login, generateToken };
