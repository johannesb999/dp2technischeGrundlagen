#include "config.h"
#include "Sensors.h"
#include "NetworkManager.h"


DHT dht(DHTPIN, DHTTYPE);

// TemperatureSensor tempSensor(&dht);
// HumiditySensor humiditySensor(&dht);
SoilMoistureSensor soilMoistureSensor(SOIL_MOISTURE_PIN);
LightSensor lightSensor(LDR_PIN);

NetworkManager networkManager;

void setup() {
    Serial.begin(115200);
    dht.begin();  // Initialisieren Sie den DHT-Sensor
    networkManager.setup();  // Richten Sie das Netzwerk ein
    delay(1000);
    Serial.println(dht.readTemperature());
}

void loop() {
    networkManager.loop();  // Netzwerk-Loop (für MQTT und OTA)

    // Lesen und Senden von Sensordaten
    // tempSensor.readAndSend(networkManager.getMqttClient());
    // humiditySensor.readAndSend(networkManager.getMqttClient());
    soilMoistureSensor.readAndSend(networkManager.getMqttClient());
    lightSensor.readAndSend(networkManager.getMqttClient());

    delay(1000); 
}
