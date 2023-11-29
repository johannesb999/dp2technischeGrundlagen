require("dotenv").config();
const mqtt = require("mqtt");
const setupDatabase = require("./create_tables");
const db = setupDatabase();
const { v4: uuidv4 } = require("uuid");
const clientId = `mqtt_${uuidv4()}`;

const requiredEnvVariables = [
  "MQTT_BROKER_URL",
  "MQTT_TOPIC_TEMPERATUR",
  "MQTT_TOPIC_FEUCHTIGKEIT",
  "MQTT_TOPIC_SOILMOISTURE",
  "MQTT_TOPIC_LICHT",
  // Fügen Sie hier weitere erforderliche Umgebungsvariablen hinzu
];

// Überprüfen, ob alle erforderlichen Umgebungsvariablen definiert sind
for (const varName of requiredEnvVariables) {
  if (!process.env[varName]) {
    console.log(`Fehler: Umgebungsvariable ${varName} nicht definiert.`);
    process.exit(1); // Beendet das Skript mit einem Fehlercode
  }
}

// MQTT STUFF:

const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, { clientId });

mqttClient.on("connect", function () {
  // Loggen der Client-ID im Topic "dp2/logs"
  const logMessage = `Client ${clientId} verbunden.`;
  mqttClient.publish("dp2/logs", logMessage + "(Jo)");
  console.log(logMessage);

  // Subscribe auf Topics
  mqttClient.subscribe("dp2/temperature", function (err) {
    if (!err) {
      console.log('Erfolgreich auf Thema "dp2/temperature" subscribed');
    }
  });
  mqttClient.subscribe("dp2/humidity", function (err) {
    if (!err) {
      console.log('Erfolgreich auf Thema "dp2/humidity" subscribed');
    }
  });
  mqttClient.subscribe("dp2/soilMoisture", function (err) {
    if (!err) {
      console.log('Erfolgreich auf Thema "dp2/soilMoisture" subscribed');
    }
  });
  mqttClient.subscribe("dp2/light", function (err) {
    if (!err) {
      console.log('Erfolgreich auf Thema "dp2/light" subscribed');
    }
  });
});

mqttClient.on("message", (topic, message) => {
  if (topic === process.env.MQTT_TOPIC_TEMPERATUR) {
    try {
      const data = JSON.parse(message.toString());
      console.log(data);

      if (data.temperature != null && data.mac != null) {
        const stmt = db.prepare(
          "INSERT INTO temperature_data (temperature, mac) VALUES (?, ?)"
        );
        stmt.run(data.temperature, data.mac);
        stmt.finalize();
        console.log(`Daten gespeichert: ${message.toString()}`);
      } else {
        console.log("NULL-Werte erkannt, Datensatz wird ignoriert.");
      }
    } catch (e) {
      console.error(`Fehler beim Parsen der Nachricht: ${e}`);
    }
  }

  if (topic === process.env.MQTT_TOPIC_FEUCHTIGKEIT) {
    try {
      const data = JSON.parse(message.toString());
      console.log(data);

      if (data.humidity != null && data.mac != null) {
        const stmt = db.prepare(
          "INSERT INTO humidity_data (humidity, mac) VALUES (?, ?)"
        );
        stmt.run(data.humidity, data.mac);
        stmt.finalize();
        console.log(`Daten gespeichert: ${message.toString()}`);
      } else {
        console.log("NULL-Werte erkannt, Datensatz wird ignoriert.");
      }
    } catch (e) {
      console.error(`Fehler beim Parsen der Nachricht: ${e}`);
    }
  }

  if (topic === process.env.MQTT_TOPIC_SOILMOISTURE) {
    try {
      const data = JSON.parse(message.toString());
      console.log(data);

      if (data.soilMoisture != null && data.mac != null) {
        const stmt = db.prepare(
          "INSERT INTO soilMoisture_data (soilMoisture, mac) VALUES (?, ?)"
        );
        stmt.run(data.soilMoisture, data.mac);
        stmt.finalize();
        console.log(`Daten gespeichert: ${message.toString()}`);
      } else {
        console.log("NULL-Werte erkannt, Datensatz wird ignoriert.");
      }
    } catch (e) {
      console.error(`Fehler beim Parsen der Nachricht: ${e}`);
    }
  }
  if (topic === process.env.MQTT_TOPIC_LICHT) {
    try {
      const data = JSON.parse(message.toString());
      console.log(data);

      if (data.light != null && data.mac != null) {
        const stmt = db.prepare(
          "INSERT INTO light_data (light, mac) VALUES (?, ?)"
        );
        stmt.run(data.light, data.mac);
        stmt.finalize();
        console.log(`Daten gespeichert: ${message.toString()}`);
      } else {
        console.log("NULL-Werte erkannt, Datensatz wird ignoriert.");
      }
    } catch (e) {
      console.error(`Fehler beim Parsen der Nachricht: ${e}`);
    }
  }
});
