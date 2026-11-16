// Consultas de leitura do rebanho para o painel (camada Model).
const sql = require('../config/db');

function resumoPorCategoria(propriedadeId) {
  return sql`
    SELECT categoria, COUNT(*)::int AS total
      FROM animal
     WHERE propriedade_id = ${propriedadeId} AND situacao = 'ativo'
     GROUP BY categoria
     ORDER BY categoria`;
}

module.exports = { resumoPorCategoria };
