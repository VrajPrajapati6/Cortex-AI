import { pool } from './config/db.js';

async function main() {
  try {
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('--- TABLES ---');
    console.log(tables.rows);
    for (const t of tables.rows) {
      const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name=$1", [t.table_name]);
      console.log(`--- COLUMNS FOR ${t.table_name} ---`);
      console.log(cols.rows);
      const count = await pool.query(`SELECT count(*) FROM "${t.table_name}"`);
      console.log(`--- COUNT FOR ${t.table_name} ---`, count.rows[0]);
    }
  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await pool.end();
  }
}

main();
