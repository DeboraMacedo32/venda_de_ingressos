const express = require('express');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware'); 
const Ticket = require('../models/ticket'); 
const router = express.Router();


router.get('/', authMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.render('ticket', { 
      tickets, 
      isAdmin: req.user.role === 'admin',
      username: req.user.username 
    });
  } catch (error) {
    res.status(500).send('Erro ao carregar ingressos.');
  }
});

router.get('/admin/tickets/new', authMiddleware, isAdmin, (req, res) => {
  res.render('admin-ticket-form'); 
});

router.post('/admin/tickets', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    if (!name || !price || !quantity) {
      return res.status(400).send('Todos os campos são obrigatórios.');
    }
    const ticket = new Ticket({ name, price, quantity });
    await ticket.save();
    res.redirect('/ticket'); 
  } catch (error) {
    res.status(500).send('Erro ao criar ingresso.');
  }
});

router.get('/admin/tickets/edit/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).send('Ingresso não encontrado.');
    }
    res.render('admin-ticket-form', { ticket }); 
  } catch (error) {
    res.status(500).send('Erro ao carregar ingresso.');
  }
});

router.post('/admin/tickets/edit/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    if (!name || !price || !quantity) {
      return res.status(400).send('Todos os campos são obrigatórios.');
    }
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { name, price, quantity },
      { new: true }
    );
    if (!ticket) {
      return res.status(404).send('Ingresso não encontrado.');
    }
    res.redirect('/ticket');
  } catch (error) {
    res.status(500).send('Erro ao atualizar ingresso.');
  }
});

router.post('/admin/tickets/delete/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).send('Ingresso não encontrado.');
    }
    res.redirect('/ticket'); 
  } catch (error) {
    res.status(500).send('Erro ao excluir ingresso.');
  }
});

module.exports = router;