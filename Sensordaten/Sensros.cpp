#include "Sensors.h"

void TemperatureSensor::readAndSend(PubSubClient& client) {
    float temp = _dht->readTemperature();
    Serial.printf("the temperature is %f", temp);
    if (!isnan(temp)) {
        sendSensorData(client, temp);
    }
}

void HumiditySensor::readAndSend(PubSubClient& client) {
    float humidity = _dht->readHumidity();
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
