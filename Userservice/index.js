require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const { mongo } = require("mongoose");
const bcrypt = require("bcryptjs");
const app = express();
app.use(express.json());
app.use(cors());
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "Johannes-ist-der-Beste";

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URI}`;
const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// -------------------------------DataBase connections-------------------------------
// Verbinden mit der Datenbank
async function connectToDatabase() {
  await mongoClient.connect();
  return mongoClient.db("test").collection("users");
}
async function connectToDevices() {
  await mongoClient.connect();
  return mongoClient.db("test").collection("devices");
}
// Geräteverbindung abrufen
async function getDeviceByUserId(userId) {
  await mongoClient.connect();
  return mongoClient
    .db("test")
    .collection("devices")
    .findOne({ userID: userId });
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
      { $match: { DeviceID: deviceId } }, // Filtern nach DeviceID
      {
        $group: {
          _id: "$SensorType", // Gruppieren nach SensorType
          values: { $push: "$Value" }, // Sammeln aller Values in einem Array
        },
      },
    ])
    .toArray(); // Konvertieren des Cursors in ein Array
}

// ---------------------------------Endpunkte---------------------------------
app.post("/connect-device", async (req, res) => {
  const devices = await connectToDevices();
  console.log("Mit Datenbank verbunden");

  const userID = req.body.userID;
  const uniqueDeviceID = req.body.uniqueDeviceID;

  console.log(
    `Empfangene Daten: userID=${userID}, uniqueDeviceID=${typeof uniqueDeviceID}`
  ); // Überprüfen der empfangenen Daten
  const selectedDevice = await devices.findOne({
    UniqueDeviceID: uniqueDeviceID,
  });
  console.log(selectedDevice);

  if (selectedDevice) {
    await devices.updateOne(
      { UniqueDeviceID: uniqueDeviceID },
      { $set: { userID } }
    );
    res.status(200).send("Gerät erfolgreich verbunden");
    console.log(
      `Gerät ${uniqueDeviceID} wurde erfolgreich mit ${userID} verbunden`
    );
  } else {
    res.status(404).send("Gerät nicht gefunden");
  }
});

app.post("/device-data", async (req, res) => {
  const userId = req.body.queryUserID;
  // console.log(userId);
  const devices = await getDeviceByUserId(userId);
  if (!devices) {
    return res.status(404).send("Gerät nicht gefunden.");
  }
  // console.log(devices._id);

  // try {
  //   const device = await getDeviceByUserId(userId);

  const measurements = await getMeasurementsByDeviceId(devices._id);
  // console.log(typeof measurements);

  //   // Gruppieren der Messwerte in der Antwort
  const groupedMeasurements = measurements.reduce((acc, current) => {
    (acc[current._id] = acc[current._id] || []).push(...current.values);
    return acc;
  }, {});
  console.log(groupedMeasurements);
  res.status(200).json(groupedMeasurements);
  // } catch (error) {
  //   console.error("Fehler beim Abrufen der Gerätedaten:", error);
  //   res.status(500).send("Interner Serverfehler.");
  // }
});

// Endpunkt für die Registrierung
app.post("/register", async (req, res) => {
  const users = await connectToDatabase();

  const userData = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    createdAt: req.body.createdAt,
    deleted: req.body.deleted,
  };
  console.log(userData);

  const existingUser = await users.findOne({ email: userData.email });
  if (existingUser) {
    console.log(`Benutzer mit der Email ${userData.email} existiert bereits`);
    return res.status(400).send("Benutzer existiert bereits");
  }
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  userData.password = hashedPassword;
  await users.insertOne(userData);
  res.status(201).send("Benutzer erfolgreich registriert");
  console.log(`Benutzer ${userData.email} wurde registriert`);
});

// Endpunkt für Login
app.post("/login", async (req, res) => {
  const users = await connectToDatabase();
  // console.log(users);
  const userData = {
    email: req.body.email,
    password: req.body.password,
  };
  // const { email, password } = req.body;
  // console.log(email,password);

  const user = await users.findOne({ email: userData.email });

  const passworIsValid = await bcrypt.compare(userData.password, user.password);

  if (!passworIsValid) {
    return res.status(401).send("Passwort ist falsch");
  }

  const token = jwt.sign({ email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });

  // console.log(token);

  res.status(200).json({ token });
});

// Endpunkt für Logout
app.post("/logout", (req, res) => {
  res.status(200).send("Erfolgreich abgemeldet");
});

const PORT = process.env.USERSERVICE_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
