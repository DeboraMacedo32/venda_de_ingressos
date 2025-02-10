const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const Ticket = mongoose.model('Ticket', TicketSchema);
module.exports = Ticket;
