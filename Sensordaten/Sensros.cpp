#include "Sensors.h"

void TemperatureSensor::readAndSend(PubSubClient& client) {
    float temp = dht.readTemperature();
    if (!isnan(temp)) {
        sendSensorData(client, temp);
    }
}

void HumiditySensor::readAndSend(PubSubClient& client) {
    float humidity = dht.readHumidity();
    if (!isnan(humidity)) {
        sendSensorData(client, humidity);
    }
}

void SoilMoistureSensor::readAndSend(PubSubClient& client) {
    int soilMoistureValue = analogRead(_pin);
    sendSensorData(client, soilMoistureValue);
}

void LightSensor::readAndSend(PubSubClient& client) {
    int lightValue = analogRead(_pin);
    sendSensorData(client, lightValue);
}
