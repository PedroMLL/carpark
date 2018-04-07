// Update with your config settings.

module.exports = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL||"postgres://test:test@localhost:5432/test",
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};
