const rebanho = require('../models/rebanhoModel');

const PROPRIEDADE_TESTE = 1;

async function inicio(req, res, next) {
  try {
    const categorias = await rebanho.resumoPorCategoria(PROPRIEDADE_TESTE);
    const total = categorias.reduce((soma, c) => soma + c.total, 0);
    res.render('paginas/inicio', { titulo: 'Início', ativo: 'inicio', categorias, total });
  } catch (erro) {
    next(erro);
  }
}

function emConstrucao(req, res) {
  const area = req.path.replace('/', '');
  res.render('paginas/mensagem', {
    titulo: 'Em construção', ativo: area,
    texto: 'Esta área será desenvolvida nas próximas sprints do projeto.',
  });
}

module.exports = { inicio, emConstrucao };
