#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <WiFiManager.h>
#include "config.h" // Dies bindet Ihre Konfigurationsdatei ein

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
    ESP.restart(); // Neustart des ESP
  }

  // Wenn die Verbindung hergestellt ist, drucken Sie die IP-Adresse
  Serial.println("Verbunden mit WiFi");
  Serial.println("IP-Adresse: ");
  Serial.println(WiFi.localIP());

  // Verbinden Sie sich mit dem MQTT Broker
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Lesen der Sensorwerte
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // Überprüfung, ob der Sensor gültige Daten gelesen hat
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

  // Senden der Sensorwerte an den MQTT Broker
  if (!isnan(h) && !isnan(t)) {
  // Convert the readings to strings
  char humidity_payload[10];
  char temperature_payload[10];
  dtostrf(h, 1, 2, humidity_payload);
  dtostrf(t, 1, 2, temperature_payload);

  // Publish the readings to the MQTT broker
  client.publish(humidity_topic, humidity_payload);
  client.publish(temperature_topic, temperature_payload);
}

  delay(2000);  // 2 Sekunden Pause
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
