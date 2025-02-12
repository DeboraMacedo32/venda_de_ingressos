const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};


const login = async (email, password) => {
  if (!email || !password) {
    throw new Error('E-mail e senha são obrigatórios');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Senha incorreta');
  }

  return generateToken(user);
};

module.exports = { login, generateToken };
