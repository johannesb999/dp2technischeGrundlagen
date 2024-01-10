<script>
  import axios from "axios";
  import Header from "./lib/Header.svelte";
  import Device from "./lib/Device.svelte";
  import {Plus} from 'lucide-svelte';

  let devices = [];
  let autherdevices = [];
  let innerdevices = [];
  let activeTab = "Alle";

  async function getDevices() {
    console.log("tester")
    try {
      const response = await axios.post("http://localhost:3001/get-devices");
      // console.log(response);
      devices = response.data;
      console.log(devices);
      autherdevices = devices.filter(device => device.location == "Außen");
      innerdevices = devices.filter(device => device.location == "Innen");
    } catch (error) {
      console.error("Der Nutzer hate keine verbundenen Geräte", error);
      window.location.href = '#/Login'
    }
  }

  function connectDevice() {
    window.location.href = '#/Connect';
  }

  function run() {
    getDevices();
  }
  run();
</script>

<div class="tabs">
  <div
    class={activeTab === "Alle" ? "tab active" : "tab"}
    on:click={() => (activeTab = "Alle")}
  >
    Alle
  </div>
  <div
    class={activeTab === "Innen" ? "tab active" : "tab"}
    on:click={() => (activeTab = "Innen")}
  >
    Innen
  </div>
  <div
    class={activeTab === "Außen" ? "tab active" : "tab"}
    on:click={() => (activeTab = "Außen")}
  >
    Außen
  </div>
</div>

<!-- Felder zur Geräteverbindung -->


{#if activeTab === "Alle"}
<main class='kjhgfd'>
  {#each devices as device}
    <Device {device}/> 
  {/each}
  <!-- Feld zur Abfrage von Gerätedaten -->
  <button id='newDevice' on:click={connectDevice}>
    <Plus size='40'></Plus>
  </button>
</main>

  {:else if activeTab === "Innen"}
<main class='kjhgfd'>
  {#each innerdevices as device}
    <Device {device}/> 
  {/each}
  <!-- Feld zur Abfrage von Gerätedaten -->
  <button id='newDevice' on:click={connectDevice}>
    <Plus size='40'></Plus>
  </button>
</main>

  {:else if activeTab === "Außen"}
  <main class='kjhgfd'>
    {#each autherdevices as device}
      <Device {device}/> 
    {/each}
    <!-- Feld zur Abfrage von Gerätedaten -->
    <button id='newDevice' on:click={connectDevice}>
      <Plus size='40'></Plus>
    </button>
  </main>
  
  {/if}
  
<style>

  .kjhgfd {
    /* margin-top: 100px; */
    max-height: auto;
    /* border: 2px solid pink; */
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding:20px;
    padding-bottom: 80px;
    padding-top: 50px;
  }
  
  button {
    margin: 1rem;
    padding: 0.5rem;
    border: 1px solid #000000;
    border-radius: 0.5rem;
  }
  #newDevice {
    border-radius: 100px;
    text-align: center;
    display: flex;
    width: fit-content;
  }

  .active {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .tabs {
    width:70%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 100px;
    min-height: 50px;
    /* margin: px; */
    /* margin-top: 20px; */
    display: grid;
    grid-template-columns: repeat(3,1fr);
    /* display: flex;
    justify-content: space-around; */
    padding: 1px;
    background: #161616;
    border-radius: 100px;
    overflow: hidden;
  }
  .tab {
    /* border: 2px solid red; */
    padding: 10px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    /* margin-left: auto;
    margin-right: auto; */
  }
  .active {
    background: #9a9a9a;
    color: black;
    /* text-decoration: underline; */
  }
</style>
