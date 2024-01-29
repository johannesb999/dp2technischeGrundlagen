# Anleitung zur Nutzung des PLANTMONIT-Systems

## Willkommen bei PLANTMONIT

Herzlichen Glückwunsch zum Erwerb Ihres PLANTMONIT-Systems! Dieses innovative System zur Überwachung von Pflanzen wurde entwickelt, um Ihnen eine einfache und effektive Möglichkeit zur Pflege Ihrer Pflanzen zu bieten. 

In dieser Anleitung finden Sie alle notwendigen Informationen zur Einrichtung und Nutzung Ihres PLANTMONIT-Systems.

## Inbetriebnahme

### 1. Aufladen

- Entfernen Sie die Klappe und laden Sie den Akku über das beigelegte Kabel auf. Die Kamera ist damit auch direkt bereit für die Inbetriebnahme und funktioniert nach Aufladen bis zu 12 h im Akkubetrieb.

### 2. Positionieren der Module

- **PlantMonit**: Platzieren Sie PlantMonit im Blumentopf der Pflanze, die überwacht werden soll. Achten Sie darauf, dass das der Erdfeuchtesensor vollständig in der Erde steckt.
- **Kamera**: Richten Sie die Kamera so aus, dass sie eine gute Sicht auf die Pflanze hat. Die Kamera sollte frei von Hindernissen sein, um klare Bilder aufnehmen zu können.

### 3. Verbinden mit dem WLAN

- Verbinden Sie PlantMonit mit Ihrem WLAN-Netzwerk. Das Kamera Modul sollte bereits so konfiguriert sein, dass es sich automatisch mit dem in PlantMonit eingegebenem Netzwerk verbindet.

### 4. Starten der Services im Terminal

- Starten Sie index.js im Userservice mit node indes.js
- Starten Sie index.js im Sensorservice mit node indes.js

### 5. Zugriff auf die Benutzeroberfläche

- Öffnen Sie die Webanwendung des PLANTMONIT-Systems in Ihrem Browser. Dies können Sie tun, indem Sie im Terminal im Ordner Frontend die Index.html mit npm run dev starten.
- Melden Sie sich mit Ihren Zugangsdaten an oder erstellen Sie ein neues Konto, falls Sie noch keines haben.
- Verbinden Sie das Neue Gerät mit ihrem Konto.

## Nutzung des Systems

Nach der erfolgreichen Einrichtung können Sie folgende Funktionen nutzen:

### Überwachung der Pflanzengesundheit

- Überprüfen Sie die Sensordaten, die vom ESP32 Modul erfasst und auf der Webanwendung angezeigt werden. Hier finden Sie Informationen über die Bodenfeuchtigkeit, Lichtintensität und die Umgebungstemperatur.
- Sehen Sie sich die Bilder an, die von der ESP32-CAM aufgenommen und in der Webanwendung bereitgestellt werden, um den Zustand Ihrer Pflanze visuell zu überwachen.

### Erhalt von Empfehlungen

- Das System analysiert die Sensordaten und die Bilder Ihrer Pflanzen und bietet Ihnen basierend darauf Empfehlungen. Diese können zum Beispiel Hinweise zur Bewässerung oder Platzierung der Pflanze beinhalten.

### Anpassungen und Einstellungen

- Nutzen Sie die Geräteeinstellungen in der Webanwendung, um Ihr PLANTMONIT-System zu konfigurieren und an Ihre spezifischen Bedürfnisse anzupassen.

## Kontakt

Für weitere Anfragen oder Unterstützung kontaktieren Sie bitte:

- Johannes Biess - [johannes.biess@hfg.design]
- Jannik Flaig - [jannik.flaig@hfg.design]
