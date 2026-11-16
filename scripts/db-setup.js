// Cria as tabelas (db/schema.sql) e insere os dados fictícios (db/seed.sql).
// Uso: npm run db:setup   |   apenas estrutura: node scripts/db-setup.js --sem-dados
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sql = require('../src/config/db');

async function executar(arquivo) {
  const texto = fs.readFileSync(path.join(__dirname, '..', 'db', arquivo), 'utf8');
  await sql.unsafe(texto);          // arquivo local do projeto, sem dados do usuário
  console.log(`✔ ${arquivo} executado`);
}

(async () => {
  try {
    await executar('schema.sql');
    if (!process.argv.includes('--sem-dados')) await executar('seed.sql');
  } catch (erro) {
    console.error('Falha ao preparar o banco:', erro.message);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
})();
