const sql = require('../config/db');

function listar(propriedadeId) {
  return sql`
    SELECT l.id, l.nome, l.descricao,
           COUNT(a.id) FILTER (WHERE a.situacao = 'ativo')::int AS animais
      FROM lote l LEFT JOIN animal a ON a.lote_id = l.id
     WHERE l.propriedade_id = ${propriedadeId} AND l.ativo
     GROUP BY l.id ORDER BY l.nome`;
}

async function pertence(propriedadeId, loteId) {
  const [l] = await sql`SELECT 1 FROM lote WHERE id = ${loteId} AND propriedade_id = ${propriedadeId}`;
  return Boolean(l);
}

function criar(propriedadeId, nome, descricao) {
  return sql`INSERT INTO lote (propriedade_id, nome, descricao) VALUES (${propriedadeId}, ${nome}, ${descricao})`;
}

module.exports = { listar, pertence, criar };
