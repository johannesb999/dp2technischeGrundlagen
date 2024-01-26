<script>
  //   --------------Seitenweite Importe und Variablen--------------
  import axios from "axios";
  import {push} from "svelte-spa-router";
  import { Settings } from "lucide-svelte";
  import DeviceSettings from "./DeviceSettings.svelte";
  import Daten from "./lib/Daten.svelte";
  //   --------------Daten Importe und Variablen--------------

  let activeTab = "Daten";

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.hash.split("?")[1]);
  const deviceId = params.get("deviceId");
  console.log(deviceId);
  //   --------------Gesundheit Importe und Variablen--------------

  //   --------------Gallerie Importe und Variablen--------------
  let base64Image = ""; // Dies speichert den Base64-String des Bildes

  //   --------------Daten logik----------------------
  // onMount(() => {
  //   chartInstances["Humidity"] = echarts.init(
  //     document.getElementById("humidity-chart")
  //   );
  //   chartInstances["LDR"] = echarts.init(document.getElementById("ldr-chart"));
  //   chartInstances["SoilMoisture"] = echarts.init(
  //     document.getElementById("soilmoisture-chart")
  //   );
  //   chartInstances["Temperature"] = echarts.init(
  //     document.getElementById("temperature-chart")
  //   );
  //   // fetchLatestImage(); // Dies ruft das neueste Bild beim Laden der Komponente ab
  // });

  //   -----------------Ende Daten logik--------------

  //   -----------------Gesundheit logik----------------------

  //   -----------------Ende Gesundheit logik-----------------

  // -----------------Gallerie logik----------------------
  function updateImage(data) {
    base64Image = data;
    console.log(base64Image);
  }

  let bildstring = "";
  let showimage = false;

  async function fetchLatestImage() {
    try {
      const response = await axios.get("http://localhost:3000/api/getpicture");
      console.log(response);
      bildstring = response.data;
      showimage = true;
      // const base64_image = Buffer.from().toString("base64");
      // updateImage(response.data); // Verwenden der updateImage Funktion
    } catch (error) {
      console.error("Fehler beim Abrufen des Bildes:", error);
    }
  }

  // -----------------Ende Gallerie logik----------------
  function run() {
    // fetchDeviceData();
  }
  run();
</script>

<!-- Tabs für die Navigation -->
<div class="tabs">
  <div
    class={activeTab === "Daten" ? "tab active" : "tab"}
    on:click={() => {
      activeTab = "Daten";
    }}
  >
    Daten
  </div>
  <div
    class={activeTab === "Gesundheit" ? "tab active" : "tab"}
    on:click={() => (activeTab = "Gesundheit")}
  >
    Gesundheit
  </div>
  <div
    class={activeTab === "Gallerie" ? "tab active" : "tab"}
    on:click={() => (activeTab = "Gallerie")}
  >
    Gallerie
  </div>
</div>

<!-- Inhalt der Tabs -->
<!-- Inhalt für DatenTab -->
<button
  id="settingsbtn"
  on:click={() => {
    push(`/DeviceSettings?deviceId=${deviceId}`)
  }}
>
  <Settings></Settings>
</button>
{#if activeTab === "Daten"}
  <Daten></Daten>

  <!-- Inhalt für Gesundheit -->
{:else if activeTab === "Gesundheit"}
  <button on:click={fetchLatestImage}></button>
  {#if showimage}
    <img src={`data:image/jpeg;base64,${bildstring}`} alt="Bild aus der API" />
  {:else}
    <p>Bild wird geladen...</p>
  {/if}
  <!-- Ihr Inhalt für Gesundheit -->
  <div class="health-tab">
    <div class="status-message">
      <img src="frontend\src\assets\Buddylogo.svg" alt="Glückliches Gesicht" />
      <p>Im Moment scheint alles Gut zu sein</p>
    </div>
    <div class="health-categories">
      <div class="category">
        <img src="path/to/your/pest-icon.png" alt="Schädlinge" />
        <span>Schädlinge</span>
      </div>
      <div class="category">
        <img src="path/to/your/leaf-icon.png" alt="Blätter" />
        <span>Blätter</span>
      </div>
      <div class="category">
        <img src="path/to/your/rot-icon.png" alt="Fäule" />
        <span>Fäule</span>
      </div>
      <div class="category">
        <img src="path/to/your/kink-icon.png" alt="Knicke" />
        <span>Knicke</span>
      </div>
    </div>
    <!-- Hier weiteere Inhalte -->
  </div>
  <div><h1>Test</h1></div>
  <!-- Inhalt für Gallerie -->
{:else if activeTab === "Gallerie"}
  <!-- Ihr Inhalt für Gallerie -->
  {#if base64Image}
    <img
      src={`data:image/jpeg;base64,${base64Image}`}
      alt="Aktuelles Bild aus der API"
    />
  {:else}
    <p>Bild wird geladen...</p>
  {/if}
{/if}

<!-- <DeviceSettings></DeviceSettings> -->

<style>
  #settingsbtn {
    position: fixed;
    z-index: 200;
    right: 2%;
    top: 1.4rem;
    background-color: transparent;
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
</style>
