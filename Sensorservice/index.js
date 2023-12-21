require("dotenv").config();
const mqtt = require("mqtt");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const OpenAI = require("openai");
const openai = new OpenAI();
const clientId = `mqtt_${uuidv4()}`;

// MongoDB models
const Device = require("./Models/Device");
const Measurement = require("./Models/Measurement");

//API STUFF
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
app.use(cors());
const rawBodyParser = bodyParser.raw({ type: "image/jpeg", limit: "10mb" });
const images = [];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

//api endpoints
app.post("/api/addpicture", rawBodyParser, (req, res) => {
  if (req.body && req.body.length) {
    console.log(`Empfangene Bildgröße: ${req.body.length} Bytes`);
    res.send("Bild erfolgreich empfangen!");
    images.push(req.body);
    // save the image into an file
    console.log(req.body);
    main(req.body);
  } else {
    res.status(400).send("Keine Daten empfangen.");
  }
});

app.get("/api/getpicture", (req, res) => {
  // response as imaga/jpeg
  res.set("Content-Type", "image/jpeg");
  res.send(images[images.length - 1]);
  console.log("Bild wird angefragt");
});

app.get("/api/measurements", async (req, res) => {
  try {
    const measurements = await Measurement.find()
      .sort({ timestamp: -1 })
      .limit(20);
    if (measurements.length === 0) {
      res.status(404).send({ error: "Keine Daten gefunden" });
    } else {
      res.status(200).json(measurements);
    }
  } catch (err) {
    res.status(500).send({ error: "Fehler beim Abrufen der Daten" });
  }
});

//API STUFF ENDE

async function main(image) {
  // convert from uint8 Array butter to base64
  if (!image) return;
  const base64_image = Buffer.from(image).toString("base64");
  // updateImage(`data:image/jpeg;base64,${base64Image}`);

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: 'Tell me the name of the plant you see. Check if the plant do have pests, rot, bends or cracks. If something is detected, also output the disease and suggest in three sentences what can be done about it. response as json in this format: {"plant": "plantname", "pests": "","Disease": "", "Rot": "", "Kinks": "","Cracks": "", "Suggestion": ""} . Answer in string should be yes or no. If you cant detect the plant just use Aphelandra squarrosa (zebra plant) as default and check for diseases',
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
  if (!image) return;
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

mqttClient.on("message", async (topic, message) => {
  if (topic === process.env.MQTT_TOPIC_VALUES) {
    // Verarbeiten der MQTT-Nachricht mit Mongoose
    const data = JSON.parse(message.toString());
    if (data.Value != null && data.mac != null && data.SensorType != null) {
      let device = await Device.findOne({ UniqueDeviceID: data.mac });
      if (!device) {
        device = new Device({
          UniqueDeviceID: data.mac,
          DeviceName: `Gerät ${data.mac}`,
          OwnerID: "1",
        });
        await device.save();
      }

      const measurement = new Measurement({
        DeviceID: device._id,
        SensorType: data.SensorType,
        Value: data.Value,
      });
      await measurement.save();
      console.log(`Daten gespeichert: ${message.toString()}`);
    } else {
      console.log("Einer der Werte ist null, Datensatz wird ignoriert.");
    }
  }
});

// Start the server
const port = process.env.SENSORSERVICE_PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
