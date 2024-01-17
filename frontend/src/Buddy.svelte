<script>
    import { onMount } from 'svelte';
    import axios from 'axios';
    import {loggedIn} from "./svelte-store"; 
  
    let devices = [];
    const threshold = 2700; // Der Schwellenwert für Bodenfeuchtigkeit
  
    onMount(async () => {
    try {
      const response = await axios.post('http://localhost:3001/get-devices');
      console.log(response);
      devices = await Promise.all(response.data.map(async (device) => {
        const measurementsResponse = await axios.post('http://localhost:3001/device-data', { deviceId: device._id });
        console.log(measurementsResponse);
        // Überprüfen Sie, ob SoilMoisture-Daten vorhanden sind
        const soilMoistureData = measurementsResponse.data && measurementsResponse.data['SoilMoisture']
          ? measurementsResponse.data['SoilMoisture']
          : [];
          console.log(soilMoistureData);
        // Nehmen Sie den letzten Wert, wenn vorhanden, ansonsten undefined
        const latestValue = soilMoistureData.length > 0 ? soilMoistureData[soilMoistureData.length - 1] : undefined;
        console.log(latestValue);
        return {
          ...device,
          latestSoilMoisture: latestValue,
          alarmLevel: getAlarmLevel(latestValue, threshold)
        };
      }));
      console.log(devices);
      // Filtern von Geräten, deren Bodenfeuchtigkeit unter dem Schwellenwert liegt
      devices = devices.filter(device => device.alarmLevel > 0);
      console.log(devices);
      devices.sort((a, b) => b.alarmLevel - a.alarmLevel);
    } catch (error) {
      console.error("Fehler beim Abrufen der Gerätedaten:", error);
    }
  });


  function getAlarmLevel(soilMoisture, threshold) {
  const difference = threshold - soilMoisture;
  if (difference >= 200) {
    return 2;
  } else if (difference >= 100) {
    return 1;
  }
  return 0;
}

</script>

<main style=" padding: 20px; padding-top: 100px; ">
    {#if devices.length === 0}
        <p>Keine Geräte mit Alarmstatus gefunden.</p>
        {:else}
        <h2>Geräte mit Alarmstatus</h2>
        <ul id='myList'>
        {#each devices as device}
        <li class={`alarm-level-${device.alarmLevel}`}>
        {device.DeviceName}: Bodenfeuchtigkeit {device.latestSoilMoisture}%
        - Alarmstufe {device.alarmLevel}
        </li>
        {/each}
        </ul>
        {/if}
  
  </main>
  <style>
    #myList {
        display: flex;
        flex-direction: column;
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
    border: 2px solid red; /* Roter Rahmen für Alarmstufe 2 */
    padding: 5px;
    margin: 5px 0;
  }
  </style>