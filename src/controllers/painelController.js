const rebanho = require('../models/rebanhoModel');

async function inicio(req, res, next) {
  try {
    const categorias = await rebanho.resumoPorCategoria(req.session.usuario.propriedadeId);
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

function mais(req, res) {
  res.render('paginas/mais', { titulo: 'Mais', ativo: 'mais' });
}

module.exports = { inicio, emConstrucao, mais };
