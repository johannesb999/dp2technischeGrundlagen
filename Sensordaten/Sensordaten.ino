// #include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <WiFiManager.h>
#include "config.h"  // Dies bindet Ihre Konfigurationsdatei ein
#include <ArduinoJson.h>

#include <WiFi.h>
#include <ESPmDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
int led = LED_BUILTIN;

#define SOIL_MOISTURE_PIN 32
#define LDR_PIN 33

// DHT Sensor Einstellungen
#define DHTPIN 14
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

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
  dht.begin();

  WiFiManager wifiManager;
  // wifiManager.resetSettings();
  // Verbinden oder Start eines eigenen Access Points falls nicht konfiguriert
  if (!wifiManager.autoConnect("Esp32Plantmonit1")) {
    Serial.println("Fehler beim Verbinden und Timeout erreicht");
    ESP.restart();  // Neustart des ESP
  }

  // Wenn die Verbindung hergestellt ist, drucken Sie die IP-Adresse
  Serial.println("Verbunden mit WiFi");
  Serial.println("IP-Adresse: ");
  Serial.println(WiFi.localIP());

  ArduinoOTA.setHostname("Johannesesp32WIFI");
  ArduinoOTA.setPassword("admin");
  // MD5(admin) = 21232f297a57a5a743894a0e4a801fc3
  // ArduinoOTA.setPasswordHash("21232f297a57a5a743894a0e4a801fc3");
  // ArduinoOTA.setPort(3232);

  // OTA STUFF
  ArduinoOTA
    .onStart([]() {
      String type;
      if (ArduinoOTA.getCommand() == U_FLASH)
        type = "sketch";
      else  // U_SPIFFS
        type = "filesystem";

      // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
      Serial.println("Start updating " + type);
    })
    .onEnd([]() {
      Serial.println("\nEnd");
    })
    .onProgress([](unsigned int progress, unsigned int total) {
      Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
    })
    .onError([](ota_error_t error) {
      Serial.printf("Error[%u]: ", error);
      if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
      else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
      else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
      else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
      else if (error == OTA_END_ERROR) Serial.println("End Failed");
    });

  ArduinoOTA.begin();
  Serial.println("Ready");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // set LED to be an output pin
  pinMode(led, OUTPUT);

  // Verbinden Sie sich mit dem MQTT Broker
  if (mqtt_port == 1883) {
    client.setServer(mqtt_server, 1883);
  } else {
    client.setServer(mqtt_server, mqtt_port);
  }
  Serial.println(mqtt_port);
  // client.setServer(mqtt_server, mqtt_port);
}

// OTA END

unsigned long lastTempReadTime = 0;
unsigned long lastHumidityReadTime = 0;
unsigned long lastSoilMoistureReadTime = 0;
unsigned long lastLightReadTime = 0;



void loop() {
  ArduinoOTA.handle();
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

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
