<script>
    import axios from "axios";

    import Radio from "./lib/Radio.svelte";
  

    let deviceConnected = false;

    let DeviceName = null;

    const options = [{
		value: 'Innen',
		label: 'Innen',
	}, {
		value: 'Außen',
		label: 'Außen',
	}]
    let radioValue;



    let uniqueDeviceID = "";
    function button(uniqueDeviceID) {
				return uniqueDeviceID == ''
			}
  
    async function connectDevice() {
      if (uniqueDeviceID != "") {
        try {
          const response = await axios.post("http://localhost:3001/connect-device",{uniqueDeviceID}
          );
          console.log("Gerät verbunden:", response);
          deviceConnected = true;
        } catch (error) {
          console.error("Fehler beim Verbinden des Geräts:", error);
        }
      }
    }

    async function initialize() {
        let Location = radioValue;
        console.log(uniqueDeviceID);
        const connectDevice = {DeviceName, Location};

        try {
            const response = await axios.post('http://localhost:3001/initialize-device', {
                uniqueDeviceID,
                ...connectDevice
            });
            console.log("Gerät aktualisiert: ", response.data);
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Geräts", error);
        }
    }
    
    function run() {
      
    }
    run();
  </script>
 
  <main>
    {#if !deviceConnected}
    <h1>Verbinde dein PlantMonit Gerät</h1>
    <div>
      <label for='deviceID'>DeviceID</label>
      <input id='deviceID' type='text' bind:value={uniqueDeviceID}>
    </div>
    <button on:click={connectDevice} disabled={button(uniqueDeviceID)}>Verbinden</button>
  {:else}
    <div>
      <h1>Richte dein Gerät ein</h1>
      <form on:submit|preventDefault={initialize}>
        <div class='box'>
            <label for='DeviceName'>Gerätename:</label>
            <input placeholder={"Gerätename"} id='DeviceName' type='text' bind:value={DeviceName}>
        </div>
        <div class='box'>
            <Radio {options} fontSize={22} legend='Gerätestandort:' bind:userSelected={radioValue}/>
        </div>
        <button type='submit'>Ok</button>
      </form>
    </div>
  {/if}
  </main>
    
  <style>
  
    main {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px;
      padding-top: 100px;
    }

    input {
      width: 93%;
      height: 2rem;
      font-size: 20px;
      padding: 0.5rem;
      border: 1px solid #000000;
      border-radius: 0.5rem;
    }
  </style>
  