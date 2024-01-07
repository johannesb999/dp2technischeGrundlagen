require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const { mongo } = require("mongoose");
const bcrypt = require("bcryptjs");
const app = express();
app.use(express.json());
app.use(cors());
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "Johannes-ist-der-Beste";
const axios = require("axios");

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
async function getDevice(searchParam, searchId) {
  // console.log(searchParam); // Sollte "_id" ausgeben
  await mongoClient.connect();
  if (searchParam === "_id") {
    return mongoClient
    .db("test")
    .collection("devices")
    .findOne({[searchParam]: new ObjectId(searchId)});
  } else {
    return mongoClient
    .db("test")
    .collection("devices")
    .find({[searchParam]: searchId})
    .toArray();
  }
}

async function getUserData(userID) {
  await mongoClient.connect();
  console.log(userID);
  return mongoClient.db("test").collection("users").findOne( new ObjectId(userID));
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

function validateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send('Kein Token vorhanden');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send('Token ist ungültig');
    }
    req.user = user; // Fügen Sie die Benutzerinformationen zur Anfrage hinzu
    next(); // Fahren Sie mit der nächsten Middleware oder Route fort
  });
}
// ---------------------------------Endpunkte---------------------------------


app.post("/get-devices", validateToken, async (req, res) => {
  const userDevices = await getDevice("userID", req.user.userID);
  res.status(200).json(userDevices);
});

app.post("/device-setting", validateToken, async (req, res) =>{

  const deviceID = req.body.deviceId;
  console.log("device-setting:", deviceID);

    try {
      const selectedDevice = await getDevice("_id", deviceID);
      console.log("selectedDevice:", selectedDevice);
      res.status(200).json(selectedDevice);
    } catch{
      res.status(500).send("Gerät nicht gefunden")
    }
});






app.post("/connect-device", validateToken, async (req, res) => {
  const devices = await connectToDevices();
  console.log("Mit Datenbank verbunden");

  const uniqueDeviceID = req.body.uniqueDeviceID;

  const userID = req.user.userID;

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


app.post("/device-data", validateToken, async (req, res) => {

  const deviceID = req.body.deviceId;
  
  try {
    const measurements = await getMeasurementsByDeviceId(deviceID);
    const groupedMeasurements = measurements.reduce((acc, current) => {
        (acc[current._id] = acc[current._id] || []).push(...current.values);
        return acc;
      }, {});
      // console.log(groupedMeasurements);
      res.status(200).json(groupedMeasurements);
    // return res.status(200).send(validationResponse.data.user.userID);
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten", error);
    // res.status(500).send('Fehler beim Abrufen der Daten
  }
});


app.post('/get-token', validateToken, async (req,res) => {
  let bool = false;
  try {
    const userData = await getUserData(req.user.userID);
    console.log("UserData:",userData);
    bool = true;
    res.status(200).json({ bool: bool, data: userData});
  } catch{
    res.status(500).send("Kein Token vorhanden");
  }
})


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

  const user = await users.findOne({ email: userData.email });
  console.log(user);
  const username = user.username;
  console.log(username);

  const passworIsValid = await bcrypt.compare(userData.password, user.password);

  if (!passworIsValid) {
    return res.status(401).send("Passwort ist falsch");
  }

  console.log(user._id)

  const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.status(200).json({ token, username });
});

// Endpunkt für Logout
app.post("/logout", (req, res) => {
  res.status(200).send("Erfolgreich abgemeldet");
});







app.post('/update-device',validateToken, async (req, res) => {
  const { deviceId, newDeviceName, newLocation } = req.body;

  try {
      const result = await mongoClient.db("test").collection("devices").updateOne(
          { _id: new ObjectId(deviceId) },
          { $set: { DeviceName: newDeviceName, location: newLocation } }
      );
      if (result.modifiedCount === 0) {
          return res.status(404).send('Gerät wurde nicht gefunden oder Daten sind unverändert');
      }
      res.status(200).send('Gerät erfolgreich aktualisiert');
  } catch (error) {
      console.error("Fehler beim Aktualisieren des Geräts in der Datenbank", error);
      res.status(500).send('Interner Serverfehler');
  }
});

app.post('/update-user', validateToken, async (req, res) => {
  const searchemail = req.body.emailChache;
  const email = req.body.email;
  const username = req.body.username;
  console.log(searchemail);

  try {
      const result = await mongoClient.db("test").collection("users").updateOne(
          { email: searchemail },
          { $set: { username: username, email: email } }
      );
      if (result.modifiedCount === 0) {
          return res.status(404).send('Gerät wurde nicht gefunden oder Daten sind unverändert');
      }
      res.status(200).send('Gerät erfolgreich aktualisiert');
  } catch (error) {
      console.error("Fehler beim Aktualisieren des Geräts in der Datenbank", error);
      res.status(500).send('Interner Serverfehler');
  }
});




app.post('/initialize-device',validateToken, async (req, res) => {
  const { uniqueDeviceID, DeviceName, Location } = req.body;

  try {
    console.log("hes treying")
      const result = await mongoClient.db("test").collection("devices").updateOne(
          { UniqueDeviceID: uniqueDeviceID },
          { $set: { DeviceName: DeviceName, location: Location } }
      );
      if (result.modifiedCount === 0) {
          return res.status(404).send('Gerät wurde nicht gefunden oder Daten sind unverändert');
      }
      res.status(200).send('Gerät erfolgreich aktualisiert');
  } catch (error) {
      console.error("Fehler beim Aktualisieren des Geräts in der Datenbank", error);
      res.status(500).send('Interner Serverfehler');
  }
});












const PORT = process.env.USERSERVICE_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
