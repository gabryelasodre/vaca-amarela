// Conexão com o PostgreSQL (biblioteca postgres.js).
// As consultas são escritas como template strings (sql`... ${valor}`): cada valor
// interpolado vira um parâmetro da consulta, nunca texto concatenado (proteção contra SQL injection).
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL, {
  ssl: process.env.DATABASE_SSL === 'true' ? 'require' : false,
  max: 5,                 // instância pequena (db.t4g.micro) – poucas conexões
  idle_timeout: 30,
  onnotice: () => {},
  // datas (tipo date) chegam como texto AAAA-MM-DD, sem conversão de fuso horário
  types: { date: { to: 1082, from: [1082], serialize: (x) => x, parse: (x) => x } },
});

module.exports = sql;
