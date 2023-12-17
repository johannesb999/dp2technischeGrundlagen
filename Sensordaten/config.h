// config.h
#ifndef CONFIG_H
#define CONFIG_H

// WiFi credentials
const char* ssid = "JB hotspot 23U";
const char* password = "12345679";

// const char* ssid = "YOUR_WIFI";
// const char* password = "YOUR_PASSWORD";

// MQTT Broker settings
const char* mqtt_server = "mqtt.hfg.design";
const int mqtt_port = 1883;

// MQTT Topics

const char* values_topic = "dp2/values";

// Intervall
#define TEMP_READ_INTERVAL 300
#define HUMIDITY_READ_INTERVAL 600 
#define SOIL_MOISTURE_READ_INTERVAL 300
#define LIGHT_READ_INTERVAL 200



#endif // CONFIG_H