const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tickets: [
    {
      ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);
module.exports = Purchase;