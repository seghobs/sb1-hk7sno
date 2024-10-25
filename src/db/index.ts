import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'chat.db'));

// Initialize database with schema
const schema = `
  -- Schema SQL content from schema.sql
`;

db.exec(schema);

export default db;