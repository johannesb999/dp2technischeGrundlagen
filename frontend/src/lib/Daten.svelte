<script>
  import { onMount } from "svelte";
  import * as echarts from "echarts";
  import axios from "axios";
  let chartInstances = {};

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.hash.split("?")[1]);
  const deviceId = params.get("deviceId");
  console.log(deviceId);

  onMount(() => {
    initializeCharts();
  });
  function initializeCharts() {
    if (!chartInstances["Humidity"]) {
      chartInstances["Humidity"] = echarts.init(
        document.getElementById("humidity-chart")
      );
    }
    if (!chartInstances["LDR"]) {
      chartInstances["LDR"] = echarts.init(
        document.getElementById("ldr-chart")
      );
    }
    if (!chartInstances["SoilMoisture"]) {
      chartInstances["SoilMoisture"] = echarts.init(
        document.getElementById("soilmoisture-chart")
      );
    }
    if (!chartInstances["Temperature"]) {
      chartInstances["Temperature"] = echarts.init(
        document.getElementById("temperature-chart")
      );
    }
    console.log(chartInstances);
  }

  async function fetchDeviceData() {
    try {
      console.log("fetching data");
      const response = await axios.post("http://localhost:3000/device-data", {
        deviceId,
      });
      if (response.data) {
        console.log(response.data);
        Object.keys(response.data).forEach((key) => {
          console.log(key);
          const data = response.data[key].map((value, index) => ({
            value,
            name: index.toString(),
          }));
          let nicedata = data.slice(data.length - 11, data.length - 1);
          let reallynicedata = nicedata.reverse();
          console.log(reallynicedata);
          setChartData(key, reallynicedata);
        });
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Gerätedaten:", error);
      window.location.href = "./";
    }
  }

  const yAxisRanges = {
    Humidity: { min: 0, max: 100 },
    LDR: { min: 0, max: 1000 },
    SoilMoisture: { min: 0, max: 100 },
    Temperature: { min: 0, max: 50 },
  };

  function setChartData(chartKey, data) {
    const yAxisRange = yAxisRanges[chartKey];
    const colorMap = {
      Humidity: "#80FFA5",
      Temperature: "#FF0087",
      SoilMoisture: "#37A2FF",
      LDR: "yellow",
    };

    let gradientColor = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 1, color: colorMap[chartKey] }, // Farbe am Anfang
      { offset: 1, color: "white" }, // Farbe am Ende
    ]);

    let option = {
      title: {
        text: `${chartKey}`,
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
        // data: data.map((item) => item.name),
        data: +1,
      },
      yAxis: {
        type: "value",
        min: yAxisRange.min,
        max: yAxisRange.max,
      },
      series: [
        {
          smooth: true, // Glättet die Linie
          lineStyle: {
            width: 2,
            color: "grey", // Blaue Farbe für die Linie
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

  function run() {
    fetchDeviceData();
  }
  run();
</script>

<div id="chartcontainer">
  <div class="chart" id="humidity-chart"></div>
  <div class="chart" id="temperature-chart"></div>
  <div class="chart" id="soilmoisture-chart"></div>
  <div class="chart" id="ldr-chart"></div>
</div>

<style>
  #chartcontainer {
    height: auto;
    margin-top: 0px;
    padding-bottom: 80px;
  }
  .chart {
    padding: 0;
    margin-top: 10px;
    padding: 10px;
    padding-bottom: 0;
    margin-bottom: 30px;
    margin-left: auto;
    margin-right: auto;
    width: 90vw;
    height: 300px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    background-color: rgb(44, 50, 40);
    border-radius: 15px;
  }
</style>
