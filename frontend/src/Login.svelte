<script>
  import axios from "axios";

  let password = "";
  let email = "";
  let loggedIn = false;
  let token = "";

  async function loginUser() {
    // Überprüfen, ob alle Felder ausgefüllt sind

    // Einfache E-Mail-Validierung
    if (!email.includes("@") || !email.match(/\.[a-z]+$/)) {
      alert("Bitte geben Sie eine gültige E-Mail-Adresse ein");
      return;
    }

    // Überprüfen der Passwortlänge
    if (password.length < 2) {
      alert("Das Passwort muss mindestens 2 Zeichen lang sein");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/login", {
        email,
        password,
      });
      console.log("Login erfolgreich:", response);
      token = response.data.token;
      loggedIn = true;
    } catch (error) {
      console.error("Fehler beim Login:", error);
    }
  }

  // Logout-Funktion
  function logoutUser() {
    token = "";
    loggedIn = false;
    // Weiterleitung zur Login-Seite oder einer anderen Seite
    window.location.href = "#/Login";
  }

  // axios interceptor for JWT
  axios.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
</script>

{#if !loggedIn}
  <form on:submit|preventDefault={loginUser}>
    <div>
      <label for="email">E-mail:</label>
      <input id="email" type="email" bind:value={email} />
    </div>
    <div>
      <label for="password">Passwort:</label>
      <input id="password" type="password" bind:value={password} />
    </div>

    <button type="submit">Einloggen</button>
  </form>
{:else}
  <button on:click={logoutUser}>Ausloggen</button>
{/if}
