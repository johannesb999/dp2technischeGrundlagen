#include <PubSubClient.h>
#include <DHT.h>
#include "config.h"  // Dies bindet Ihre Konfigurationsdatei ein
#include <ArduinoJson.h>
#include <WiFiManager.h>
#include <WiFi.h>
#include <ESPmDNS.h>
#include <WiFiUdp.h>
#include <WebSocketsServer.h>


#define SOIL_MOISTURE_PIN 32
#define LDR_PIN 33

// DHT Sensor Einstellungen
#define DHTPIN 14
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Websocket stuff///////////////////////
unsigned long startTime;
const char* ApSsid = AP_SSID;
const char* ApPassword = AP_PASSWORD;

// Definieren Sie den WebSocket-Server auf Port 81
WebSocketsServer webSocket = WebSocketsServer(81);

// WebSocket-Event-Handler
void webSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
  if (type == WStype_CONNECTED) {
    Serial.printf("WebSocket Client verbunden: %u\n", num);
    // Sie können hier die WLAN-Credentials senden
    String ssid = WiFi.SSID();
    String password = WiFi.psk();
    String credentials = "SSID:" + ssid + ";PW:" + password;
    webSocket.sendTXT(num, credentials);
  }
  // weitere Event-Typen können hier behandelt werden
}

// Initialisieren Sie den MQTT-Client
WiFiClient espClient;
PubSubClient client(espClient);


void sendSensorData(const char* sensorType, float value) {
  StaticJsonDocument<200> doc;
  doc["mac"] = WiFi.macAddress();
  doc["SensorType"] = sensorType;
  doc["Value"] = value;

  char jsonMessage[512];
  serializeJson(doc, jsonMessage);
  client.publish(values_topic, jsonMessage);

  Serial.print("Send data: ");
  Serial.println(jsonMessage);
}


void setup() {
  Serial.begin(115200);
  startTime = millis();  
  dht.begin();

  WiFiManager wifiManager;
  // wifiManager.resetSettings();
  // Verbinden oder Start eines eigenen Access Points falls nicht konfiguriert
  if (!wifiManager.autoConnect("Esp32Plantmonit")) {
    Serial.println("Fehler beim Verbinden und Timeout erreicht");
    ESP.restart();  // Neustart des ESP
  } else {
    // Wenn die Verbindung hergestellt ist, die WLAN-Credentials auslesen
    String ssid = WiFi.SSID();
    String password = WiFi.psk();

    Serial.println("Verbunden mit WiFi");
    Serial.println("SSID: " + ssid);
    Serial.println("Passwort: " + password);
  }
  // Wenn die Verbindung hergestellt ist, drucken Sie die IP-Adresse
  Serial.println("Verbunden mit WiFi");
  Serial.println("IP-Adresse: ");
  Serial.println(WiFi.localIP());

  // WebSocket-Server starten
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  // AP stuff
  WiFi.mode(WIFI_AP_STA);  // Modus für Station + Access Point
  WiFi.softAP(ApSsid, ApPassword);
  Serial.print("Access Point \"");
  Serial.print(ApSsid);
  Serial.println("\" gestartet");

  Serial.print("IP-Adresse: ");
  Serial.println(WiFi.softAPIP());



  // Verbinden Sie sich mit dem MQTT Broker
  if (mqtt_port == 1883) {
    client.setServer(mqtt_server, 1883);
  } else {
    client.setServer(mqtt_server, mqtt_port);
  }
  Serial.println(mqtt_port);
  // client.setServer(mqtt_server, mqtt_port);
}



unsigned long lastTempReadTime = 0;
unsigned long lastHumidityReadTime = 0;
unsigned long lastSoilMoistureReadTime = 0;
unsigned long lastLightReadTime = 0;



void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // WebSocket-Server pflegen
  if (millis() - startTime < 300000) { // 300000 Millisekunden = 5 Minuten
    webSocket.loop();
  }

  unsigned long currentTime = millis();

  // Temperaturdaten auslesen und senden
  if (currentTime - lastTempReadTime >= TEMP_READ_INTERVAL) {
    float t = dht.readTemperature();
    if (!isnan(t)) {
      sendSensorData("Temperature", t);
      lastTempReadTime = currentTime;
    }
  }

  // Luftfeuchtigkeitsdaten auslesen und senden
  if (currentTime - lastHumidityReadTime >= HUMIDITY_READ_INTERVAL) {
    float h = dht.readHumidity();
    if (!isnan(h)) {
      sendSensorData("Humidity", h);
      lastHumidityReadTime = currentTime;
    }
  }

  // Bodenfeuchtigkeitsdaten auslesen und senden
  if (currentTime - lastSoilMoistureReadTime >= SOIL_MOISTURE_READ_INTERVAL) {
    int soilMoistureValue = analogRead(SOIL_MOISTURE_PIN);
    sendSensorData("SoilMoisture", soilMoistureValue);
    lastSoilMoistureReadTime = currentTime;
  }

  // Lichtdaten auslesen und senden
  if (currentTime - lastLightReadTime >= LIGHT_READ_INTERVAL) {
    int lightValue = analogRead(LDR_PIN);
    sendSensorData("LDR", lightValue);
    lastLightReadTime = currentTime;
  }

  // Kurze Pause, um Überlastung zu vermeiden
  // delay(1000);
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
