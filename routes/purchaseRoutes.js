const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const Ticket = require('../models/ticket');
const Purchase = require('../models/purchase');
const router = express.Router();

// Rota POST para exibir o resumo da compra
router.post('/summary', authMiddleware, async (req, res) => {
  try {
    const { ticketId, quantity } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket || ticket.quantity < quantity) {
      return res.status(400).send('Ingresso indisponível ou quantidade inválida.');
    }
    const totalPrice = ticket.price * quantity;
    res.render('purchase-summary', { ticket, quantity, totalPrice });
  } catch (error) {
    res.status(500).send('Erro ao processar a compra.');
  }
});

// Rota POST para confirmar o pagamento
router.post('/confirm', authMiddleware, async (req, res) => {
  try {
    const { ticketId, quantity } = req.body;
    const userId = req.user.id;

    // Encontra o ingresso
    const ticket = await Ticket.findById(ticketId);
    if (!ticket || ticket.quantity < quantity) {
      return res.status(400).send('Ingresso indisponível ou quantidade inválida.');
    }

    // Deduz a quantidade disponível
    ticket.quantity -= quantity;
    await ticket.save();

    // Calcula o valor total
    const totalPrice = ticket.price * quantity;

    // Registra a compra
    const purchaseRecord = new Purchase({
      user: userId,
      tickets: [{ ticket: ticketId, quantity }],
      totalPrice,
    });
    await purchaseRecord.save();

    // Renderiza a tela de confirmação
    res.render('purchase-confirmation', { ticket, quantity, totalPrice });
  } catch (error) {
    res.status(500).send('Erro ao confirmar a compra.');
  }
});

module.exports = router;