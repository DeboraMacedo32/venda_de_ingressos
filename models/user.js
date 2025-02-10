const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Validação de e-mail com validator
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(value) {
        return validator.isEmail(value); // Usa a função isEmail do validator
      },
      message: 'O e-mail fornecido não tem um formato válido'
    }
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

// Hash da senha antes de salvar ou quando modificada
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 8);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para verificar a senha
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
