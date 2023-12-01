const sqlite3 = require("sqlite3").verbose();

const setupDatabase = () => {
  let db = new sqlite3.Database("./mqtt_data.db", (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        DeviceID INTEGER,
        Value REAL,
        SensorType TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (DeviceID) REFERENCES Device (DeviceID)
      )`);

    db.run(`CREATE TABLE IF NOT EXISTS User (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT,
            Email TEXT UNIQUE,
            Password TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

    db.run(`CREATE TABLE IF NOT EXISTS UserGroup (
            GroupID INTEGER PRIMARY KEY AUTOINCREMENT,
            AdminID INTEGER,
            Description TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (AdminID) REFERENCES User (UserID)
          )`);

    db.run(`CREATE TABLE IF NOT EXISTS Device (
            DeviceID INTEGER PRIMARY KEY AUTOINCREMENT,
            UniqueDeviceID TEXT NOT NULL UNIQUE,
            OwnerID INTEGER,
            DeviceName TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            Room TEXT,
            FOREIGN KEY (OwnerID) REFERENCES User (UserID)
          )`);

    db.run(`CREATE TABLE IF NOT EXISTS GroupDevice (
            GroupID INTEGER ,
            DeviceID TEXT,
            PRIMARY KEY (GroupID, DeviceID),
            FOREIGN KEY (GroupID) REFERENCES UserGroup (GroupID),
            FOREIGN KEY (DeviceID) REFERENCES Device (DeviceID)
          )`);
  });

  return db;
};

module.exports = setupDatabase;
