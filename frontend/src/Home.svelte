<script>
  import axios from "axios";
  import Device from "./lib/Device.svelte";
  import {Plus} from 'lucide-svelte';

  let devices = [];

  async function getDevices() {
    console.log("tester")
    try {
      const response = await axios.post("http://localhost:3001/get-devices");
      console.log(response);
      devices = response.data;
    } catch (error) {
      console.error("Der Nutzer hate keine verbundenen Geräte", error)
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

<!-- Felder zur Geräteverbindung -->
<main>
  {#each devices as device}
    <Device {device}/> 
  {/each}
  <!-- Feld zur Abfrage von Gerätedaten -->
  <button id='newDevice' on:click={connectDevice}>
    <Plus size='40'></Plus>
  </button>
  
</main>
  
<style>

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
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
</style>
