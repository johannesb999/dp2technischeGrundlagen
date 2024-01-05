<script>

    import axios from "axios";

    import Radio from './lib/Radio.svelte';
    
    
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.hash.split('?')[1]);
    const deviceId = params.get('deviceId');

    let newDeviceName = null;
    let newLocation = null;
    let originalDeviceName = null;

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
        } catch (error) {
            console.error("Gerät konnte nicht gefunden werden", error);
        }
    }

    async function updateDevice() {
        newLocation = radioValue;
        const updatedDevice = {newDeviceName, newLocation};

        try {
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