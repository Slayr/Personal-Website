const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs'); // Import bcryptjs

const dbPath = path.join(__dirname, 'personal_website.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL'); // Enable Write-Ahead Logging for better concurrency

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date INTEGER DEFAULT (strftime('%s','now')),
    author_id INTEGER,
    FOREIGN KEY (author_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    metadata TEXT, -- Storing metadata as JSON string
    upload_date INTEGER DEFAULT (strftime('%s','now')),
    uploaded_by_id INTEGER,
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
  );
`);

// --- Idempotent Schema Migration for 'photos' table ---
const columns = db.prepare("PRAGMA table_info(photos)").all();
const sourceColumnExists = columns.some(col => col.name === 'source');

if (!sourceColumnExists) {
  console.log("Adding 'source' column to photos table...");
  db.exec("ALTER TABLE photos ADD COLUMN source TEXT NOT NULL DEFAULT 'portfolio'");
  console.log("Column 'source' added successfully.");
} else {
  // Optional: Backfill null values if any exist from a previous failed migration
  db.exec("UPDATE photos SET source = 'portfolio' WHERE source IS NULL");
}

// Insert default admin user if not exists
const initializeAdminUser = () => {
  const adminUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!adminUser) {
    const adminPassword = process.env.ADMIN_PASSWORD; // Get password from env
    if (!adminPassword) {
      console.warn('WARNING: ADMIN_PASSWORD not set in .env. Admin user will not be created.');
      return;
    }
    const hashedPassword = bcrypt.hashSync(adminPassword, 10); // Hash synchronously for setup
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?) ').run('admin', hashedPassword);
    console.log('Default admin user created.');
  }
};

initializeAdminUser();

module.exports = db;
