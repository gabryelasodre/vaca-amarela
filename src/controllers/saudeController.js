const db = require('../config/db');

// Verifica se a aplicação está no ar e se consegue acessar o banco de dados.
async function verificar(req, res) {
  const inicio = Date.now();
  try {
    const { rows } = await db.query('SELECT version() AS versao, now() AS horario');
    res.json({
      aplicacao: 'ok',
      banco: 'ok',
      versao_banco: rows[0].versao.split(',')[0],
      tempo_resposta_ms: Date.now() - inicio,
    });
  } catch (erro) {
    res.status(503).json({ aplicacao: 'ok', banco: 'indisponível', detalhe: erro.code || erro.message });
  }
}

module.exports = { verificar };
