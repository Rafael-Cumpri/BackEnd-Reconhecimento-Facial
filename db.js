const { Pool } = require('pg');

// Configura a conexão com o PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'reconhecimento_facial',
  password: 'ds564',
  port: 7777,
});

module.exports = pool;