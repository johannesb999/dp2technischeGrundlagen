<script>
    import axios from 'axios';
    // import { Card, CardPrimaryContent, CardContent, Headline5, Body1 } from 'svelte-material-ui/components/Card';

    let uniqueDeviceID = '';
    let userID = '';


    async function connectDevice() {
        try {
            const response = await axios.post('http://localhost:3001/connect-device', {
                uniqueDeviceID,
                userID
            });
            console.log('Gerät verbunden:', response);

            // Hier können Sie weitere Aktionen nach erfolgreicher Verbindung hinzufügen
        } catch (error) {
            console.error('Fehler beim Verbinden des Geräts:', error);
        }
    }


    function JohannesistDumm() {
        window.location.href = '#/Detail';
    }
</script>

<!-- Felder zur Geräteverbindung -->
<div>
    <input type="text" bind:value={uniqueDeviceID} placeholder="Unique Device ID" />
    <input type="text" bind:value={userID} placeholder="User ID" />
    <button on:click={connectDevice}>Gerät verbinden</button>
</div>

<!-- Feld zur Abfrage von Gerätedaten -->


<!-- Svelte MUI Card -->
<div>
    <button on:click={JohannesistDumm}>Hier ist ein Gerät(wenn du das nicht siehst, dann bist du entweder dumm oder heißt Fabian)</button>
</div>
<!-- <Card>
    <CardPrimaryContent>
        <CardContent>
            <Headline5>Gerätedaten</Headline5>
            <Body1>Gerätedaten werden hier angezeigt</Body1>
        </CardContent>
    </CardPrimaryContent>
</Card> -->
