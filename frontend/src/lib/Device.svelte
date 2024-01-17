<script>
    import axios from 'axios';

    import {currentRoute} from '../svelte-store';

      export let device;
      let latestSoilMoisture;
      let alarmLevel;
    //   let devices = [];
    const threshold = 2700;
    
      console.log("device:", device);
      
      
      console.log("device:", device._id);
      async function fetchData() {
        const measurementsResponse = await axios.post("http://localhost:3001/device-data", {
            deviceId: device._id,
        })
        console.log(measurementsResponse);
        const soilMoistureData = measurementsResponse.data && measurementsResponse.data['SoilMoisture']
          ? measurementsResponse.data['SoilMoisture']
          : [];
          console.log(soilMoistureData);
        const latestValue = soilMoistureData.length > 0 ? soilMoistureData[soilMoistureData.length - 1] : undefined;
        console.log(latestValue);
          latestSoilMoisture = latestValue,
          alarmLevel = getAlarmLevel(latestValue, threshold)
      }
      function getAlarmLevel(soilMoisture, threshold) {
        const difference = threshold - soilMoisture;
        if (difference >= 200) {
            return "dringend gießen";
        } else if (difference >= 100) {
            return "bite gießen";
        }
        return "Top Zustand";
      }
      
      function linkPage() {
        currentRoute.set('/Detail');
        window.location.href = `#/Detail?deviceId=${device._id}`;
    }

    async function run() {
        const hgfdes = await fetchData();
        console.log(hgfdes);
    }
    run();
    </script>




<device  on:click={linkPage} >
    <div id="data-div">
        <span>{latestSoilMoisture}</span>
    </div>
    <img src='ZebraPflanze.png' alt='Pflanze'>
    <div id='wrapper'>
        <span>{device.DeviceName}</span>
        <span>{alarmLevel}</span>
    </div>
</device>





<style>
    device {
        background-color: rgb(68, 67, 67);
        border-radius: 10px;
        width: 100%;
        padding: 0;
        margin-bottom: 2rem;
        position: relative;
    }
    #data-div {
        background-color: black;
        font-weight: bold;
        font-size: larger;
        color: white;
        /* border: 2px solid red; */
        position: absolute;
        bottom: 2.5rem;
        right: 0;
        z-index:5;
    }
    #wrapper {
        padding-left: 2rem;
        padding-right: 2rem;
        padding-bottom: 10px;
        display: flex;
        justify-content: space-between;
    }
    img {
        width: 100%;
    }
</style>