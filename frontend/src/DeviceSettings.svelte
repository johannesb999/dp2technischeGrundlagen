<script>

    import axios from "axios";

    import Radio from './lib/Radio.svelte';
    
    
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.hash.split('?')[1]);
    const deviceId = params.get('deviceId');

    let newDeviceName = null;
    let newLocation = null;
    let originalDeviceName = "kek";
    let originalLocation = null;

    const options = [{
		value: 'Innen',
		label: 'Innen',
	}, {
		value: 'Außen',
		label: 'Außen',
	}]
    let radioValue;



    async function getDevice() {
        try {
            const response = await axios.post('http://localhost:3001/device-setting', { deviceId });
            console.log(response);
            originalDeviceName = response.data.DeviceName;
            radioValue = response.data.location;
            originalLocation = response.data.location;
            console.log(originalDeviceName,originalLocation);
        } catch (error) {
            console.error("Gerät konnte nicht gefunden werden", error);
        }
    }

    async function updateDevice() {
        let updatedDevice = {};

    // Prüfe, ob sich originalDeviceName von newDeviceName unterscheidet
    if (newDeviceName && newDeviceName.trim() !== "" && originalDeviceName !== newDeviceName) {
        console.log("Name hat sich geändert", newDeviceName);
        updatedDevice.newDeviceName = newDeviceName;
    } else {
        console.log("Name hat sich nicht geändert", originalDeviceName);
        // Verwenden Sie den originalDeviceName, wenn kein neuer Name eingegeben wurde
        updatedDevice.newDeviceName = originalDeviceName;
    }

    // Prüfe, ob sich originalLocation von radioValue unterscheidet
    if (originalLocation !== radioValue) {
        console.log("standort hat sich geändert", radioValue);
        updatedDevice.newLocation = radioValue;
    } else {
        console.log("standort hat sich nicht geändert", originalLocation);
        updatedDevice.newLocation = originalLocation;
    }

    // Überprüfe, ob es Aktualisierungen gibt
    if (Object.keys(updatedDevice).length === 0) {
        console.log("Keine Aktualisierungen erforderlich.");
        return;
    }

    try {
        console.log(updatedDevice);
        return;
        const response = await axios.post('http://localhost:3001/update-device', {
            deviceId,
            ...updatedDevice
        });
        console.log("Gerät aktualisiert: ", response.data);
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Geräts", error);
    }
    }


    function run() {
        getDevice();
    }
    run();
</script>




<main>

    <form on:submit|preventDefault={updateDevice}>
        <div class='box'>
            <label for='DeviceName'>Gerätename:</label>
            <input placeholder={originalDeviceName} id='DeviceName' type='text' bind:value={newDeviceName}>
        </div>
        <div class='box'>
            <Radio {options} fontSize={22} legend='Gerätestandort:' bind:userSelected={radioValue}/>
        </div>
        <button type='submit'>Ok</button>
    </form>
    <p>
        {radioValue} is selected
    </p>
    <!-- <div>
        <label></label>
        <input>
    </div>

    <div>
        <label></label>
        <input>
    </div> -->

</main>




<style>
    main {
        width: 96vw;
            padding-top: 100px;
        /* border: 2px solid pink; */
    }
    form {
        width:100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .box {
        width: 80%;
        font-size: 22px;
        /* border: 2px solid green; */
        display: flex;
        flex-direction: column;
        margin-bottom: 5rem;
    }

    label {
    margin-bottom: 0.5rem;
  }

  #DeviceName {
    width: 93%;
    height: 2rem;
    font-size: 20px;
    padding: 0.5rem;
    border: 1px solid #000000;
    border-radius: 0.5rem;
  } 

</style>