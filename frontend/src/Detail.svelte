<script>
  //   --------------Seitenweite Importe und Variablen--------------
  import { onMount } from "svelte";
  import axios from "axios";
  import {Settings} from 'lucide-svelte';
  import DeviceSettings from './DeviceSettings.svelte';
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
  onMount(() => {
    initializeCharts();
  });
  function initializeCharts() {
    if (!chartInstances["Humidity"]) {
      chartInstances["Humidity"] = echarts.init(document.getElementById("humidity-chart"));
    }
    if (!chartInstances["LDR"]) {
      chartInstances["LDR"] = echarts.init(document.getElementById("ldr-chart"));
    }
    if (!chartInstances["SoilMoisture"]) {
      chartInstances["SoilMoisture"] = echarts.init(document.getElementById("soilmoisture-chart"));
    }
    if (!chartInstances["Temperature"]) {
      chartInstances["Temperature"] = echarts.init(document.getElementById("temperature-chart"));
    }
    console.log(chartInstances);
}

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
          // console.log(data);
          setChartData(key, reallynicedata);
        });
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Gerätedaten:", error);
      window.location.href='./';
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
          smooth: true, // Glättet die Linie
          lineStyle: {
            width: 2,
            color: '#42A5F5' // Blaue Farbe für die Linie
          },
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
    on:click={() => {
      (activeTab = "Daten")
      // initializeCharts();
      // if (!chartInstances["Humidity"]) {
      chartInstances["Humidity"].resize(document.getElementById("humidity-chart"));
    // }
    // if (!chartInstances["LDR"]) {
      chartInstances["LDR"].resize(document.getElementById("ldr-chart"));
    // }
    // if (!chartInstances["SoilMoisture"]) {
      chartInstances["SoilMoisture"].resize(document.getElementById("soilmoisture-chart"));
    // }
    // if (!chartInstances["Temperature"]) {
      chartInstances["Temperature"].resize(document.getElementById("temperature-chart"));
    // }
    //   setTimeout(() => {
    //   // Rufen Sie resize für jede Chart-Instanz auf
    //   Object.values(chartInstances).forEach(chartInstance => {
    //     if (chartInstance) {
    //       console.log(chartInstance);
    //       chartInstance.resize(document.getElementById("humidity-chart"));
    //     }
    //   });
    // }, 0);
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
<button id='settingsbtn' on:click={()=>{window.location.href = `#/DeviceSettings?deviceId=${deviceId}`}}>
  <Settings></Settings>
</button>
{#if activeTab === "Daten"}
<div id='chartcontainer'>  
  <div class='chart' id="humidity-chart"></div>
  <div class='chart' id="ldr-chart"></div>
  <div class='chart' id="soilmoisture-chart"></div>
  <div class='chart' id="temperature-chart"></div>
</div>
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
  <!-- <DeviceSettings></DeviceSettings> -->

<style>
  #chartcontainer {
    height: auto;
    margin-top: 50px;
    padding-bottom: 80px;
  }
  #settingsbtn {
    position: fixed;
    z-index: 200;
    right: 2%;
    top: 1.5%;
    background-color: transparent;
  }
  .active {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #9a9a9a;
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
    background: #161616;
    border-radius: 100px;
    overflow: hidden;
  }
  .tab {
    padding: 10px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
.chart {
  padding: 0;
  margin-top: 10px;
  margin-left: auto;
  margin-right: auto;
  width: 90vw;
  height: 300px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
}

</style>
