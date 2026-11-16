const sql = require('../config/db');

// Verifica se a aplicação está no ar e se consegue acessar o banco de dados.
async function verificar(req, res) {
  const inicio = Date.now();
  try {
    const [linha] = await sql`SELECT version() AS versao`;
    res.json({
      aplicacao: 'ok',
      banco: 'ok',
      versao_banco: linha.versao.split(',')[0],
      tempo_resposta_ms: Date.now() - inicio,
    });
  } catch (erro) {
    res.status(503).json({ aplicacao: 'ok', banco: 'indisponível', detalhe: erro.code || erro.message });
  }
}

module.exports = { verificar };
