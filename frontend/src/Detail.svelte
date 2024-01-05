<script>
  //   --------------Seitenweite Importe und Variablen--------------
  import { onMount } from "svelte";
  import axios from "axios";
  //   --------------Daten Importe und Variablen--------------
  import * as echarts from "echarts";
  let chartInstances = {};
  let activeTab = "Daten";

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.hash.split('?')[1]);
  const deviceId = params.get('deviceId');
  console.log(deviceId);
  //   --------------Gesundheit Importe und Variablen--------------

  //   --------------Gallerie Importe und Variablen--------------
  let base64Image = ""; // Dies speichert den Base64-String des Bildes

  //   --------------Daten logik----------------------
  onMount(() => {
    chartInstances["Humidity"] = echarts.init(
      document.getElementById("humidity-chart")
    );
    chartInstances["LDR"] = echarts.init(document.getElementById("ldr-chart"));
    chartInstances["SoilMoisture"] = echarts.init(
      document.getElementById("soilmoisture-chart")
    );
    chartInstances["Temperature"] = echarts.init(
      document.getElementById("temperature-chart")
    );
    // fetchLatestImage(); // Dies ruft das neueste Bild beim Laden der Komponente ab
  });

  async function fetchDeviceData() {
    try {
      console.log("fetching data");
      const response = await axios.post("http://localhost:3001/device-data", {
        deviceId,
      });
      if (response.data) {
        Object.keys(response.data).forEach((key) => {
          const data = response.data[key].map((value, index) => ({
            value,
            name: index.toString(),
          }));
          let nicedata = data.slice(0, 10);
          let reallynicedata = nicedata.reverse();
          console.log(data);
          setChartData(key, reallynicedata);
        });
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Gerätedaten:", error);
    }
  }

  function setChartData(chartKey, data) {
    const colorMap = {
      Humidity: "#80FFA5",
      LDR: "#00DDFF",
      SoilMoisture: "#37A2FF",
      Temperature: "#FF0087",
    };

    let gradientColor = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: colorMap[chartKey] }, // Farbe am Anfang
      { offset: 1, color: "white" }, // Farbe am Ende
    ]);

    let option = {
      title: {
        text: `${chartKey} Data`,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985",
          },
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data.map((item) => item.name),
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: chartKey,
          data: data.map((item) => item.value),
          type: "line",
          areaStyle: { normal: { color: gradientColor } },
          emphasis: {
            focus: "series",
          },
        },
      ],
    };

    chartInstances[chartKey].setOption(option);
  }
  //   -----------------Ende Daten logik--------------

  //   -----------------Gesundheit logik----------------------

  //   -----------------Ende Gesundheit logik-----------------

  //   -----------------Gallerie logik----------------------
  // function updateImage(data) {
  //   base64Image = data;
  //   console.log(base64Image);
  // }

  // async function fetchLatestImage() {
  //   try {
  //     const response = await axios.get("http://localhost:3000/api/getpicture");

  //     updateImage(response.data); // Verwenden der updateImage Funktion
  //     console.log(base64Image);
  //   } catch (error) {
  //     console.error("Fehler beim Abrufen des Bildes:", error);
  //   }
  // }

  //   -----------------Ende Gallerie logik----------------
  function run() {
    fetchDeviceData();
  }
  run();
</script>

<!-- Tabs für die Navigation -->
<div class="tabs">
  <div
    class={activeTab === "Daten" ? "tab active" : "tab"}
    on:click={() => (activeTab = "Daten")}
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
{#if activeTab === "Daten"}

  <div id="humidity-chart" style="width: 600px; height: 400px;"></div>
  <div id="ldr-chart" style="width: 600px; height: 400px;"></div>
  <div id="soilmoisture-chart" style="width: 600px; height: 400px;"></div>
  <div id="temperature-chart" style="width: 600px; height: 400px;"></div>
  <!-- Inhalt für Gesundheit -->
{:else if activeTab === "Gesundheit"}
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
    <img src={base64Image} alt="Aktuelles Bild aus der API" />
  {:else}
    <p>Bild wird geladen...</p>
  {/if}{/if}

<style>
  .active {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .tabs {
    display: flex;
    justify-content: space-between;
    padding: 1px;
    background: #000000;
  }
  .tab {
    padding: 10px;
    cursor: pointer;
  }
  .active {
    background: #9a9a9a;
  }
</style>
