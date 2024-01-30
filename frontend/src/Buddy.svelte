<script>
  import { onMount } from "svelte";
  import axios from "axios";
  import { loggedIn } from "./svelte-store";

  let devices = [];
  let idealAirHumiRange;
  let idealAirTempRange;
  let idealSoilRange;

  onMount(async () => {
    try {
      const response = await axios.post("http://localhost:3000/get-devices");
      console.log(response);
      devices = await Promise.all(
        response.data.map(async (device) => {
          const measurementsResponse = await axios.post(
            "http://localhost:3000/device-data",
            { deviceId: device._id }
          );
          console.log(measurementsResponse);
          // Überprüfen Sie, ob SoilMoisture-Daten vorhanden sind
          const soilMoistureData =
            measurementsResponse.data &&
            measurementsResponse.data["SoilMoisture"]
              ? measurementsResponse.data["SoilMoisture"]
              : [];
          console.log(soilMoistureData);
          // Nehmen Sie den letzten Wert, wenn vorhanden, ansonsten undefined
          const latestValue =
            soilMoistureData.length > 0
              ? soilMoistureData[soilMoistureData.length - 1]
              : undefined;
          console.log(latestValue);
          const idealValues = await axios.post(
            "http://localhost:3000/get-ideal-values",
            { plant: device.plantspecies }
          );
          console.log(idealValues);
          idealAirHumiRange = splitRange(idealValues.data.idealAirHumi);
          idealAirTempRange = splitRange(idealValues.data.idealAirTemp);
          idealSoilRange = splitRange(idealValues.data.idealSoil);
          console.log(idealAirHumiRange);
          console.log(idealAirTempRange);
          console.log(idealSoilRange);
          const alarmStatus = getAlarmLevel(latestValue, idealSoilRange);
          return {
            ...device,
            latestSoilMoisture: latestValue,
            alarmStatus, // Speichern des von getAlarmLevel zurückgegebenen Objekts
          };
        })
      );
      console.log(devices);
      // Filtern von Geräten, deren Bodenfeuchtigkeit unter dem Schwellenwert liegt
      devices = devices.filter((device) => device.alarmStatus.alarmLevel > 0);
      console.log(devices);
      devices.sort(
        (a, b) => b.alarmStatus.alarmLevel - a.alarmStatus.alarmLevel
      );
    } catch (error) {
      console.error("Fehler beim Abrufen der Gerätedaten:", error);
    }
  });

  function splitRange(value) {
    const [min, max] = value.split(" - ").map(Number);
    return { min, max };
  }

  function getAlarmLevel(soilMoisture, soirang) {
    const soilMoistureValue = Number(soilMoisture); // Konvertieren in eine Zahl, falls nötig

    console.log(soirang);
    let alarmLevel = 0;
    let alarmType = "none"; // 'none', 'low' für zu niedrig oder 'high' für zu hoch

    // Prüfen, ob der Wert unter dem Idealbereich liegt
    if (soilMoistureValue < soirang.min) {
      const difference = soirang.min - soilMoistureValue;
      alarmType = "low"; // Der Wert ist zu niedrig
      if (difference > 20) {
        alarmLevel = 3; // Hoher Alarm
      } else if (difference > 10) {
        alarmLevel = 2; // Mittlerer Alarm
      } else {
        alarmLevel = 1; // Niedriger Alarm
      }
    }
    // Prüfen, ob der Wert über dem Idealbereich liegt
    else if (soilMoistureValue > soirang.max) {
      const difference = soilMoistureValue - soirang.max;
      alarmType = "high"; // Der Wert ist zu hoch
      if (difference > 20) {
        alarmLevel = 3; // Hoher Alarm
      } else if (difference > 10) {
        alarmLevel = 2; // Mittlerer Alarm
      } else {
        alarmLevel = 1; // Niedriger Alarm
      }
    }
    console.log(alarmLevel, alarmType);
    return { alarmLevel, alarmType };
  }
</script>

<main style=" padding: 20px; padding-top: 100px; ">
  {#if devices.length === 0}
    <h2>Bei deinen Pflanzen ist alles in bester Ordnung</h2>
  {:else}
    <h2>DU bist ein beschissnere Gartenmensch</h2>
    <ul id="myList">
      {#each devices as device}
        <li class={`alarm-level-${device.alarmStatus.alarmLevel}`}>
          {device.DeviceName}: Bodenfeuchtigkeit {device.latestSoilMoisture}% -
          {#if device.alarmStatus.alarmLevel > 0}
            Alarmstufe {device.alarmStatus.alarmLevel} -
            {#if device.alarmStatus.alarmType === "low"}
              Zu niedrig
            {:else if device.alarmStatus.alarmType === "high"}
              Zu hoch
            {/if}
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</main>

<style>
  #myList {
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-content: center;
    align-items: center;
    padding-inline-start: 0;
    list-style-type: none;
  }
  .alarm-level-1 {
    border: 1px solid rgba(255, 255, 0, 0.359);
    padding: 10px;
    margin: 5px 0;
    box-shadow: 1px 10px 8px rgba(0, 0, 0, 0.141);
    border-radius: 10px;
  }
  .alarm-level-2 {
    border: 2px solid yellow; /* Roter Rahmen für Alarmstufe 2 */
    padding: 10px;
    margin: 5px 0;
    box-shadow: 1px 10px 8px rgba(0, 0, 0, 0.141);
    border-radius: 10px;
  }

  .alarm-level-3 {
    border: 2px solid red; /* Roter Rahmen für Alarmstufe 2 */
    padding: 10px;
    margin: 5px 0;
    box-shadow: 1px 10px 8px rgba(0, 0, 0, 0.141);
    border-radius: 10px;
  }
</style>
