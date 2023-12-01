// #include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <WiFiManager.h>
#include "config.h"
#include <ArduinoJson.h>
#include <WiFi.h>
#include <ESPmDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>

// Pin-Definitionen
#define SOIL_MOISTURE_PIN 32
#define LDR_PIN 33
#define DHTPIN 14
#define DHTTYPE DHT22
#define LED_BUILTIN_PIN LED_BUILTIN

// Leseintervalle
const unsigned long TEMP_READ_INTERVAL = 1000;
const unsigned long HUMIDITY_READ_INTERVAL = 3000;
const unsigned long SOIL_MOISTURE_READ_INTERVAL = 2000;
const unsigned long LIGHT_READ_INTERVAL = 4000;

// Globale Variablen
DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastTempReadTime = 0;
unsigned long lastHumidityReadTime = 0;
unsigned long lastSoilMoistureReadTime = 0;
unsigned long lastLightReadTime = 0;

// Funktion zur Sensordatensendung
void sendSensorData(const char* sensorType, float value) {
  StaticJsonDocument<200> doc;
  doc["mac"] = WiFi.macAddress();
  doc["SensorTyp"] = sensorType;
  doc["Wert"] = value;

  char jsonMessage[512];
  serializeJson(doc, jsonMessage);
  client.publish(values_topic, jsonMessage);

  Serial.print("Send data: ");
  Serial.println(jsonMessage);
}

// Funktion zum erneuten Verbinden mit MQTT
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP-Joe" + WiFi.macAddress();
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

// Setup-Funktion
void setup() {
  Serial.begin(115200);
  dht.begin();
  setupWiFi();
  setupOTA();
  setupMQTT();
  pinMode(LED_BUILTIN_PIN, OUTPUT);
}

// WiFi-Setup-Funktion
void setupWiFi() {
  WiFiManager wifiManager;
  if (!wifiManager.autoConnect("AutoConnectAP")) {
    Serial.println("Fehler beim Verbinden und Timeout erreicht");
    ESP.restart();
  }
  Serial.println("Verbunden mit WiFi");
  Serial.println("IP-Adresse: ");
  Serial.println(WiFi.localIP());
}

// OTA-Setup-Funktion
void setupOTA() {
  ArduinoOTA.setHostname("Johannesesp32WIFI");
  ArduinoOTA.setPassword("admin");

  ArduinoOTA.onStart([]() {
    String type = ArduinoOTA.getCommand() == U_FLASH ? "sketch" : "filesystem";
    Serial.println("Start updating " + type);
  });
  ArduinoOTA.onEnd([]() { Serial.println("\nEnd"); });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });

  ArduinoOTA.begin();
}

// MQTT-Setup-Funktion
void setupMQTT() {
  client.setServer(mqtt_server, mqtt_port);
}

// Haupt-Loop-Funktion
void loop() {
  handleOTA();
  handleMQTT();
  readAndSendSensorData();
}

// OTA-Handling-Funktion
void handleOTA() {
  ArduinoOTA.handle();
}

// MQTT-Handling-Funktion
void handleMQTT() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}

// Sensor-Daten-Lese- und -Sendefunktion
void readAndSendSensorData() {
  unsigned long currentTime = millis();
  // Temperaturdaten
  if (currentTime - lastTempReadTime >= TEMP_READ_INTERVAL) {
    readAndSendTempData();
  }
  // Luftfeuchtigkeit
  if (currentTime - lastHumidityReadTime >= HUMIDITY_READ_INTERVAL) {
    readAndSendHumidityData();
  }
  // Bodenfeuchtigkeit
  if (currentTime - lastSoilMoistureReadTime >= SOIL_MOISTURE_READ_INTERVAL) {
    readAndSendSoilMoistureData();
  }
  // Licht
  if (currentTime - lastLightReadTime >= LIGHT_READ_INTERVAL) {
    readAndSendLightData();
  }
  delay(1000); // Kurze Pause, um Überlastung zu vermeiden
}

// Funktionen zum Lesen und Senden der einzelnen Sensordaten
void readAndSendTempData() {
  float t = dht.readTemperature();
  if (!isnan(t)) {
    sendSensorData("Temperature", t);
    lastTempReadTime = millis();
  }
}

void readAndSendHumidityData() {
  float h = dht.readHumidity();
  if (!isnan(h)) {
    sendSensorData("Humidity", h);
    lastHumidityReadTime = millis();
  }
}

void readAndSendSoilMoistureData() {
  int soilMoistureValue = analogRead(SOIL_MOISTURE_PIN);
  sendSensorData("SoilMoisture", soilMoistureValue);
  lastSoilMoistureReadTime = millis();
}

void readAndSendLightData() {
  int lightValue = analogRead(LDR_PIN);
  sendSensorData("LDR", lightValue);
  lastLightReadTime = millis();
}
