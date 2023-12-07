#include "config.h"
#include "Sensors.h"
#include "NetworkManager.h"

// Erstellen Sie eine Instanz des DHT-Sensors
DHT dht(DHTPIN, DHTTYPE);

// Erstellen Sie Instanzen Ihrer Sensor-Klassen
TemperatureSensor tempSensor;
HumiditySensor humiditySensor;
SoilMoistureSensor soilMoistureSensor(SOIL_MOISTURE_PIN);
LightSensor lightSensor(LDR_PIN);

// Erstellen Sie eine Instanz des Netzwerkmanagers
NetworkManager networkManager;

void setup() {
    Serial.begin(115200);
    dht.begin();  // Initialisieren Sie den DHT-Sensor
    networkManager.setup();  // Richten Sie das Netzwerk ein
}

void loop() {
    networkManager.loop();  // Netzwerk-Loop (für MQTT und OTA)

    // Lesen und Senden von Sensordaten
    tempSensor.readAndSend(networkManager.getMqttClient());
    humiditySensor.readAndSend(networkManager.getMqttClient());
    soilMoistureSensor.readAndSend(networkManager.getMqttClient());
    lightSensor.readAndSend(networkManager.getMqttClient());

    delay(1000); // Beispielsweise 1 Sekunde Wartezeit
}
