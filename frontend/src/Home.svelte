<script>
  import axios from "axios";
  import Device from "./lib/Device.svelte";
  import {Plus} from 'lucide-svelte';
  import {ListChecks} from 'lucide-svelte';
  import {currentRoute, loggedIn} from './svelte-store';
  import { push } from "svelte-spa-router";
  import Devicemin from "./lib/Devicemin.svelte";

  let devices = [];
  let autherdevices = [];
  let innerdevices = [];
  let activeTab = "Alle";
  let min = false;

  async function getDevices() {
    console.log("tester")
    try {
      const response = await axios.post("http://localhost:3000/get-devices");
      // console.log(response);
      devices = response.data;
      console.log(devices);
      autherdevices = devices.filter(device => device.location == "Außen");
      innerdevices = devices.filter(device => device.location == "Innen");
    } catch (error) {
      console.error("Der Nutzer hate keine verbundenen Geräte", error);
      // window.location.href = '#/Login'
      push('/Login');
      loggedIn.update(prev => false);
      currentRoute.set('/Login');
    }
  }

  function run() {
    getDevices();
    currentRoute.set('/Home');
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

<button id='toggle' on:click={() =>{min = !min}}><ListChecks /></button>
{#if activeTab === "Alle"}
<main class='kjhgfd'>
  {#each devices as device}
    {#if !min}
      <Device {device}/>
    {:else}
      <Devicemin {device}></Devicemin>
    {/if}
  {/each}
  <!-- Feld zur Abfrage von Gerätedaten -->
  <!-- <button id='newDevice' on:click={connectDevice}>
    <Plus size='40'></Plus>
  </button> -->
</main>

  {:else if activeTab === "Innen"}
<main class='kjhgfd'>
  {#each innerdevices as device}
    <Device {device}/> 
  {/each}
  <!-- Feld zur Abfrage von Gerätedaten -->
  <!-- <button id='newDevice' on:click={connectDevice}>
    <Plus size='40'></Plus>
  </button> -->
</main>

  {:else if activeTab === "Außen"}
  <main class='kjhgfd'>
    {#each autherdevices as device}
      <Device {device}/> 
    {/each}
    <!-- Feld zur Abfrage von Gerätedaten -->
  </main>
  
  {/if}
  <button id='newDevice' on:click={()=> {push('/Connect')}}>
    <Plus size='40'></Plus>
  </button>
  
<style>
  #toggle{
    display: flex;
    width: fit-content;
    height: fit-content;
    position: absolute;
    right: 5px;
    top: 92px;
  }

  .tabs {
    display: flex;
    justify-content: space-around;
    padding-left: 20px;
    padding-right: 20px;
    font-size: 18px;
  }
  .tabs {
    width:70%;
    margin-left: auto;
    margin-right: auto;
    min-height: 50px;
    margin-top: 100px;
    display: grid;
    grid-template-columns: repeat(3,1fr);
    padding: 1px;
    overflow: hidden;
  }
  .tab {
    padding: 10px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .active {
    border-bottom: 2px solid greenyellow;
  }

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
    padding-top: 30px;
  }
  
  button {
    margin: 1rem;
    padding: 0.5rem;
    border: 1px solid #000000;
    border-radius: 0.5rem;
  }
  #newDevice {
    position: fixed;
    right:10px;
    bottom: 80px;
    border-radius: 10px;
    text-align: center;
    display: flex;
    width: fit-content;
    background-color: rgba(156, 187, 118);
    border: 1px solid #393739;
    box-shadow: -2px 2px 10px #393739;
  }

</style>
