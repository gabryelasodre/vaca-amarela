const lotes = require('../models/loteModel');

async function listar(req, res, next) {
  try {
    res.render('paginas/lotes', {
      titulo: 'Lotes', ativo: 'mais', lotes: await lotes.listar(req.session.usuario.propriedadeId),
      valores: {}, erro: null,
    });
  } catch (erro) { next(erro); }
}

async function criar(req, res, next) {
  const pid = req.session.usuario.propriedadeId;
  const nome = String(req.body.nome || '').trim();
  const descricao = String(req.body.descricao || '').trim() || null;
  try {
    if (!nome || nome.length > 60) {
      return res.status(422).render('paginas/lotes', {
        titulo: 'Lotes', ativo: 'mais', lotes: await lotes.listar(pid),
        valores: { nome, descricao }, erro: 'Informe um nome de até 60 caracteres.',
      });
    }
    await lotes.criar(pid, nome, descricao);
    req.session.aviso = `Lote "${nome}" criado.`;
    res.redirect('/lotes');
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(422).render('paginas/lotes', {
        titulo: 'Lotes', ativo: 'mais', lotes: await lotes.listar(pid),
        valores: { nome, descricao }, erro: 'Já existe um lote com esse nome.',
      });
    }
    next(erro);
  }
}

module.exports = { listar, criar };
