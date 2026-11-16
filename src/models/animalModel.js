// Acesso aos dados de animais. TODAS as consultas filtram pela propriedade do usuário (RNF06).
const sql = require('../config/db');

const CAMPOS = ['numero', 'nome', 'brinco', 'sinais', 'sexo', 'raca', 'data_nascimento',
  'nascimento_estimado', 'categoria', 'lote_id', 'mae_id', 'observacoes'];

function listar(propriedadeId, filtros = {}) {
  const { busca, categoria, loteId, situacao } = filtros;
  const termo = busca ? `%${busca}%` : null;
  return sql`
    SELECT a.id, a.numero, a.nome, a.sexo, a.categoria, a.situacao, l.nome AS lote
      FROM animal a LEFT JOIN lote l ON l.id = a.lote_id
     WHERE a.propriedade_id = ${propriedadeId}
       ${termo ? sql`AND (a.numero ILIKE ${termo} OR a.nome ILIKE ${termo})` : sql``}
       ${categoria ? sql`AND a.categoria = ${categoria}` : sql``}
       ${loteId ? sql`AND a.lote_id = ${loteId}` : sql``}
       ${situacao === 'inativos' ? sql`AND a.situacao <> 'ativo'`
         : situacao === 'todos' ? sql`` : sql`AND a.situacao = 'ativo'`}
     ORDER BY CASE WHEN a.numero ~ '^[0-9]+$' THEN lpad(a.numero, 12, '0') ELSE a.numero END
     LIMIT 200`;
}

async function buscar(propriedadeId, id) {
  const [animal] = await sql`
    SELECT a.*, l.nome AS lote, m.numero AS mae_numero, m.nome AS mae_nome
      FROM animal a
      LEFT JOIN lote l ON l.id = a.lote_id
      LEFT JOIN animal m ON m.id = a.mae_id
     WHERE a.id = ${id} AND a.propriedade_id = ${propriedadeId}`;
  return animal || null;
}

function historicoLotes(animalId) {
  return sql`
    SELECT m.data, o.nome AS origem, d.nome AS destino
      FROM movimentacao_lote m
      LEFT JOIN lote o ON o.id = m.lote_origem_id
      JOIN lote d ON d.id = m.lote_destino_id
     WHERE m.animal_id = ${animalId}
     ORDER BY m.data DESC, m.id DESC`;
}

function femeas(propriedadeId, excetoId) {
  return sql`
    SELECT id, numero, nome FROM animal
     WHERE propriedade_id = ${propriedadeId} AND sexo = 'F'
       ${excetoId ? sql`AND id <> ${excetoId}` : sql``}
     ORDER BY numero`;
}

async function criar(propriedadeId, dados) {
  return sql.begin(async (tx) => {
    const [novo] = await tx`
      INSERT INTO animal ${sql({ ...dados, propriedade_id: propriedadeId }, ...CAMPOS, 'propriedade_id')}
      RETURNING id`;
    if (dados.lote_id) {
      await tx`INSERT INTO movimentacao_lote (animal_id, lote_origem_id, lote_destino_id)
               VALUES (${novo.id}, NULL, ${dados.lote_id})`;
    }
    return novo.id;
  });
}

// Atualiza o animal e, se o lote mudou, registra a movimentação na mesma transação.
async function atualizar(propriedadeId, id, dados) {
  return sql.begin(async (tx) => {
    const [atual] = await tx`SELECT lote_id FROM animal
                              WHERE id = ${id} AND propriedade_id = ${propriedadeId} FOR UPDATE`;
    if (!atual) return false;
    await tx`UPDATE animal SET ${sql(dados, ...CAMPOS)} WHERE id = ${id} AND propriedade_id = ${propriedadeId}`;
    if (dados.lote_id && dados.lote_id !== atual.lote_id) {
      await tx`INSERT INTO movimentacao_lote (animal_id, lote_origem_id, lote_destino_id)
               VALUES (${id}, ${atual.lote_id}, ${dados.lote_id})`;
    }
    return true;
  });
}

async function alterarSituacao(propriedadeId, id, situacao) {
  const r = await sql`UPDATE animal SET situacao = ${situacao}
                       WHERE id = ${id} AND propriedade_id = ${propriedadeId}`;
  return r.count === 1;
}

module.exports = { listar, buscar, historicoLotes, femeas, criar, atualizar, alterarSituacao };
