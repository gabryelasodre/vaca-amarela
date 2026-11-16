const sql = require('../config/db');

async function buscarPorEmail(email) {
  const [usuario] = await sql`
    SELECT u.id, u.nome, u.email, u.senha_hash, u.propriedade_id, p.nome AS propriedade
      FROM usuario u JOIN propriedade p ON p.id = u.propriedade_id
     WHERE lower(u.email) = lower(${email}) AND u.ativo`;
  return usuario || null;
}

module.exports = { buscarPorEmail };
