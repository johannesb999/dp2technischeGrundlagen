const mqtt = require("mqtt");

const client = mqtt.connect("mqtt://mqtt.hfg.design");

const topics = ["topic/temperature ", "topic/humidity "];

client.on("connect", () => {
  console.log("Verbunden mit dem MQTT-Broker");

  client.subscribe(topics, (err) => {
    if (!err) {
      console.log("Abonniert: ", topics.join(", "));
    } else {
      console.error("Fehler beim Abonnieren der Topics:", err);
    }
  });
});

client.on("message", (topic, message) => {
  console.log(`Nachricht erhalten unter ${topic}: ${message.toString()}`);
});
