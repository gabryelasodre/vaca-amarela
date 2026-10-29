// Ponto de entrada: carrega as variáveis de ambiente e sobe o servidor HTTP.
require('dotenv').config();
const app = require('./app');

const porta = process.env.PORT || 3000;
app.listen(porta, () => {
  console.log(`Vaca Amarela em execução: http://localhost:${porta}`);
});
