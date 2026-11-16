const bcrypt = require('bcryptjs');
const usuarios = require('../models/usuarioModel');

function formulario(req, res) {
  if (req.session.usuario) return res.redirect('/');
  res.render('paginas/login', { titulo: 'Entrar', ativo: '', email: '', erro: null });
}

async function entrar(req, res, next) {
  try {
    const email = String(req.body.email || '').trim();
    const senha = String(req.body.senha || '');
    const usuario = email && senha ? await usuarios.buscarPorEmail(email) : null;
    const ok = usuario ? await bcrypt.compare(senha, usuario.senha_hash) : false;
    if (!ok) {
      return res.status(401).render('paginas/login', {
        titulo: 'Entrar', ativo: '', email, erro: 'E-mail ou senha incorretos.',
      });
    }
    const destino = req.session.voltarPara || '/';
    // nova sessão a cada login (evita fixação de sessão)
    req.session.regenerate((erro) => {
      if (erro) return next(erro);
      req.session.usuario = {
        id: usuario.id, nome: usuario.nome, propriedadeId: usuario.propriedade_id, propriedade: usuario.propriedade,
      };
      req.session.save(() => res.redirect(destino));
    });
  } catch (erro) {
    next(erro);
  }
}

function sair(req, res, next) {
  req.session.destroy((erro) => {
    if (erro) return next(erro);
    res.clearCookie('vaca.sid');
    res.redirect('/login');
  });
}

module.exports = { formulario, entrar, sair };
