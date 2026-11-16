// Utilitários dos testes: prepara um banco de teste e um cliente HTTP com cookies.
const fs = require('fs');
const path = require('path');

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
  || 'postgres://vaca:vaca@localhost:5432/vaca_amarela_teste';
process.env.SESSION_SECRET = 'segredo-de-teste';

const sql = require('../src/config/db');
const app = require('../src/app');

async function prepararBanco() {
  for (const arquivo of ['schema.sql', 'seed.sql']) {
    await sql.unsafe(fs.readFileSync(path.join(__dirname, '..', 'db', arquivo), 'utf8'));
  }
}

function iniciarServidor() {
  return new Promise((resolve) => {
    const servidor = app.listen(0, () => resolve(servidor));
  });
}

// Cliente que guarda o cookie de sessão entre requisições, como um navegador.
function cliente(base) {
  let cookie = '';
  async function req(metodo, caminho, campos) {
    const opcoes = { method: metodo, redirect: 'manual', headers: {} };
    if (cookie) opcoes.headers.cookie = cookie;
    if (campos) {
      opcoes.headers['content-type'] = 'application/x-www-form-urlencoded';
      opcoes.body = new URLSearchParams(campos).toString();
    }
    const r = await fetch(base + caminho, opcoes);
    const novo = r.headers.get('set-cookie');
    if (novo) cookie = novo.split(';')[0];
    return { status: r.status, local: r.headers.get('location'), cabecalhos: r.headers, html: await r.text() };
  }
  return {
    get: (c) => req('GET', c),
    post: (c, campos) => req('POST', c, campos || {}),
    entrar: (email, senha = 'vaca123') => req('POST', '/login', { email, senha }),
  };
}

module.exports = { sql, prepararBanco, iniciarServidor, cliente };
