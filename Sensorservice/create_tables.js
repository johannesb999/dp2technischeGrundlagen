const sqlite3 = require("sqlite3").verbose();

const setupDatabase = () => {
  let db = new sqlite3.Database("./mqtt_data.db", (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS temperature_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          temperature REAL,
          mac TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);
    db.run(`CREATE TABLE IF NOT EXISTS humidity_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          humidity REAL,
          mac TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);
    db.run(`CREATE TABLE IF NOT EXISTS soilMoisture_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            soilMoisture REAL,
            mac TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
    db.run(`CREATE TABLE IF NOT EXISTS light_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                light REAL,
                mac TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )`);
  });

  return db;
};

module.exports = setupDatabase;
