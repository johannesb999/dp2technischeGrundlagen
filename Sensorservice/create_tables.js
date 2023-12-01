const sqlite3 = require("sqlite3").verbose();

const setupDatabase = () => {
  let db = new sqlite3.Database("./mqtt_data.db", (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Messungen (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          Wert REAL,
          SensorTyp TEXT,
          mac TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);
    //
    db.run(`CREATE TABLE IF NOT EXISTS User (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT NOT NULL,
            Email TEXT NOT NULL UNIQUE,
            Password TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

    db.run(`CREATE TABLE IF NOT EXISTS Gruppe (
            GruppenID INTEGER PRIMARY KEY AUTOINCREMENT,
            AdminID INTEGER NOT NULL,
            Bezeichnung TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (AdminID) REFERENCES User (UserID)
          )`);

    db.run(`CREATE TABLE IF NOT EXISTS Geraet (
            GeraeteID TEXT PRIMARY KEY,
            OwnerID INTEGER NOT NULL,
            GeraeteName TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            Raum TEXT,
            FOREIGN KEY (OwnerID) REFERENCES User (UserID)
          )`);

    db.run(`CREATE TABLE IF NOT EXISTS GruppeGeraet (
            GruppenID INTEGER NOT NULL,
            GeraeteID TEXT NOT NULL,
            PRIMARY KEY (GruppenID, GeraeteID),
            FOREIGN KEY (GruppenID) REFERENCES Gruppe (GruppenID),
            FOREIGN KEY (GeraeteID) REFERENCES Geraet (GeraeteID)
          )`);
  });

  return db;
};

module.exports = setupDatabase;
