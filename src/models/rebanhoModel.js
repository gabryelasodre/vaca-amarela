// Consultas de leitura do rebanho (camada Model).
const db = require('../config/db');

// Por enquanto a aplicação trabalha com a propriedade de teste (id 1).
// O vínculo com o usuário autenticado será implementado junto ao login (RF01 – Sprint 02).
async function resumoPorCategoria(propriedadeId) {
  const { rows } = await db.query(
    `SELECT categoria, COUNT(*)::int AS total
       FROM animal
      WHERE propriedade_id = $1 AND situacao = 'ativo'
      GROUP BY categoria
      ORDER BY categoria`,
    [propriedadeId],
  );
  return rows;
}

module.exports = { resumoPorCategoria };
