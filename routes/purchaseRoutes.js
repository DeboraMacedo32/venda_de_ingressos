const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware'); // Desestruture o middleware
const Ticket = require('../models/ticket');
const Purchase = require('../models/purchase');
const router = express.Router();

// Comprar ingressos
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { purchases } = req.body; // Array de { ticketId, quantity }
    const userId = req.user.id;
    let totalPrice = 0;
    const ticketsToBuy = [];

    for (const purchase of purchases) {
      const ticket = await Ticket.findById(purchase.ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ingresso não encontrado' });
      }
      if (ticket.quantity < purchase.quantity) {
        return res.status(400).json({ message: `Estoque insuficiente para ${ticket.name}` });
      }
      ticket.quantity -= purchase.quantity;
      await ticket.save();
      totalPrice += ticket.price * purchase.quantity;
      ticketsToBuy.push({ ticket: ticket._id, quantity: purchase.quantity });
    }

    const purchaseRecord = new Purchase({
      user: userId,
      tickets: ticketsToBuy,
      totalPrice,
    });
    await purchaseRecord.save();
    res.status(201).json({ message: 'Compra realizada com sucesso', purchase: purchaseRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;