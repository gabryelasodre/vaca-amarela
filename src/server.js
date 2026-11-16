// Ponto de entrada: carrega as variáveis de ambiente e sobe o servidor HTTP.
require('dotenv').config();
const app = require('./app');
const { limparVencidas } = require('./config/sessao');

const porta = process.env.PORT || 3000;
app.listen(porta, () => {
  console.log(`Vaca Amarela em execução: http://localhost:${porta}`);
});

// limpeza de sessões vencidas a cada hora
setInterval(() => limparVencidas().catch(() => {}), 60 * 60 * 1000).unref();
