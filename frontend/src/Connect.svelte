<script>
  import axios from "axios";

  import Radio from "./lib/Radio.svelte";
  import { push } from "svelte-spa-router";

  let deviceConnected = false;

  let DeviceName = null;
  let plantspecies = null;

  const options = [
    {
      value: "Innen",
      label: "Innen",
    },
    {
      value: "Außen",
      label: "Außen",
    },
  ];
  let radioValue;

  let uniqueDeviceID = "";
  function button(uniqueDeviceID) {
    return uniqueDeviceID == "";
  }
  $: sxdcfvgbhnjmk = DeviceName !== "" && plantspecies !== "";

  async function connectDevice() {
    if (uniqueDeviceID != "") {
      try {
        const response = await axios.post(
          "http://localhost:3001/connect-device",
          { uniqueDeviceID }
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
    const connectDevice = { DeviceName, Location, plantspecies };

    try {
      const response = await axios.post(
        "http://localhost:3000/initialize-device",
        {
          uniqueDeviceID,
          ...connectDevice,
        }
      );
      console.log("Gerät aktualisiert: ", response.data);
      push("/Home");
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Geräts", error);
    }
  }

  function run() {}
  run();
</script>

<main>
  {#if !deviceConnected}
    <h1>Verbinde dein Gerät</h1>
    <div id="macadress">
      <label for="deviceID">DeviceID</label>
      <input id="deviceID" type="text" bind:value={uniqueDeviceID} />
    </div>
    <button
      id="connectbtn"
      on:click={connectDevice}
      disabled={button(uniqueDeviceID)}>Verbinden</button
    >
  {:else}
    <h1>Richte dein Gerät ein</h1>
    <form on:submit|preventDefault={initialize}>
      <div id="testbox">
        <label for="DeviceName" style="font-size:22px;">Gerätename:</label>
        <input
          placeholder={"Gerätename"}
          id="DeviceName"
          type="text"
          bind:value={DeviceName}
        />
      </div>
      <div id="testbox">
        <label for="species" style="font-size:22px;">Pflanzenart:</label>
        <input
          placeholder={"Pflanzenart"}
          id="DeviceName"
          type="text"
          bind:value={plantspecies}
        />
      </div>
      <div class="box">
        <Radio
          {options}
          fontSize={22}
          legend="Gerätestandort:"
          bind:userSelected={radioValue}
        />
      </div>
      <button id="submitbtn" disabled={!sxdcfvgbhnjmk} type="submit">Ok</button>
    </form>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    padding-top: 200px;
  }

  #macadress {
    width: 85%;
    display: flex;
    flex-direction: column;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* width: %; */
  }
  .box {
    /* border: 2px solid red; */
    width: 93%;
  }

  #testbox {
    width: 93%;
  }
  #submitbtn {
    margin-top: 50px;
    width: 93%;
  }

  #connectbtn {
    width: 86%;
    margin-top: 2rem;
  }
  #DeviceName {
    width: 93%;
    margin-top: 0.5rem;
    margin-bottom: 2rem;
  }
</style>
