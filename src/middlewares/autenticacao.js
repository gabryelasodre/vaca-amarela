// Exige usuário autenticado e impede que páginas com dados fiquem em cache
// (após "Sair", o botão Voltar do navegador não mostra os dados – CA01).
function exigirLogin(req, res, next) {
  if (!req.session.usuario) {
    if (req.method === 'GET') req.session.voltarPara = req.originalUrl;
    return res.redirect('/login');
  }
  res.set('Cache-Control', 'no-store');
  res.locals.usuario = req.session.usuario;
  next();
}

// Mensagem de confirmação exibida uma única vez (ex.: "Animal salvo com sucesso").
function avisos(req, res, next) {
  res.locals.aviso = req.session.aviso || null;
  delete req.session.aviso;
  res.locals.usuario = req.session.usuario || null;
  next();
}

module.exports = { exigirLogin, avisos };
