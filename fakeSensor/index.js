require("dotenv").config();
const mqtt = require("mqtt");
const { v4: uuidv4 } = require("uuid");

const mqttBrokerUrl = process.env.MQTT_BROKER_URL;
const topic = process.env.MQTT_TOPIC;
const logsTopic = process.env.MQTT_LOGS_TOPIC;
const interval = parseInt(process.env.INTERVAL);

const clientId = `mqttClient_${uuidv4()}`;
const client = mqtt.connect(mqttBrokerUrl, { clientId });

const availableMacAddresses = [
  "60:BB:A4:14:5F:3C",
  "20:BB:A4:14:5F:3C",
  "30:AE:A4:1B:62:18",
];
const sensorTypes = ["Humidity", "Temperature", "SoilMoisture", "LDR"];

client.on("connect", () => {
  console.log(`Connected to MQTT Broker with Client ID: ${clientId}`);
  client.publish(logsTopic, `Fake Sensor with Client ID ${clientId} connected`);

  setInterval(() => {
    availableMacAddresses.forEach((mac) => {
      sensorTypes.forEach((sensorType) => {
        const message = JSON.stringify({
          mac: mac,
          SensorType: sensorType,
          Value: generateRandomValue(),
        });
        client.publish(topic, message);
        console.log(`Message published to ${topic}: ${message}`);
      });
    });
  }, interval);
});

client.on("error", (error) => {
  console.error(`Connection error: ${error}`);
  client.end();
});

function generateRandomValue() {
  return Math.floor(Math.random() * 100);
}

process.on("SIGINT", () => {
  console.log("Disconnecting...");
  client.end();
  process.exit();
});
