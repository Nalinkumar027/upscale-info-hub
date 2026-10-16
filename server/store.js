import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
const dataDir = path.resolve('server/data');
fs.mkdirSync(dataDir,{recursive:true});
export const db = new Database(path.join(dataDir,'upscale.sqlite'));
export function initDb(){
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles(
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, role TEXT NOT NULL,
      skills TEXT DEFAULT '', location TEXT DEFAULT '', availability TEXT DEFAULT 'Available', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS jobs(
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT DEFAULT '',
      location TEXT NOT NULL, pay TEXT DEFAULT '', created_by TEXT DEFAULT 'demo', status TEXT DEFAULT 'open', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sellers(
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL,
      location TEXT NOT NULL, description TEXT DEFAULT '', contact TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS enquiries(
      id INTEGER PRIMARY KEY AUTOINCREMENT, seller_id INTEGER NOT NULL, name TEXT NOT NULL,
      message TEXT NOT NULL, contact TEXT DEFAULT '', status TEXT DEFAULT 'new', created_at TEXT NOT NULL,
      FOREIGN KEY(seller_id) REFERENCES sellers(id)
    );
  `);
  const count = db.prepare('SELECT COUNT(*) n FROM jobs').get().n;
  if (!count) {
    const insert = db.prepare(`INSERT INTO jobs(title,description,location,pay,created_by,status,created_at) VALUES(?,?,?,?,?,'open',datetime('now'))`);
    const seed = db.transaction(()=>[
      ['Farm helper','Help with seasonal farm tasks. Confirm hours and duties before accepting.','Coimbatore','₹700/day','sample'],
      ['Electrician assistant','Assist an experienced electrician with routine tasks.','Tiruppur','₹600/day','sample'],
      ['Produce packing helper','Help sort and pack seasonal produce.','Erode','₹550/day','sample']
    ].forEach(x=>insert.run(...x)));
    seed();
  }
  if (!db.prepare('SELECT COUNT(*) n FROM sellers').get().n) {
    const insert=db.prepare('INSERT INTO sellers(name,category,location,description,contact) VALUES(?,?,?,?,?)');
    [
      ['Green Field Farm Supplies','Seeds & farm supplies','Coimbatore','Example supplier listing',''],
      ['Local Harvest Buyers','Produce buyer','Erode','Example buyer listing',''],
      ['Community Equipment Rental','Equipment rental','Tiruppur','Example equipment listing','']
    ].forEach(x=>insert.run(...x));
  }
}