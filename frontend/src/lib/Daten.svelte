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
          let nicedata = data.slice(0, 10);
          let reallynicedata = nicedata.reverse();
          console.log(reallynicedata);
          // console.log(data);
          setChartData(key, reallynicedata);
        });
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Gerätedaten:", error);
      window.location.href = "./";
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
            color: "#42A5F5", // Blaue Farbe für die Linie
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
    <div class="chart" id="ldr-chart"></div>
    <div class="chart" id="soilmoisture-chart"></div>
    <div class="chart" id="temperature-chart"></div>
</div>



<style>
  #chartcontainer {
    height: auto;
    margin-top: 50px;
    padding-bottom: 80px;
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