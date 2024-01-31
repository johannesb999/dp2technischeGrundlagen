require("dotenv").config();
const mqtt = require("mqtt");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: `${process.env.OpenAIKey}` });
const clientId = `mqtt_${uuidv4()}`;
const fs = require("fs");

// MongoDB models
const Device = require("./Models/Device");
const Measurement = require("./Models/Measurement");
//----other MonoDB stuff----
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "Johannes-ist-der-Beste";

// const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URI}`;
const uri = process.env.MONGODB_URI;
const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// API STUFF
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const rawBodyParser = bodyParser.raw({ type: "image/jpeg", limit: "10mb" });
app.use(cors());
app.use(bodyParser.json());
const images = [];
let imagetest;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

async function savePictrue(imagee, macAdress, res) {
  const buffer = Buffer.from(imagee).toString("base64");
  const time = Date.now();
  try {
    await mongoClient.connect();
    const database = mongoClient.db("test"); // Ersetzen Sie 'IhrDatenbankName' mit dem Namen Ihrer Datenbank
    const images = database.collection("images");

    const result = await images.insertOne({
      data: buffer,
      contentType: "image/jpeg",
      device: macAdress,
      timestamp: time,
    });
    res.status(200).send("Bild gespiechert");
    console.log("Bild gespeichert");
  } catch (error) {
    // res.status(500).send("Fehler beim speichern des Bildes");
  } finally {
    await mongoClient.close();
  }
}

const macAdress = "30:AE:A4:14:5F:3C";

//----Endpunkt zum speichern der Bilder----
app.post("/api/addpicture", rawBodyParser, (req, res) => {
  if (req.body && req.body.length) {
    console.log(`Empfangene Bildgröße: ${req.body.length} Bytes`);
    res.send("Bild erfolgreich empfangen!");
    images.push(req.body);
    imagetest = req.body;
    console.log(req.body);

    savePictrue(req.body, macAdress, res);
  } else {
    res.status(400).send("Keine Daten empfangen.");
  }
});

//----Endpunkt um Bilder aus der Datenbank zu laden----
app.post("/api/getpicture", async (req, res) => {
  try {
    await mongoClient.connect();
    const database = mongoClient.db("test");
    const images = database.collection("images");
    console.log("Bild wird angefragt");

    const device = req.body.device;

    const deviceImages = await images
      .find({ device: device })
      .sort({ timestamp: -1 })
      .toArray();
    res.set("Content-Type", "image/jpeg");
    res.status(200).send(deviceImages);
  } catch (err) {
    res.status(500).send({ error: "Fehler beim Abrufen des Bildes" });
  }
});

//----Enpunkt für GPT Response (Bildanalyse)----
app.post("/api/getGPTresponse", async (req, res) => {
  try {
    const image = req.body.image;
    const result = await main(image);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send("Keine Daten empfangen.");
  }
});
async function main(image) {
  const prompt = `
  Analyze the following image response with a json. Do not provide any additional information.
  If you have any trouble in reading the image, use give back the example json with empty.
  The answer should be formated like this: 
  {
    "Plant": "Name of the plant",
    "Pests": "Name of the pests, if any",
    "Disease": "Name of the disease, if any",
    "Decay": "Yes or No",
    "Bends": "Yes or No",
    "Cracks": "Yes or No",
    "Recommendation": "Brief description of recommended measures to ensure plants future health"
  }
  `;
  if (!image) return;

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 300,
    temperature: 0,
  });

  return parseGPTResponse(response.choices[0].message.content);
}

function parseGPTResponse(responseString) {
  let cleanedString = responseString.replace(/```json\n|\n```/g, "");
  try {
    let jsonResponse = JSON.parse(cleanedString);
    return jsonResponse;
  } catch (error) {
    console.error("Fehler beim Parsen des JSON-Strings: ", error);
    return null; // oder geeignete Fehlerbehandlung
  }
}

//----Endpunkt zum Messwerte fetchen----
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

// MQTT STUFF
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, { clientId });

mqttClient.on("connect", function () {
  const logMessage = `Client ${clientId} verbunden.`;
  mqttClient.publish("dp2/logs", logMessage + "(Jo)");
  console.log(logMessage);

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
    const data = JSON.parse(message.toString());
    if (data.Value != null && data.mac != null && data.SensorType != null) {
      let device = await Device.findOne({ UniqueDeviceID: data.mac });
      if (!device) {
        device = new Device({
          UniqueDeviceID: data.mac,
          DeviceName: `Gerät ${data.mac}`,
          OwnerID: new mongoose.Types.ObjectId(), // Erzeugt eine neue, zufällige ObjectId
        });
        await device.save();
      }

      const measurement = new Measurement({
        DeviceID: device._id,
        SensorType: data.SensorType,
        Value: data.Value,
      });
      await measurement.save();
      // console.log(`Daten gespeichert: ${message.toString()}`);
    } else {
      console.log("Einer der Werte ist null, Datensatz wird ignoriert.");
    }
  }
});

//-------------------------- Data-Endpoints und dazugehörige funktionen ---------------------------

function validateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);

  if (!token) {
    return res.status(401).send("Kein Token vorhanden");
  }
  console.log(JWT_SECRET);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("kein ungültig");

      return res.status(403).send("Token ist ungültig");
    }
    console.log("User in validation:", user);
    req.user = user;
    next();
  });
}

async function getDevice(searchParam, searchId) {
  await mongoClient.connect();
  if (searchParam === "_id") {
    return mongoClient
      .db("test")
      .collection("devices")
      .findOne({ [searchParam]: new ObjectId(searchId) });
  } else {
    return mongoClient
      .db("test")
      .collection("devices")
      .find({ [searchParam]: searchId })
      .toArray();
  }
}

// Messdaten abrufen
async function getMeasurementsByDeviceId(deviceId) {
  await mongoClient.connect();
  const measurementsCollection = mongoClient
    .db("test")
    .collection("measurements");
  // Aggregation-Pipeline zum Gruppieren der Messwerte nach SensorType
  return measurementsCollection
    .aggregate([
      { $match: { DeviceID: new ObjectId(deviceId) } }, // Filtern nach DeviceID
      {
        $group: {
          _id: "$SensorType", // Gruppieren nach SensorType
          values: { $push: "$Value" }, // Sammeln aller Values in einem Array
        },
      },
    ])
    .toArray(); // Konvertieren des Cursors in ein Array
}

async function getmac(deviceId) {
  try {
    await mongoClient.connect();
    const collection = mongoClient.db("test").collection("devices");
    const device = await collection.findOne({ _id: new ObjectId(deviceId) });
    if (!device) {
      throw new Error("Gerät nicht gefunden");
    }
    return device.UniqueDeviceID;
  } catch (error) {
    console.error("Fehler beim Abrufen der UniqueDeviceID:", error);
    throw error;
  }
}

//----Endpunkt um die Geräte des Nutzers auf dem Homescreen anzuzeigen----
app.post("/get-devices", validateToken, async (req, res) => {
  const userDevices = await getDevice("userID", req.user.userID);
  res.status(200).json(userDevices);
});

//----Endpunkt um die macadress des Geräts zu holen (für Bild-fetchen)----
app.post("/get-mac-by-deviceID", validateToken, async (req, res) => {
  const result = await getmac(req.body.device);
  res.status(200).json(result);
});

//----Endpunkt um Gerät für die Einstellungen zu finden----
app.post("/device-setting", validateToken, async (req, res) => {
  const deviceID = req.body.deviceId;

  try {
    const selectedDevice = await getDevice("_id", deviceID);
    res.status(200).json(selectedDevice);
  } catch {
    res.status(500).send("Gerät nicht gefunden");
  }
});

//----Endpunkt um die gerätespezifischen Daten (Sensorwerte) zu fetchen----
app.post("/device-data", validateToken, async (req, res) => {
  const deviceID = req.body.deviceId;

  try {
    const measurements = await getMeasurementsByDeviceId(deviceID);
    const groupedMeasurements = measurements.reduce((acc, current) => {
      (acc[current._id] = acc[current._id] || []).push(...current.values);
      return acc;
    }, {});
    res.status(200).json(groupedMeasurements);
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten", error);
    res.status(500).send("Fehler beim Abrufen der Daten");
  }
});

//----Endpunkt zum updaten der Geräte-Einstellungen----
app.post("/update-device", validateToken, async (req, res) => {
  const { deviceId, newDeviceName, newLocation } = req.body;

  try {
    const result = await mongoClient
      .db("test")
      .collection("devices")
      .updateOne(
        { _id: new ObjectId(deviceId) },
        { $set: { DeviceName: newDeviceName, location: newLocation } }
      );
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .send("Gerät wurde nicht gefunden oder Daten sind unverändert");
    }
    res.status(200).send("Gerät erfolgreich aktualisiert");
  } catch (error) {
    console.error(
      "Fehler beim Aktualisieren des Geräts in der Datenbank",
      error
    );
    res.status(500).send("Interner Serverfehler");
  }
});

//----Endpunkt zum initialisieren des Geräts mit den Input-Informationen----
app.post("/initialize-device", validateToken, async (req, res) => {
  const { uniqueDeviceID, DeviceName, Location, plantspecies } = req.body;

  console.log(uniqueDeviceID);
  try {
    await mongoClient.connect();
    const result = await mongoClient
      .db("test")
      .collection("devices")
      .updateOne(
        { UniqueDeviceID: uniqueDeviceID },
        {
          $set: {
            DeviceName: DeviceName,
            location: Location,
            plantspecies: plantspecies,
          },
        }
      );
    res.status(200).send("Gerät erfolgreich aktualisiert");
  } catch (error) {
    console.error(
      "Fehler beim Aktualisieren des Geräts in der Datenbank",
      error
    );
    res.status(500).send("Interner Serverfehler");
  }
});

//----Holt die Idealen Werte für dei Pflanzen (Externe Datenbank(simuliert))----
app.post("/get-ideal-values", validateToken, async (req, res) => {
  try {
    const query = {
      $or: [{ commonName: req.body.plant }, { scientificName: req.body.plant }],
    };
    const result = await mongoClient
      .db("PlantDB")
      .collection("idealValues")
      .findOne(query);
    res.status(200).send(result);
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten", error);
    res.status(500).send("Fehler beim Abrufen der Daten");
  }
});

// Start the server
const port = process.env.SENSORSERVICE_PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
