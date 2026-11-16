const { Router } = require('express');
const painel = require('../controllers/painelController');
const saude = require('../controllers/saudeController');
const autenticacao = require('../controllers/autenticacaoController');
const { exigirLogin } = require('../middlewares/autenticacao');

const rotas = Router();

// Rotas públicas
rotas.get('/saude', saude.verificar);
rotas.get('/login', autenticacao.formulario);
rotas.post('/login', autenticacao.entrar);

// Daqui em diante, somente usuários autenticados (RF01)
rotas.use(exigirLogin);
rotas.post('/sair', autenticacao.sair);
rotas.get('/', painel.inicio);
rotas.get('/mais', painel.mais);

// Áreas previstas para as próximas sprints (ver Kanban)
rotas.get(['/animais', '/manejos'], painel.emConstrucao);

module.exports = rotas;
