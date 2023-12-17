#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>
#include <DHT.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFi.h>


extern const char* values_topic;

class Sensor {
public:
  Sensor(const char* type)
    : sensorType(type) {}

  virtual void readAndSend(PubSubClient& client) = 0;  // Rein virtuelle Funktion

protected:
  const char* sensorType;

  void sendSensorData(PubSubClient& client, float value) {
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
};

class TemperatureSensor : public Sensor {
public:
  TemperatureSensor(DHT* dht)
    : Sensor("Temperature") {_dht= dht;};
  void readAndSend(PubSubClient& client) override;
private:
  DHT* _dht;
};

class HumiditySensor : public Sensor {
public:
  HumiditySensor(DHT* dht)
    : Sensor("Humidity"), _dht(dht) {_dht= dht;};
  void readAndSend(PubSubClient& client) override;
private:
  DHT* _dht;
};

class SoilMoistureSensor : public Sensor {
public:
  SoilMoistureSensor(int pin)
    : Sensor("SoilMoisture"), _pin(pin) {}
  void readAndSend(PubSubClient& client) override;

private:
  int _pin;
};

class LightSensor : public Sensor {
public:
  LightSensor(int pin)
    : Sensor("LDR"), _pin(pin) {}
  void readAndSend(PubSubClient& client) override;

private:
  int _pin;
};

#endif  // SENSORS_H
