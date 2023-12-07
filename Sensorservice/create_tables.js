const sqlite3 = require("sqlite3").verbose();

const setupDatabase = () => {
  let db = new sqlite3.Database(`./${process.env.databaseName}.db`, (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  db.serialize(() => {
    // Neue Tabellen für Rollen, Status und GruppeNutzer
    db.run(`CREATE TABLE IF NOT EXISTS Role (
        RoleID INTEGER PRIMARY KEY AUTOINCREMENT,
        RoleName TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS UserStatus (
        StatusID INTEGER PRIMARY KEY AUTOINCREMENT,
        StatusName TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS GroupUser (
        UserID INTEGER,
        GroupID INTEGER,
        Admin BOOLEAN DEFAULT FALSE,
        Description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (UserID, GroupID),
        FOREIGN KEY (UserID) REFERENCES User (UserID),
        FOREIGN KEY (GroupID) REFERENCES UserGroup (GroupID)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS User (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT,
            Email TEXT UNIQUE,
            Password TEXT,
            RoleID INTEGER,
            StatusID INTEGER,
            Deleted BOOLEAN DEFAULT FALSE,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            modifiedAt DATETIME,
            FOREIGN KEY (RoleID) REFERENCES UserRole (RoleID),
            FOREIGN KEY (StatusID) REFERENCES UserStatus (StatusID)
          )`);

    db.run(`CREATE TABLE IF NOT EXISTS UserGroup (
            GroupID INTEGER PRIMARY KEY AUTOINCREMENT,
            AdminID INTEGER,
            Description TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            modifiedAt DATETIME,
            FOREIGN KEY (AdminID) REFERENCES User (UserID)
          )`);

    db.run(`CREATE TABLE IF NOT EXISTS Device (
            DeviceID INTEGER PRIMARY KEY AUTOINCREMENT,
            UniqueDeviceID TEXT NOT NULL UNIQUE,
            OwnerID INTEGER,
            DeviceName TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            modifiedAt DATETIME,
            Room TEXT,
            FirmwareVersion TEXT,
            ModelVersion TEXT,
            FOREIGN KEY (OwnerID) REFERENCES User (UserID)
          )`);

    db.run(`CREATE TABLE IF NOT EXISTS GroupDevice (
            GroupID INTEGER,
            DeviceID INTEGER,
            modifiedAt DATETIME,
            PRIMARY KEY (GroupID, DeviceID),
            FOREIGN KEY (GroupID) REFERENCES UserGroup (GroupID),
            FOREIGN KEY (DeviceID) REFERENCES Device (DeviceID)
          )`);

    db.run(`CREATE TABLE IF NOT EXISTS Measurements (
        MeasurementID TEXT PRIMARY KEY,
        DeviceID INTEGER,
        Value REAL,
        SensorType TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (DeviceID) REFERENCES Device (DeviceID)
      )`);
  });

  return db;
};

module.exports = setupDatabase;
