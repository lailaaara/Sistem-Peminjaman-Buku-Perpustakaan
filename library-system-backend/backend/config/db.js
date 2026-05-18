const { Pool } = require("pg");

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.PGHOST || "localhost",
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "",
      database: process.env.PGDATABASE || "librari_db",
      port: parseInt(process.env.PGPORT || "5432", 10),
    });

pool.on("connect", () => {
  console.log("PostgreSQL Connected...");
});

pool.on("error", (err) => {
  console.error("PostgreSQL connection error:", err);
});

module.exports = pool;
