<script>
  import axios from "axios";

  import { currentRoute } from "../svelte-store";

  export let device;
  let latestSoilMoisture;
  let alarmLevel;
  //   let devices = [];
  const threshold = 2700;

  console.log("device:", device);

  console.log("device:", device._id);
  //   async function fetchData() {
  //     const measurementsResponse = await axios.post("http://localhost:3001/device-data", {
  //         deviceId: device._id,
  //     })
  //     console.log(measurementsResponse);
  //     const soilMoistureData = measurementsResponse.data && measurementsResponse.data['SoilMoisture']
  //       ? measurementsResponse.data['SoilMoisture']
  //       : [];
  //       console.log(soilMoistureData);
  //     const latestValue = soilMoistureData.length > 0 ? soilMoistureData[soilMoistureData.length - 1] : undefined;
  //     console.log(latestValue);
  //       latestSoilMoisture = latestValue,
  //       alarmLevel = getAlarmLevel(latestValue, threshold)
  //   }

  let latestValues = {};
  let alarmLevels = {};

  async function fetchData() {
    try {
      const measurementsResponse = await axios.post(
        "http://localhost:3001/device-data",
        {
          deviceId: device._id,
        }
      );
      console.log(measurementsResponse);

      // Iterieren über alle Schlüssel in den Daten
      for (const [key, values] of Object.entries(measurementsResponse.data)) {
        const latestValue =
          values.length > 0 ? values[values.length - 1] : undefined;
        console.log(key, latestValue);
        latestValues[key] = latestValue;

        // Alarmlevel basierend auf dem Schlüssel bestimmen
        alarmLevels[key] = getAlarmLevel(latestValue, threshold);
      }

      console.log(latestValues);
      console.log(alarmLevels);
      return { latestValues, alarmLevels };
    } catch (error) {
      console.error("Fehler beim Abrufen der Gerätedaten:", error);
    }
  }

  function getAlarmLevel(soilMoisture, threshold) {
    const difference = threshold - soilMoisture;
    if (difference >= 200) {
      return "dringend gießen";
    } else if (difference >= 100) {
      return "bitte gießen";
    }
    return "Top Zustand";
  }

  function linkPage() {
    currentRoute.set("/Detail");
    window.location.href = `#/Detail?deviceId=${device._id}`;
  }

  async function run() {
    const hgfdes = await fetchData();
    console.log(hgfdes);
  }
  run();
</script>

<device on:click={linkPage}>
  <img src="ZebraPflanze.png" alt="Pflanze" />
  <div>
    <span id="status">{alarmLevel}</span>
    <div id="buddy"></div>
  </div>
  <div id="data-div">
    <span>{device.DeviceName}</span>
    <ul>
      {#each Object.entries(latestValues) as [schluessel, latestValue]}
        <li>{latestValue}</li>
      {/each}
    </ul>
  </div>
</device>

<style>
  device {
    background-color: rgb(68, 67, 67);
    border-radius: 10px;
    border: 5px solid red;
    width: 100%;
    height: 130px;
    padding: 0;
    margin-bottom: 2rem;
    position: relative;
  }
  ul {
    display: flex;
    gap: 15px;
  }
  li {
    display: flex;
    list-style-type: none;
    font-size: 15px;
  }
  #status {
    position: absolute;
    z-index: 10231232134324;
    top: 0;
    left: 0;
    background-color: black;
    /* color: black; */
  }
  #data-div {
    background-color: black;
    font-weight: bold;
    font-size: larger;
    color: white;
    padding-left: 2rem;
    padding-right: 2rem;
    z-index: 123344;
    border: 2px solid green;
    padding-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* border: 2px solid red; */
    /* position: absolute; */
    /* bottom: 2.5rem; */
    right: 0;
    z-index: 5;
  }
  img {
    width: 100%;
    object-fit: cover;
    height: 70%;
  }
</style>
