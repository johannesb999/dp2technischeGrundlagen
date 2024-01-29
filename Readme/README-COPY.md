# Pflanzenüberwachungssystem mit ESP32, ESP32-CAM, OpenAi Api

für weiterführende Informationen schauen Sie in den Readme-Ordner

## Inhalt
- [Über das Projekt](#über-das-projekt)
- [Teammitglieder](#teammitglieder)
- [Technologien](#technologien)
- [Funktionsweise](#funktionsweise)
  - [ESP32 Modul](#esp32-modul)
  - [ESP32-CAM Modul](#esp32-cam-modul)
  - [SensorService (Middleware)](#sensorservice-middleware)
  - [UserService](#userservice)
  - [Frontend (Svelte)](#frontend-svelte)
- [Installation und Einrichtung](#installation-und-einrichtung)
- [Nutzung](#nutzung)
- [Lizenz](#lizenz)
- [Kontakt](#kontakt)


## Über das Projekt

Unser Projekt PLANTMONIT ist ein innovatives Fullstack-System zur intelligenten Überwachung von Pflanzen, entwickelt im Rahmen des zweiten Semesters im Kurs "Technologien Grundlagen 2" im Wintersemester 2023/2024 an der HfG Schwäbisch Gmünd. Dieses System integriert fortschrittliche Technologien, um eine umfassende Überwachung und Analyse von Pflanzenzuständen zu ermöglichen. Es kombiniert Hardwarekomponenten wie ESP32 und ESP32-CAM mit modernen Softwarelösungen - OpenAi Api, einschließlich eines SensorServices und eines UserServices.

Das System nutzt Sensoren, um wichtige Umgebungsdaten wie Bodenfeuchtigkeit, Lichtintensität und Temperatur zu erfassen. Die ESP32-CAM nimmt regelmäßig Bilder der Pflanzen auf, die zur weiteren Analyse und Diagnose verwendet werden. Der SensorService, ein wesentlicher Bestandteil unserer Architektur, verarbeitet diese Sensordaten und Bilder und nutzt die OpenAI API, um detaillierte Informationen über den Pflanzenzustand zu gewinnen. Der UserService ist für die Verwaltung von Nutzerkonten und die Authentifizierung verantwortlich, was eine personalisierte Nutzung des Systems ermöglicht.

Unser Ziel ist es, einen einfachen, aber effektiven Weg zur Überwachung und Pflege von Pflanzen zu bieten, sowohl für Hobbygärtner als auch für professionelle Anwender. Mit PLANTMONIT streben wir danach, die Interaktion zwischen Menschen und Pflanzen durch den Einsatz von Technologie zu verbessern und zu erleichtern.

## Teammitglieder

- Johannes Biess
- Jannik Flaig
## Technologien

- ESP32 und ESP32-CAM
- Arduino-Komponenten
- MQTT für Messaging
- MongoDB und Mongoose für das Backend
- Node.js und Express.js für SensorService und UserService
- OpenAI API für Bildanalyse
- Svelte für das Frontend

## Funktionsweise

### ESP32 Modul

Verantwortlich für die Erfassung von Umgebungsdaten wie Bodenfeuchtigkeit, Lichtintensität und Temperatur. Diese Daten werden regelmäßig über MQTT an den SensorService gesendet.

### ESP32-CAM Modul

Nimmt periodisch Bilder der Pflanze auf und sendet diese über eine HTTP-POST-Anfrage an den SensorService.

### SensorService (Middleware)

#### Technologien und Bibliotheken

- **Node.js und Express.js**
- **MongoDB und Mongoose**
- **MQTT**
- **OpenAI API**
- **JSON Web Token (JWT)**

#### Hauptfunktionen

- **MQTT-Kommunikation**: Empfang und Speicherung von Sensordaten.
- **Bildverarbeitung**: Empfang, Speicherung und Bereitstellung von Bildern.
- **GPT-API-Integration**: Analyse der Bilder zur Ermittlung von Pflanzenzustand und -bedürfnissen.

#### API-Endpoints

- `/api/addpicture`: Empfang und Speicherung von Bildern.
- `/api/getpicture`: Abruf des neuesten Bildes.
- `/api/measurements`: Bereitstellung der neuesten Sensordaten.
- Weitere Endpoints für Geräteverwaltung und Nutzerauthentifizierung.

#### Sicherheit und Authentifizierung

- Einsatz von JWT für sichere Kommunikation und Zugriffskontrolle.

#### Datenbankstruktur

- Verwaltet Sammlungen für Geräte, Messungen und Bilder in MongoDB.

### UserService

#### Funktionsweise

Verwaltet Nutzerkonten und ermöglicht die Authentifizierung und Gerätezuordnung.

#### Technologien und Bibliotheken

- **Node.js und Express.js**
- **MongoDB und MongoClient**
- **bcryptjs** für Passwortsicherheit
- **JSON Web Token (JWT)** für Authentifizierung

#### Hauptfunktionen

- **Nutzerverwaltung**: Registrierung, Login, Account-Management.
- **Geräteverwaltung**: Zuordnung von Geräten zu Nutzerkonten.
- **Authentifizierung und Sicherheit**: Token-basierte Authentifizierung und sichere Passwortspeicherung.

#### API-Endpoints

- `/register`, `/login`, `/logout`: Registrierung und Authentifizierung.
- `/connect-device`: Verbindung von Geräten mit Nutzerkonten.
- `/delete-user`, `/restore-user`: Verwaltung von Nutzerkonten.

### Frontend (Svelte)

#### Funktionsweise

Bietet eine Benutzeroberfläche mit verschiedenen Funktionen wie Anmeldung, Geräteverwaltung und Anzeige von Sensordaten.

#### Hauptmerkmale

- **Svelte SPA Router**: Routing für verschiedene Seiten.
- **Navigation**: Benutzerfreundliche Navigation.
- **Styling**: Angepasstes Design.

#### Seiten und Komponenten

- **Login und Registrierung**: Authentifizierung und Nutzerkonto-Erstellung.
- **Home**: Übersichtsseite mit Geräteinformationen und Sensordaten.
- **Detailansicht**: Detaillierte Informationen zu einzelnen Geräten.
- **Gesundheitsüberwachung**: Ansicht zur Überwachung des Pflanzenzustands.
- **Geräteeinstellungen**: Konfiguration und Verwaltung der Geräte.

## Installation und Einrichtung

### Voraussetzungen

Vor der Installation sicherstellen, dass folgende Komponenten und Software verfügbar sind:

- Node.js und npm (Node Package Manager)
- MongoDB Datenbank
- Arduino IDE (für ESP32 und ESP32-CAM Programmierung)
- MQTT Broker (wie Mosquitto)

### Schritt-für-Schritt-Anleitung

#### 1. Einrichten der ESP32 und ESP32-CAM Module

1. Installieren der Arduino IDE auf dem Computer.
2. Herunterladen der erforderlichen Bibliotheken für ESP32 und ESP32-CAM.
3. Programmieren der ESP32 und ESP32-CAM Module mit dem bereitgestellten Code.
4. Sicherstellen, dass die Module korrekt mit dem Netzwerk verbunden sind.

#### 2. Einrichten des SensorServices und UserService

1. Klonen des Repositories mit dem SensorService und UserService auf den Server oder lokalen Computer.
2. Navigieren in das Verzeichnis des SensorService und Ausführen von `npm install`, um alle erforderlichen Node.js-Abhängigkeiten zu installieren.
3. Wiederholen dieses Schrittes für den UserService.
4. Konfigurieren der Umgebungsvariablen für beide Services entsprechend der Systemkonfiguration (Datenbankverbindung, JWT-Schlüssel, MQTT-Einstellungen etc.).

#### 3. Einrichten der MongoDB Datenbank

1. Installieren von MongoDB auf dem Server oder lokalen Computer.
2. Erstellen der erforderlichen Datenbanken und Sammlungen gemäß der Struktur, die im SensorService und UserService definiert ist.

#### 4. Einrichten des Frontends

1. Klonen des Repositories des Svelte-Frontends auf den lokalen Computer.
2. Ausführen von `npm install` im Verzeichnis des Frontends, um alle erforderlichen Abhängigkeiten zu installieren.
3. Starten des Frontends mit `npm run dev` oder einem ähnlichen Befehl, abhängig von der Svelte-Konfiguration.

#### 5. Starten der Anwendung

1. Starten des SensorService und UserService über die Kommandozeile mit `node app.js` oder einem ähnlichen Befehl.
2. Überprüfen, ob die ESP32 und ESP32-CAM Module korrekt Daten an den SensorService senden.
3. Überprüfen, ob das Frontend korrekt mit dem UserService interagiert und Daten darstellt.

### Fehlerbehebung

Bei Problemen bei der Installation oder beim Betrieb die Log-Dateien der einzelnen Komponenten überprüfen und sicherstellen, dass alle Verbindungen und Konfigurationen korrekt eingerichtet sind. Bei Bedarf die Dokumentation der verwendeten Technologien konsultieren.

## Weitere Hinweise

Diese Installationsanleitung dient als allgemeiner Leitfaden und könnte je nach spezifischer Konfiguration und Systemumgebung variieren. Anpassungen an das spezifische Setup sind wichtig.


## Nutzung

### Typisches Anwendungsszenario

#### Szenario: Überwachung der Pflanzengesundheit

**Schritt 1: Gerätekonfiguration**
- Ein Nutzer richtet die ESP32- und ESP32-CAM-Module bei einer Pflanze ein. Die Module werden so positioniert, dass die Sensoren die Bodenfeuchtigkeit, Lichtintensität und Temperatur erfassen können und die Kamera eine klare Sicht auf die Pflanze hat.

**Schritt 2: Anmeldung und Geräteverbindung**
- Der Nutzer meldet sich über das Svelte-Frontend an und verbindet die ESP32-Module mit seinem Nutzerkonto über den UserService. Dies ermöglicht eine personalisierte Überwachung und Datenverwaltung.

**Schritt 3: Echtzeit-Datenüberwachung**
- Die ESP32-Module senden regelmäßig erfasste Sensordaten über MQTT an den SensorService. Der Nutzer kann diese Daten in Echtzeit über das Frontend einsehen, um aktuelle Informationen über die Bodenfeuchtigkeit, Lichtverhältnisse und Temperatur zu erhalten.

**Schritt 4: Bildaufnahme und Analyse**
- Die ESP32-CAM nimmt in regelmäßigen Abständen Bilder der Pflanze auf. Diese Bilder werden an den SensorService gesendet, der sie zur Analyse an die OpenAI API weiterleitet. Die KI analysiert die Bilder auf Anzeichen von Krankheiten, Schädlingen oder anderen Problemen.

**Schritt 5: Erhalt von Empfehlungen**
- Nach der Analyse erhält der Nutzer über das Frontend detaillierte Informationen und Empfehlungen. Beispielsweise könnte die KI erkennen, dass die Pflanze unter Wassermangel leidet und entsprechende Bewässerungsempfehlungen aussprechen.

**Schritt 6: Anpassungen vornehmen**
- Basierend auf den Empfehlungen kann der Nutzer entsprechende Maßnahmen ergreifen, wie z. B. die Bewässerung erhöhen oder die Pflanze an einen sonnigeren Ort stellen.

### Weitere Nutzungsmöglichkeiten

Das System ist flexibel und kann für verschiedene Arten von Pflanzen und Umgebungen angepasst werden. Es eignet sich sowohl für den Heimgebrauch als auch für professionelle Anwendungen wie Gewächshäuser oder landwirtschaftliche Betriebe.


## Lizenz

(Details zur Lizenzierung des Projekts, falls zutreffend.)

## Kontakt

Für weitere Anfragen oder Unterstützung kontaktieren Sie bitte:

- Johannes Biess - [johannes.biess@hfg.design]
- Jannik Flaig - [jannik.flaig@hfg.design]
