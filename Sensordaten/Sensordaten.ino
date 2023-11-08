#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <WiFiManager.h>
#include "config.h"       // Dies bindet Ihre Konfigurationsdatei ein
#include <ArduinoJson.h>  // Fügen Sie diese Bibliothek hinzu



// DHT Sensor Einstellungen
#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Initialisieren Sie den MQTT-Client
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFiManager wifiManager;
  // Verbinden oder Start eines eigenen Access Points falls nicht konfiguriert
  if (!wifiManager.autoConnect("AutoConnectAP")) {
    Serial.println("Fehler beim Verbinden und Timeout erreicht");
    ESP.restart();  // Neustart des ESP
  }

  // Wenn die Verbindung hergestellt ist, drucken Sie die IP-Adresse
  Serial.println("Verbunden mit WiFi");
  Serial.println("IP-Adresse: ");
  Serial.println(WiFi.localIP());

  // Verbinden Sie sich mit dem MQTT Broker
  if (mqtt_port == 1883) {
    client.setServer(mqtt_server, 1883);
  } else {
    client.setServer(mqtt_server, mqtt_port);
  }
  Serial.println(mqtt_port);
  // client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // Serial prints hinzugefügt, um Daten zu sehen
  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print("%  Temperature: ");
  Serial.print(t);
  Serial.println("°C ");
  String clientId = "ESP-Johannes" + WiFi.macAddress();

  // Erstellt ein JSON-Dokument für die Temperatur
  StaticJsonDocument<200> tempDoc;
  tempDoc["clientId"] = clientId;
  tempDoc["temperature"] = t;
  char tempJsonMessage[200];
  serializeJson(tempDoc, tempJsonMessage);
  client.publish(temperature_topic, tempJsonMessage);

  // Erstellt ein separates JSON-Dokument für die Luftfeuchtigkeit
  StaticJsonDocument<200> humDoc;
  humDoc["clientId"] = clientId;
  humDoc["humidity"] = h;
  char humJsonMessage[200];
  serializeJson(humDoc, humJsonMessage);
  client.publish(humidity_topic, humJsonMessage);

  delay(5000);
}


void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Generate a random client ID
    String clientId = "ESP-Joe" + WiFi.macAddress();
    // clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");

    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
