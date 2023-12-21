<script>
    import { onMount } from 'svelte';
    import axios from "axios";
    import * as echarts from "echarts";

    let queryUserID = '';
    let chartInstances = {};

    onMount(() => {
        chartInstances['Humidity'] = echarts.init(document.getElementById('humidity-chart'));
        chartInstances['LDR'] = echarts.init(document.getElementById('ldr-chart'));
        chartInstances['SoilMoisture'] = echarts.init(document.getElementById('soilmoisture-chart'));
        chartInstances['Temperature'] = echarts.init(document.getElementById('temperature-chart'));
    });

    async function fetchDeviceData() {
        try {
            const response = await axios.post('http://localhost:3001/device-data', { queryUserID });
            if(response.data) {
                Object.keys(response.data).forEach((key) => {
                    const data = response.data[key].map((value, index) => ({
                        value,
                        name: index.toString()
                    }));
                    let nicedata = data.slice(0, 10);
                    let reallynicedata = nicedata.reverse();
                    console.log(data);
                    setChartData(key, reallynicedata);
                });
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Gerätedaten:', error);
        }
    }

    function setChartData(chartKey, data) {
        const colorMap = {
            'Humidity': '#80FFA5',
            'LDR': '#00DDFF',
            'SoilMoisture': '#37A2FF',
            'Temperature': '#FF0087'
        };

        let gradientColor = new echarts.graphic.LinearGradient(
            0, 0, 0, 1,
            [
                {offset: 0, color: colorMap[chartKey]},   // Farbe am Anfang
                {offset: 1, color: 'white'}               // Farbe am Ende
            ]
        );

        let option = {
            title: {
                text: `${chartKey} Data`
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.map(item => item.name)
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                name: chartKey,
                data: data.map(item => item.value),
                type: 'line',
                areaStyle: { normal: { color: gradientColor } },
                emphasis: {
                    focus: 'series'
                },
            }]
        };

        chartInstances[chartKey].setOption(option);
    }
</script>

<div>
    <input type="text" bind:value={queryUserID} placeholder="User ID für Gerätedaten" />
    <button on:click={fetchDeviceData}>Gerätedaten abrufen</button>
</div>

<div id="humidity-chart" style="width: 600px; height: 400px;"></div>
<div id="ldr-chart" style="width: 600px; height: 400px;"></div>
<div id="soilmoisture-chart" style="width: 600px; height: 400px;"></div>
<div id="temperature-chart" style="width: 600px; height: 400px;"></div>
