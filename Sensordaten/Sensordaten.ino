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

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFiManager wifiManager;
  // wifiManager.resetSettings();
  // Verbinden oder Start eines eigenen Access Points falls nicht konfiguriert
  if (!wifiManager.autoConnect("AutoConnectAP")) {
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

void loop() {
  ArduinoOTA.handle();  // OTA-Handling als erstes
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
  int soilMoistureValue = analogRead(SOIL_MOISTURE_PIN);
  int lightValue = analogRead(LDR_PIN);
  Serial.print("Soil Moisture: ");
  Serial.println(soilMoistureValue);
  Serial.print("Light: ");
  Serial.println(lightValue);
  delay(1000);

  // Serial prints hinzugefügt, um Daten zu sehen
  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print("%  Temperature: ");
  Serial.print(t);
  Serial.println("°C ");
  String clientId = "ESP-Johannes" + WiFi.macAddress();









  // Erstellt ein JSON-Dokument für die Temperatur
  StaticJsonDocument<300> tempDoc;
  tempDoc["mac"] = WiFi.macAddress();
  tempDoc["Wert"] = t;
  tempDoc["SensorTyp"] = "Temperature";

  char tempJsonMessage[200];
  serializeJson(tempDoc, tempJsonMessage);
  client.publish(values_topic, tempJsonMessage);

  // Erstellt ein separates JSON-Dokument für die Luftfeuchtigkeit
  StaticJsonDocument<300> humDoc;
  humDoc["mac"] = WiFi.macAddress();
  humDoc["Wert"] = h;
  humDoc["SensorTyp"] = "Humidity";
  char humJsonMessage[200];
  serializeJson(humDoc, humJsonMessage);
  client.publish(values_topic, humJsonMessage);

  // Erstellen eines JSON-Dokuments für den Bodenfeuchtesensor
  StaticJsonDocument<300> soilMoistureDoc;
  soilMoistureDoc["mac"] = WiFi.macAddress();
  soilMoistureDoc["Wert"] = soilMoistureValue;
  soilMoistureDoc["SensorTyp"] = "SoilMoisture";
  char soilMoistureJsonMessage[200];
  serializeJson(soilMoistureDoc, soilMoistureJsonMessage);
  client.publish(values_topic, soilMoistureJsonMessage);

  // Erstellen eines JSON-Dokuments für den LDR
  StaticJsonDocument<300> lightDoc;
  lightDoc["mac"] = WiFi.macAddress();
  lightDoc["Wert"] = lightValue;
  lightDoc["SensorTyp"] = "LDR";
  char lightJsonMessage[200];
  serializeJson(lightDoc, lightJsonMessage);
  client.publish(values_topic, lightJsonMessage);


  digitalWrite(led, HIGH);  // turn the LED on (HIGH is the voltage level)
  delay(100);               // wait for a half second
  digitalWrite(led, LOW);   // turn the LED off by making the voltage LOW
  delay(100);               // wait for a half second

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
