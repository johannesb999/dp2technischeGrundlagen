require("dotenv").config();
const mqtt = require("mqtt");
const setupDatabase = require("./create_tables");
const db = setupDatabase();
const { v4: uuidv4 } = require("uuid");
const clientId = `mqtt_${uuidv4()}`;

const requiredEnvVariables = [
  "MQTT_BROKER_URL",
  "MQTT_TOPIC_VALUES",
  // "MQTT_TOPIC_LOGS",
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
        const stmt = db.prepare(
          "INSERT INTO Messungen (SensorTyp, Wert, mac) VALUES (?, ?, ?)"
        );
        stmt.run(data.SensorTyp, data.Wert, data.mac);
        stmt.finalize();
        console.log(`Daten gespeichert: ${message.toString()}`);
      } else {
        console.log("Einer der Werte ist null, Datensatz wird ignoriert.");
      }
    } catch (e) {
      console.error(`Fehler beim Parsen der Nachricht: ${e}`);
    }
  }
});
