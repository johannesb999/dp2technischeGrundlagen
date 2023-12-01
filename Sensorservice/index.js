require("dotenv").config();
const mqtt = require("mqtt");
const setupDatabase = require("./create_tables");
const db = setupDatabase();
const { v4: uuidv4 } = require("uuid");
const clientId = `mqtt_${uuidv4()}`;

const requiredEnvVariables = [
  "MQTT_BROKER_URL",
  "MQTT_TOPIC_VALUES",
  // Fügen Sie hier weitere erforderliche Umgebungsvariablen hinzu
];

// Überprüfen, ob alle erforderlichen Umgebungsvariablen definiert sind
for (const varName of requiredEnvVariables) {
  if (!process.env[varName]) {
    console.log(`Fehler: Umgebungsvariable ${varName} nicht definiert.`);
    process.exit(1); // Beendet das Skript mit einem Fehlercode
  }
}

// Überprüfen, ob die Datenbanktabellen existieren
const checkAndInsertDevice = (macAddress) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT GeraeteID FROM Geraet WHERE GeraeteID = ?",
      [macAddress],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        if (!row) {
          db.run(
            "INSERT INTO Geraet (GeraeteID, GeraeteName) VALUES (?, ?)",
            [macAddress, `Gerät ${macAddress}`],
            (insertErr) => {
              if (insertErr) {
                reject(insertErr);
                return;
              }
              resolve();
            }
          );
        } else {
          resolve();
        }
      }
    );
  });
};

// MQTT STUFF:

const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, { clientId });

mqttClient.on("connect", function () {
  // Loggen der Client-ID im Topic "dp2/logs"
  const logMessage = `Client ${clientId} verbunden.`;
  mqttClient.publish("dp2/logs", logMessage + "(Jo)");
  console.log(logMessage);

  // Subscribe auf Topics
  mqttClient.subscribe(process.env.MQTT_TOPIC_VALUES, function (err) {
    if (!err) {
      console.log(
        `Erfolgreich auf Topic "${process.env.MQTT_TOPIC_VALUES}" subscribed`
      );
    }
  });
});

mqttClient.on("message", (topic, message) => {
  if (topic === process.env.MQTT_TOPIC_VALUES) {
    try {
      const data = JSON.parse(message.toString());
      console.log(data);

      if (data.Wert != null && data.mac != null && data.SensorTyp != null) {
        checkAndInsertDevice(data.mac)
          .then(() => {
            // Finden Sie die DeviceID, die der MAC-Adresse entspricht
            db.get(
              "SELECT DeviceID FROM Geraet WHERE GeraeteID = ?",
              [data.mac],
              (err, row) => {
                if (err) {
                  console.error(err.message);
                  return;
                }
                if (row) {
                  const stmt = db.prepare(
                    "INSERT INTO Messungen (DeviceID, SensorTyp, Wert) VALUES (?, ?, ?)"
                  );
                  stmt.run(row.DeviceID, data.SensorTyp, data.Wert);
                  stmt.finalize();
                  console.log(`Daten gespeichert: ${message.toString()}`);
                }
              }
            );
          })
          .catch((error) => {
            console.error(`Fehler bei der Geräteregistrierung: ${error}`);
          });
      } else {
        console.log("Einer der Werte ist null, Datensatz wird ignoriert.");
      }
    } catch (e) {
      console.error(`Fehler beim Parsen der Nachricht: ${e}`);
    }
  }
});
