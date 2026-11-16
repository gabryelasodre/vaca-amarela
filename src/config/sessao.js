// Armazena as sessões do express-session na tabela "sessao" do PostgreSQL.
const session = require('express-session');
const sql = require('./db');

class SessaoPostgres extends session.Store {
  get(sid, cb) {
    sql`SELECT dados FROM sessao WHERE sid = ${sid} AND expira_em > now()`
      .then((linhas) => cb(null, linhas[0] ? linhas[0].dados : null), cb);
  }

  set(sid, dados, cb) {
    const expira = dados.cookie && dados.cookie.expires ? new Date(dados.cookie.expires) : new Date(Date.now() + 8 * 3600e3);
    sql`INSERT INTO sessao (sid, dados, expira_em) VALUES (${sid}, ${sql.json(dados)}, ${expira})
        ON CONFLICT (sid) DO UPDATE SET dados = EXCLUDED.dados, expira_em = EXCLUDED.expira_em`
      .then(() => cb && cb(null), cb);
  }

  touch(sid, dados, cb) {
    const expira = new Date(dados.cookie.expires);
    sql`UPDATE sessao SET expira_em = ${expira} WHERE sid = ${sid}`.then(() => cb && cb(null), cb);
  }

  destroy(sid, cb) {
    sql`DELETE FROM sessao WHERE sid = ${sid}`.then(() => cb && cb(null), cb);
  }
}

// Remove sessões vencidas (chamado periodicamente pelo servidor).
function limparVencidas() {
  return sql`DELETE FROM sessao WHERE expira_em < now()`;
}

module.exports = { SessaoPostgres, limparVencidas };
