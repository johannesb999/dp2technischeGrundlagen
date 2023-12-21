<script>
  import axios from "axios";

  let uniqueDeviceID = "";
  let userID = "";

  async function connectDevice() {
    try {
      const response = await axios.post(
        "http://localhost:3001/connect-device",
        {
          uniqueDeviceID,
          userID,
        }
      );
      console.log("Gerät verbunden:", response);

      // Hier können Sie weitere Aktionen nach erfolgreicher Verbindung hinzufügen
    } catch (error) {
      console.error("Fehler beim Verbinden des Geräts:", error);
    }
  }

  function linkPage() {
    window.location.href = "#/Detail";
  }
</script>

<!-- Felder zur Geräteverbindung -->
<div>
  <input
    type="text"
    bind:value={uniqueDeviceID}
    placeholder="Unique Device ID"
  />
  <input type="text" bind:value={userID} placeholder="User ID" />
  <button on:click={connectDevice}>Gerät verbinden</button>
</div>

<!-- Feld zur Abfrage von Gerätedaten -->

<div>
  <button on:click={linkPage}
    >Hier ist ein Gerät(wenn du das nicht siehst, dann bist du entweder dumm
    oder heißt Nils)</button
  >
</div>

<style>
  input {
    margin: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #000000;
    border-radius: 0.5rem;
  }
  button {
    margin: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #000000;
    border-radius: 0.5rem;
  }
</style>
