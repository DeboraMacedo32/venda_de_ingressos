const express = require('express');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware'); // Importa middlewares
const Ticket = require('../models/ticket'); // Importa o modelo Ticket
const router = express.Router();

// Rota GET para listar todos os ingressos (interface web - usuários comuns e admins)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.render('ticket', { 
      tickets, 
      isAdmin: req.user.role === 'admin',
      username: req.user.username // Passa o nome do usuário para o template
    });
  } catch (error) {
    res.status(500).send('Erro ao carregar ingressos.');
  }
});

// Rota GET para exibir o formulário de criação de ingresso (apenas admin)
router.get('/admin/tickets/new', authMiddleware, isAdmin, (req, res) => {
  res.render('admin-ticket-form'); // Renderiza o template admin-ticket-form.mustache
});

// Rota POST para criar um novo ingresso (apenas admin)
router.post('/admin/tickets', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    if (!name || !price || !quantity) {
      return res.status(400).send('Todos os campos são obrigatórios.');
    }
    const ticket = new Ticket({ name, price, quantity });
    await ticket.save();
    res.redirect('/ticket'); // Redireciona para a lista de ingressos
  } catch (error) {
    res.status(500).send('Erro ao criar ingresso.');
  }
});

// Rota GET para exibir o formulário de edição de ingresso (apenas admin)
router.get('/admin/tickets/edit/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).send('Ingresso não encontrado.');
    }
    res.render('admin-ticket-form', { ticket }); // Renderiza o template admin-ticket-form.mustache
  } catch (error) {
    res.status(500).send('Erro ao carregar ingresso.');
  }
});

// Rota POST para atualizar um ingresso (apenas admin)
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
    res.redirect('/ticket'); // Redireciona para a lista de ingressos
  } catch (error) {
    res.status(500).send('Erro ao atualizar ingresso.');
  }
});

// Rota POST para excluir um ingresso (apenas admin)
router.post('/admin/tickets/delete/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).send('Ingresso não encontrado.');
    }
    res.redirect('/ticket'); // Redireciona para a lista de ingressos
  } catch (error) {
    res.status(500).send('Erro ao excluir ingresso.');
  }
});

module.exports = router;