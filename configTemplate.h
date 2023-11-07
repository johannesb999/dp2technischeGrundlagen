// config.h
#ifndef CONFIG_H
#define CONFIG_H

// WiFi credentials
const char* ssid = "WIFI-Name";
const char* password = "WIFI-Passwort";

// MQTT Broker settings
const char* mqtt_server = "mqtt.YOUR.SERVER";
const int mqtt_port = Your Port;

// MQTT Topics
const char* humidity_topic = "Your/Path";
const char* temperature_topic = "Your/Path";

#endif // CONFIG_H
