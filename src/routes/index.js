const { Router } = require('express');
const painel = require('../controllers/painelController');
const saude = require('../controllers/saudeController');

const rotas = Router();

rotas.get('/', painel.inicio);
rotas.get('/saude', saude.verificar);

// Áreas previstas para as próximas sprints (ver Kanban)
rotas.get(['/animais', '/manejos', '/mais'], painel.emConstrucao);

module.exports = rotas;
