const { Router } = require('express');
const painel = require('../controllers/painelController');
const saude = require('../controllers/saudeController');
const autenticacao = require('../controllers/autenticacaoController');
const animal = require('../controllers/animalController');
const lote = require('../controllers/loteController');
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

rotas.get('/animais', animal.listar);
rotas.get('/animais/novo', animal.novo);
rotas.post('/animais', animal.salvar);
rotas.get('/animais/:id', animal.ficha);
rotas.get('/animais/:id/editar', animal.editar);
rotas.post('/animais/:id', animal.salvar);
rotas.post('/animais/:id/inativar', animal.inativar);
rotas.post('/animais/:id/reativar', animal.reativar);

rotas.get('/lotes', lote.listar);
rotas.post('/lotes', lote.criar);
rotas.get('/mais', painel.mais);

// Área prevista para a Sprint 03 (ver Kanban)
rotas.get('/manejos', painel.emConstrucao);

module.exports = rotas;
