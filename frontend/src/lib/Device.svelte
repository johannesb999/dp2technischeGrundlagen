<script>
  import axios from "axios";

  import { currentRoute } from "../svelte-store";
  import { push } from "svelte-spa-router";

  export let device;
  let alarmLevel;
  let bildstring;
  let showcontent = false;
  let showcontent2 = false;
  let idealSoilRange;

  console.log("device:", device);

  console.log("device:", device._id);
  let latestValues = {};
  let alarmLevels = {};

  async function fetchLatestImage() {
    try {
      const result = await axios.post(
        "http://localhost:3000/get-mac-by-deviceID",
        { device: device._id }
      );
      console.log("hoffentlich mac:", result.data);
      const response = await axios.post(
        "http://localhost:3000/api/getpicture",
        { device: result.data }
      );
      bildstring = response.data[0].data;
      showcontent = true;
    } catch (error) {
      console.error("Fehler beim Abrufen des Bildes:", error);
      showcontent = true;
    }
  }

  let alarm;

  async function fetchData() {
    try {
      console.log("deviceID:", device._id);
      const measurementsResponse = await axios.post(
        "http://localhost:3000/device-data",
        {
          deviceId: device._id,
        }
      );
      console.log(measurementsResponse);
      const idealValues = await axios.post(
        "http://localhost:3000/get-ideal-values",
        { plant: device.plantspecies }
      );
      console.log(idealValues);
      idealSoilRange = splitRange(idealValues.data.idealSoil);
      console.log(idealSoilRange);

      // Iterieren über alle Schlüssel in den Daten
      for (const [key, values] of Object.entries(measurementsResponse.data)) {
        const latestValue =
          values.length > 0 ? values[values.length - 1] : undefined;
        // console.log(key, latestValue);
        latestValues[key] = latestValue;

        // Alarmlevel basierend auf dem Schlüssel bestimmen
        if (key === "SoilMoisture") {
          alarm = getAlarmLevel(latestValue, idealSoilRange);
        }
      }

      console.log(latestValues);
      console.log("alarm:", alarm);
      showcontent2 = true;
      return { latestValues };
    } catch (error) {
      console.error("Fehler beim Abrufen der Gerätedaten:", error);
    }
  }

  function splitRange(value) {
    const [min, max] = value.split(" - ").map(Number);
    return { min, max };
  }

  function getAlarmLevel(soilMoisture, soirang) {
    const soilMoistureValue = Number(soilMoisture); // Konvertieren in eine Zahl, falls nötig

    console.log("value:", soilMoistureValue);
    console.log("range:", soirang);
    let alarmLevel = "ideal";
    let alarmType = "none"; // 'none', 'low' für zu niedrig oder 'high' für zu hoch

    // Prüfen, ob der Wert unter dem Idealbereich liegt
    if (soilMoistureValue < soirang.min) {
      const difference = soirang.min - soilMoistureValue;
      alarmType = "low"; // Der Wert ist zu niedrig
      if (difference > 20) {
        alarmLevel = "trocken"; // Hoher Alarm
      } else if (difference > 10) {
        alarmLevel = "trocken"; // Mittlerer Alarm
      } else {
        alarmLevel = "trocken"; // Niedriger Alarm
      }
    }
    // Prüfen, ob der Wert über dem Idealbereich liegt
    else if (soilMoistureValue > soirang.max) {
      const difference = soilMoistureValue - soirang.max;
      alarmType = "high"; // Der Wert ist zu hoch
      if (difference > 20) {
        alarmLevel = "überwässert"; // Hoher Alarm
      } else if (difference > 10) {
        alarmLevel = "überwässert"; // Mittlerer Alarm
      } else {
        alarmLevel = "überwässert"; // Niedriger Alarm
      }
    }
    console.log(alarmLevel, alarmType);
    return { alarmLevel, alarmType };
  }

  function linkPage() {
    currentRoute.set("/Detail");
    push(`/Detail?deviceId=${device._id}`);
  }

  async function run() {
    fetchLatestImage();
    fetchData();
  }
  run();
  let orderedKeys = ["SoilMoisture", "LDR", "Temperature", "Humidity"];
  function formatValue(value) {
    if (typeof value === "number") {
      return value.toFixed(2);
    }
    return "N/A"; // oder ein anderer Platzhalterwert
  }
</script>

{#if showcontent && showcontent2}
  <button on:click={linkPage}>
    <img
      src={bildstring ? `data:image/jpeg;base64,${bildstring}` : "Nils.JPG"}
      alt="Pflanze"
    />
    <div>
      <span id="status">{alarm.alarmLevel}</span>
      <div id="buddy"></div>
    </div>
    <div id="data-div">
      <span>{device.DeviceName}</span>
      <div id="text-div">
        {#each orderedKeys as schluessel}
          <p>{formatValue(latestValues[schluessel])}</p>
        {/each}
      </div>
    </div>
  </button>
{/if}

<style>
  button {
    background-color: rgb(224, 255, 181);
    border-radius: 10px;
    width: 100%;
    height: 170px;
    padding: 0;
    position: relative;
    border-radius: 10px;
  }
  p {
    margin: 0;
  }
  #text-div {
    display: flex;
    justify-content: end;
    gap: 25px;
    width: 100%;
  }
  #status {
    position: absolute;
    z-index: 1023;
    top: -1px;
    padding: 4px;
    color: black;
    left: 0;
    border-top-left-radius: 10px;
    background-color: rgba(144, 238, 144, 0.13);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(144, 238, 144, 0.3);
  }
  #data-div {
    padding-left: 5px;
    padding-right: 5px;
    background-color: rgb(224, 255, 181);
    color: rgb(0, 0, 0);
    z-index: 123344;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    display: flex;
    gap: 15px;
    height: fit-content;
    align-items: center;
    padding-bottom: 4px;
    right: 0;
  }
  #data-div span {
    font-size: 15px;
    margin-right: 20px;
  }
  img {
    width: 100%;
    object-fit: cover;
    height: 80%;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
  }
</style>
