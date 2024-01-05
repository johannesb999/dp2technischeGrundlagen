<script>
    import axios from "axios";
  
    let uniqueDeviceID = "";
  
  
    async function connectDevice() {
      try {
        const response = await axios.post("http://localhost:3001/connect-device",{uniqueDeviceID}
        );
        console.log("Gerät verbunden:", response);
  
        // Hier können Sie weitere Aktionen nach erfolgreicher Verbindung hinzufügen
      } catch (error) {
        console.error("Fehler beim Verbinden des Geräts:", error);
      }
    }
    
    function run() {

    }
    run();
  </script>
  
  <!-- Felder zur Geräteverbindung -->
  <main>

  </main>
    
  <style>
  
    main {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

  </style>
  