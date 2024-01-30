<script>
  //   --------------Seitenweite Importe und Variablen--------------
  import axios from "axios";
  import { push } from "svelte-spa-router";
  import { onMount, onDestroy } from "svelte";
  import { Settings } from "lucide-svelte";
  import DeviceSettings from "./DeviceSettings.svelte";
  import Daten from "./lib/Daten.svelte";
  import { BugIcon, LeafIcon, BiohazardIcon } from "lucide-svelte";
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

  //   -----------------Ende Daten logik--------------

  //   -----------------Gesundheit logik----------------------
  let isLessThanFifteenChars = true;
  let pestsCache = null;
  let diseaseCache = null;

  let pestsClass = "";
  let diseaseClass = "";
  let decayClass = "";
  let cracksClass = "";
  //   -----------------Ende Gesundheit logik-----------------

  // -----------------Gallerie logik----------------------
  function updateImage(data) {
    base64Image = data;
    console.log(base64Image);
  }

  let bildstring = "";
  let showimage = false;

  let aiResponse = null;
  let pollingInterval = null;
  let bildarray = [];

  async function fetchLatestImage() {
    try {
      const result = await axios.post(
        "http://localhost:3000/get-mac-by-deviceID",
        { device: deviceId }
      );
      console.log("hoffentlich mac:", result.data);
      const response = await axios.post(
        "http://localhost:3000/api/getpicture",
        { device: result.data }
      );
      // console.log(response);
      bildarray = response.data;
      bildstring = response.data[0].data;
      showimage = true;
      // const base64_image = Buffer.from().toString("base64");
      // updateImage(response.data); // Verwenden der updateImage Funktion
      startPolling();
    } catch (error) {
      console.error("Fehler beim Abrufen des Bildes:", error);
    }
  }

  function startPolling() {
    pollingInterval = setInterval(async () => {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/getGPTresponse",
          { image: bildstring }
        );
        console.log(response);
        if (response.status === 200 && response.data) {
          if (
            response.data.Pests.length > 15 ||
            response.data.Disease.length > 15 ||
            response.data.Decay === "Yes" ||
            response.data.Cracks === "Yes"
          ) {
            isLessThanFifteenChars = false;
          }
          if (
            response.data.Pests != "No visible Pests" &&
            response.data.Pests.length > 15
          ) {
            pestsCache = response.data.Pests;
            response.data.Pests = "yes";
            pestsClass = "true";
            // document.getElementById("pest").classList.add("true");
          }
          if (
            response.data.Pests != "No visible Disease" &&
            response.data.Disease.length > 15
          ) {
            diseaseCache = response.data.Disease;
            response.data.Disease = "yes";
            diseaseClass = "true";
            // document.getElementById("disease").classList.add("true");
          }
          if (response.data.Decay === "Yes") {
            decayClass = "true";
            // document.getElementById("decay").classList.add("true");
          }
          if (response.data.Cracks === "Yes") {
            cracksClass = "true";
            // document.getElementById("cracks").classList.add("true");
          }
          aiResponse = response.data;
          clearInterval(pollingInterval); // Polling stoppen, wenn Antwort erhalten
        }
      } catch (error) {
        console.error("Fehler beim Polling der KI-Antwort:", error);
      }
    }, 15000); // Alle 5 Sekunden abfragen
  }
  onDestroy(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  });

  // -----------------Ende Gallerie logik----------------
  function run() {
    fetchLatestImage();
    // showimage = true;
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
    push(`/DeviceSettings?deviceId=${deviceId}`);
  }}
>
  <Settings></Settings>
</button>
<!-- <button on:click={debug}>debug</button> -->
{#if activeTab === "Daten"}
  <Daten></Daten>

  <!-- Inhalt für Gesundheit -->
{:else if activeTab === "Gesundheit"}
  <!-- <button on:click={fetchLatestImage}>Bild abrufen</button> -->
  {#if showimage}
    <img
      id="sdfghjk"
      src={`data:image/jpeg;base64,${bildstring}`}
      alt="Bild aus der API"
    />
    {#if aiResponse}
      <!-- <div class="health-tab"> -->

      <div id="buddycontainer">
        {#if isLessThanFifteenChars}
          <img id="buddy" src="BuddyHappy.svg" alt="Glückliches Gesicht" />
          <p>Im Moment scheint alles Gut zu sein</p>
        {:else}
          <img id="buddy" src="BuddySad.svg" alt="Trauriges Gesicht" />
          {#if pestsCache}
            <p>Schädlinge</p>
            <p>{pestsCache}</p>
          {/if}
          {#if diseaseCache}
            <p>Krankheit</p>
            <p>{diseaseCache}</p>
          {/if}
        {/if}
      </div>
      <div class="health-categories">
        <div class="category {pestsClass}" id="pest">
          <!-- <img src="path/to/your/pest-icon.png" alt="Schädlinge" /> -->
          <BugIcon size={40} />
          <!-- <span>Schädlinge</span> -->
          <span>{aiResponse.Pests}</span>
        </div>
        <div class="category {decayClass}" id="decay">
          <!-- <img src="path/to/your/leaf-icon.png" alt="Blätter" /> -->
          <LeafIcon size={40} />
          <!-- <span>Blätter</span> -->
          <span>{aiResponse.Decay}</span>
        </div>
        <div class="category {diseaseClass}" id="disease">
          <!-- <img src="path/to/your/rot-icon.png" alt="Fäule" /> -->
          <BiohazardIcon size={40} />
          <!-- <span>Fäule</span> -->
          <span>{aiResponse.Disease}</span>
        </div>
        <div class="category {cracksClass}" id="cracks">
          <img
            src="broken.svg"
            alt="Knicke"
            style="width: 40px; height: 40px;"
          />
          <!-- <span>Knicke</span> -->
          <span>{aiResponse.Cracks}</span>
        </div>
        <!-- </div> -->
      </div>
      <div id="recomonodation">
        <p>Empfehlung:</p>
        <p>{aiResponse.Recommendation}</p>
      </div>
    {/if}
  {:else}
    <p>Bild wird geladen...</p>
  {/if}
  <!-- Ihr Inhalt für Gesundheit -->
  <!-- Hier weiteere Inhalte -->
  <!-- Inhalt für Gallerie -->
{:else if activeTab === "Gallerie"}
  <!-- Ihr Inhalt für Gallerie -->
  <!-- {#if base64Image} -->
  <div class="gallery-grid">
    {#each bildarray as bild}
      <img
        src={`data:image/jpeg;base64,${bild.data}`}
        alt="Bild aus der Galerie"
      />
    {/each}
  </div>
  <!-- {:else}
    <p>Bild wird geladen...</p>
  {/if} -->
{/if}

<style>
  #sdfghjk {
    width: 80%;
    border-radius: 10px;
    margin-left: auto;
    margin-right: auto;
    object-fit: cover;
  }

  #buddycontainer {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-bottom: 30px;
    font-size: 20px;
    margin-left: 40px;
    margin-right: 40px;
  }
  #buddycontainer p {
    margin-top: 10px;
    margin-bottom: 0;
  }
  .health-categories {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
    margin: 40px;
    margin-top: 0;
    font-size: 20px;
  }

  #recomonodation {
    display: block;
    margin: 40px;
    margin-top: 0;
    padding: 10px;
    border-radius: 10px;
    padding-bottom: 100px;
    background-color: rgb(44, 50, 40);
    border: 2px solid grey;
    font-size: 20px;
  }

  .category {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 2px solid greenyellow;
    border-radius: 10px;
    background-color: rgb(224, 255, 181);
    color: black;
    font-weight: 600;
    padding: 10px;
    font-size: 20px;
  }

  #buddy {
    width: 100px;
    height: 100px;
    margin-bottom: -30px;
    font-size: 20px;
  }

  .gallery-grid {
    display: grid;
    margin: 32px;
    grid-template-columns: repeat(4, 1fr); /* Erzeugt ein 4-Spalten-Grid */
    grid-gap: 16px; /* Abstand zwischen den Bildern */
  }

  .gallery-grid img {
    width: 100%; /* Sorgt dafür, dass die Bilder die Zelle ausfüllen */
    border-radius: 8px; /* Optional: Für abgerundete Ecken */
  }

  #settingsbtn {
    position: fixed;
    z-index: 200005416985423985239520000;
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
    width: 70%;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 50px;
    min-height: 50px;
    margin-top: 100px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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
  .true {
    background-color: rgb(202, 101, 101);
    border: 2px solid red;
  }
</style>
