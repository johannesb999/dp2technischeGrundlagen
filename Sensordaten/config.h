#ifndef CONFIG_H
#define CONFIG_H

extern const char* ssid;
extern const char* password;
extern const char* mqtt_server;
extern const int mqtt_port;
extern const char* values_topic;

// Sensor Pins
#define SOIL_MOISTURE_PIN 32
#define LDR_PIN 33
#define DHTPIN 14
#define DHTTYPE DHT22

#endif // CONFIG_H
