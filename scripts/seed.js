require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const Ticket = require('../models/ticket');
const Purchase = require('../models/purchase');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany({});
    await Ticket.deleteMany({});
    await Purchase.deleteMany({});
    console.log('Banco de dados limpo.');


    const user = new User({
      username: 'joao123',
      email: 'joao@example.com',
      password: 'senha123',
      role: 'user',
    });
    await user.save();
    console.log('Usuário criado:', user);

    const ticket = new Ticket({
      name: 'Ingresso VIP',
      price: 100,
      quantity: 50,
    });
    await ticket.save();
    console.log('Ingresso criado:', ticket);

    const purchase = new Purchase({
      user: user._id,
      tickets: [{ ticket: ticket._id, quantity: 2 }],
      totalPrice: ticket.price * 2,
    });
    await purchase.save();
    console.log('Compra criada:', purchase);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error.message);
  }
};

seedDatabase();