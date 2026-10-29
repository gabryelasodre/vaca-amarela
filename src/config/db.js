// Conexão com o PostgreSQL por meio de um pool reutilizável.
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 5,                       // instância pequena (db.t4g.micro) – poucas conexões
  idleTimeoutMillis: 30000,
});

module.exports = { pool, query: (texto, params) => pool.query(texto, params) };
