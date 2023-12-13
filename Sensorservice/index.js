require("dotenv").config();
const mqtt = require("mqtt");
const setupDatabase = require("./create_tables");
// const db = setupDatabase();
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const clientId = `mqtt_${uuidv4()}`;
const OpenAI = require("openai");
const openai = new OpenAI();
//API STUFF
const express = require("express");
const app = express();
app.use(express.json());
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const bodyParser = require("body-parser");

const rawBodyParser = bodyParser.raw({ type: "image/jpeg", limit: "10mb" });
const images = [];

let db;
async function startDb() {
  try {
    db = await open({
      filename: `./${process.env.DATABASE_FILENAME}.db`,
      driver: sqlite3.Database,
    });

    console.log("Verbunden mit der SQLite-Datenbank.");
    setupDatabase(db);
    startAPI();
  } catch (err) {
    console.error("Fehler beim Verbinden mit der Datenbank:", err);
  }
}
async function startAPI() {
  // Start the server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  app.get("/", (req, res) => {
    res.send("Hello, world!");
  });

  app.post("/api/addpicture", rawBodyParser, (req, res) => {
    if (req.body && req.body.length) {
      // console.log(`Empfangene Bildgröße: ${req.body.length} Bytes`);
      console;
      res.send("Bild erfolgreich empfangen!");
      images.push(req.body);
      // save the image into an file
      // console.log(req.body);
      main(req.body);
    } else {
      res.status(400).send("Keine Daten empfangen.");
    }
  });

  app.get("/api/getpicture", (req, res) => {
    // response as imaga/jpeg
    res.set("Content-Type", "image/jpeg");
    res.send(images[images.length - 1]);
  });

  // ...

  app.get("/api/measurements", async (req, res) => {
    console.log("Endpunkt 'measurments' aufgerufen");
    try {
      const rows = await db.all(
        "SELECT * FROM Measurements ORDER BY timestamp DESC LIMIT 20"
      );
      if (rows.length === 0) {
        console.log("Keine Daten gefunden");
        res.status(404).send({ error: "Keine Daten gefunden" });
      } else {
        console.log("Daten gefunden:", rows);
        res.status(200).json(rows);
      }
    } catch (err) {
      console.error("Fehler beim Abrufen der Daten:", err);
      res.status(500).send({ error: "Fehler beim Abrufen der Daten" });
    }
  });
  console.log("Johannes ist ein Hund");
  startMqtt();
}

// ...
//API STUFF ENDE

async function main(image) {
  // convert from uint8 Array butter to base64
  if (!image) return;
  const base64_image = Buffer.from(image).toString("base64");

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: 'identify the plant as good as you can. response as json in this format: {"plant": "plantname"} if its is not possible to identify the plant, please respond with json: {"plant": "unknown"}',
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64_image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  });
  console.log(response.choices[0]);
}

// Funktion zum Lesen der Umgebungsvariablen aus .env
const readEnvVariables = () => {
  try {
    const data = fs.readFileSync(".env.example", "utf8");
    return data
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.startsWith("#"))
      .map((line) => line.split("=")[0]);
  } catch (err) {
    console.error(`Fehler beim Lesen der .env-Datei: ${err}`);
    return [];
  }
};

// Extrahieren der Umgebungsvariablen
const requiredEnvVariables = readEnvVariables();

// Überprüfen, ob alle erforderlichen Umgebungsvariablen definiert sind
for (const varName of requiredEnvVariables) {
  if (!process.env[varName]) {
    console.log(`Fehler: Umgebungsvariable ${varName} nicht definiert.`);
    process.exit(1); // Beendet das Skript mit einem Fehlercode
  }
}

// Überprüfen, ob das MQTT_TOPIC_VALUES definiert und nicht leer ist
if (!process.env.MQTT_TOPIC_VALUES) {
  console.error("Fehler: MQTT_TOPIC_VALUES ist nicht definiert.");
  process.exit(1);
}

// Überprüfen, ob die Datenbanktabellen existieren
const checkAndInsertDevice = (macAddress) => {
  return new Promise((resolve, reject) => {
    console.log("Jannik ist ein Hund");
    db.get(
      "SELECT UniqueDeviceID FROM Device WHERE UniqueDeviceID = ?",
      [macAddress],
      (err, row) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }
        if (!row) {
          db.run(
            "INSERT INTO Device (UniqueDeviceID, DeviceName) VALUES (?, ?)",
            [macAddress, `Gerät ${macAddress}`],
            (insertErr) => {
              if (insertErr) {
                console.log("Error beim Insert");
                reject(insertErr);
                return;
              }
              console.log("erstes resolve(Zeile erstellt)");
              resolve();
            }
          );
        } else {
          console.log("Zeile existiert schon");
          resolve();
        }
      }
    );
  });
};

// MQTT STUFF:
async function startMqtt() {
  console.log("Johannes ist eine");
  const mqttClient = await mqtt.connect(process.env.MQTT_BROKER_URL, {
    clientId,
  });

  mqttClient.on("connect", function () {
    // Loggen der Client-ID im Topic "dp2/logs"
    const logMessage = `Client ${clientId} verbunden.`;
    mqttClient.publish("dp2/logs", logMessage + "(Jo)");
    // console.log(logMessage);

    // Subscribe auf Topics
    mqttClient.subscribe(process.env.MQTT_TOPIC_VALUES, function (err) {
      if (!err) {
        // console.log(
        `Erfolgreich auf Topic "${process.env.MQTT_TOPIC_VALUES}" subscribed`;
        // );
      }
    });
  });

  mqttClient.on("message", async (topic, message) => {
    if (topic === process.env.MQTT_TOPIC_VALUES) {
      try {
        const data = JSON.parse(message.toString());
        // console.log(data);

        if (data.Value != null && data.mac != null && data.SensorType != null) {
          try {
            await checkAndInsertDevice(data.mac);
            console.log("Fabi ist ein Hund");
            // Finden Sie die DeviceID, die der MAC-Adresse entspricht
            const row = await new Promise((resolve, reject) => {
              db.get(
                "SELECT DeviceID FROM Device WHERE UniqueDeviceID = ?",
                [data.mac],
                (err, row) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(row);
                  }
                }
              );
            });

            if (row) {
              const stmt = db.prepare(
                "INSERT INTO Measurements (DeviceID, SensorType, Value) VALUES (?, ?, ?)"
              );
              stmt.run(row.DeviceID, data.SensorType, data.Value);
              stmt.finalize();
              console.log(`Daten gespeichert`);
              // console.log(`Daten gespeichert: ${message.toString()}`);
            }
          } catch (error) {
            console.error(`Fehler bei der Datenverarbeitung: ${error}`);
          }
        } else {
          console.log("Einer der Werte ist null, Datensatz wird ignoriert.");
        }
      } catch (e) {
        console.error(`Fehler beim Parsen der Nachricht: ${e}`);
      }
    }
  });
}

startDb();
