const express = require('express');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware'); // Importa os middlewares
const Ticket = require('../models/ticket');
const router = express.Router();

// ==============================
// Rotas para Usuários Comuns
// ==============================

// Rota GET para listar todos os ingressos (interface web - usuários comuns)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find();
    // Passa os ingressos e o papel do usuário para o template
    res.render('ticket', { tickets, userRole: req.user.role });
  } catch (error) {
    res.status(500).send('Erro ao carregar ingressos.');
  }
});
// ==============================
// Rotas para Administradores
// ==============================

// Rota GET para listar todos os ingressos (interface web - admin)
router.get('/admin/tickets', authMiddleware, isAdmin, async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.render('admin-tickets', { tickets }); // Renderiza o template admin-tickets.mustache
  } catch (error) {
    res.status(500).send('Erro ao carregar ingressos.');
  }
});

// Rota GET para exibir o formulário de criação de ingresso (interface web - admin)
router.get('/admin/tickets/new', authMiddleware, isAdmin, (req, res) => {
  res.render('admin-ticket-form'); // Renderiza o template admin-ticket-form.mustache
});

// Rota POST para criar um novo ingresso (interface web - admin)
router.post('/admin/tickets', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    // Validação básica
    if (!name || !price || !quantity) {
      return res.status(400).send('Todos os campos são obrigatórios.');
    }

    const ticket = new Ticket({ name, price, quantity });
    await ticket.save();

    res.redirect('/admin/tickets'); // Redireciona para a lista de ingressos
  } catch (error) {
    res.status(500).send('Erro ao criar ingresso.');
  }
});

// Rota GET para exibir o formulário de edição de ingresso (interface web - admin)
router.get('/admin/tickets/edit/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).send('Ingresso não encontrado.');
    }
    res.render('admin-ticket-form', { ticket }); // Renderiza o template admin-ticket-form.mustache com os dados do ingresso
  } catch (error) {
    res.status(500).send('Erro ao carregar ingresso.');
  }
});

// Rota POST para atualizar um ingresso (interface web - admin)
router.post('/admin/tickets/edit/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    // Validação básica
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

    res.redirect('/admin/tickets'); // Redireciona para a lista de ingressos
  } catch (error) {
    res.status(500).send('Erro ao atualizar ingresso.');
  }
});

// Rota POST para excluir um ingresso (interface web - admin)
router.post('/admin/tickets/delete/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).send('Ingresso não encontrado.');
    }

    res.redirect('/admin/tickets'); // Redireciona para a lista de ingressos
  } catch (error) {
    res.status(500).send('Erro ao excluir ingresso.');
  }
});

// ==============================
// Rotas para APIs REST
// ==============================

// Rota GET para listar todos os ingressos (API REST)
router.get('/api/tickets', authMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets); // Retorna os ingressos como JSON
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota POST para criar um novo ingresso (API REST)
router.post('/api/tickets', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    // Validação básica
    if (!name || !price || !quantity) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const ticket = new Ticket({ name, price, quantity });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota PUT para atualizar um ingresso (API REST)
router.put('/api/tickets/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    // Validação básica
    if (!name || !price || !quantity) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { name, price, quantity },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ingresso não encontrado' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota DELETE para excluir um ingresso (API REST)
router.delete('/api/tickets/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ingresso não encontrado' });
    }

    res.status(200).json({ message: 'Ingresso deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;