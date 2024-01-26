<script>
    import axios from 'axios';

    import {currentRoute} from '../svelte-store';  
    import { push } from "svelte-spa-router";

      export let device;
      let alarmLevel;
      const threshold = 2700;
    
      console.log("device:", device);
      
      
      console.log("device:", device._id);
        let latestValues = {};
        let alarmLevels = {};

        async function fetchData() {
        try {
            const measurementsResponse = await axios.post("http://localhost:3001/device-data", {
                deviceId: device._id,
            });
        console.log(measurementsResponse);

        // Iterieren über alle Schlüssel in den Daten
        for (const [key, values] of Object.entries(measurementsResponse.data)) {
        const latestValue = values.length > 0 ? values[values.length - 1] : undefined;
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
        currentRoute.set('/Detail');
        push(`/Detail?deviceId=${device._id}`);
    }

    async function run() {
        const hgfdes = await fetchData();
        console.log(hgfdes);
    }
    run();
    let orderedKeys = ['SoilMoisture', 'LDR', 'Temperature', 'Humidity'];
    function formatValue(value) {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return 'N/A'; // oder ein anderer Platzhalterwert
  }
</script>




<button  on:click={linkPage} >
    <img src='ZebraPflanze.png' alt='Pflanze'>
    <div>
        <span id='status'>{alarmLevel}</span>
        <div id='buddy' ></div>
    </div>
    <div id="data-div">
            <span>{device.DeviceName}</span>
            <div id='text-div'>
                {#each orderedKeys as schluessel}
                <p>{formatValue(latestValues[schluessel])}</p>
                {/each}
            </div>
    </div>
</button>





<style>
    button {
        background-color: rgb(68, 116, 58);
        border-radius: 10px;
        width: 100%;
        height: 130px;
        padding: 0;
        margin-bottom: 2rem;
        position: relative;
        border-radius: 10px;
    }
    p {
        margin: 0;
    }
    #text-div{
        display: flex;
        justify-content: end;
        gap: 25px;
        width:100%;
    }
    #status {
        position: absolute;
        z-index: 1023;
        top: -1px;
        padding: 4px;
        color: black;
        left: 0;
        border-top-left-radius: 10px;
        background-color: rgb(68, 116, 58);
    }
    #data-div {
        padding-left: 5px;
        padding-right: 5px;
        background-color: rgb(68, 116, 58);
        color: rgb(0, 0, 0);
        z-index: 123344;
        /* border: 2px solid green; */
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
        display: flex;
        gap: 15px;
        height: fit-content;
        align-items: center;
        padding-bottom: 4px ;
        right: 0;
    }
    #data-div span{
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