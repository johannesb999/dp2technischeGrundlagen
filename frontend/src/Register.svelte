<script>
  import axios from "axios";

  let username = "";
  let password = "";
  let email = "";
  let createdAt = new Date(Date.now()).toLocaleString();
  let deleted = false;
  import { token, loggedIn } from './svelte-store';

  async function registerUser() {
    // Überprüfen, ob alle Felder ausgefüllt sind
    if (!username || !email || !password) {
      alert("Bitte füllen Sie alle Felder aus");
      return;
    }

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
      const response = await axios.post("http://localhost:3001/register", {
        username,
        email,
        password,
        createdAt,
        deleted,
      });
      console.log("Registrierung erfolgreich:", response);
      // Hier können Sie weitere Aktionen nach erfolgreicher Registrierung hinzufügen

      const answer = await axios.post("http://localhost:3001/login", {
        email, 
        password
      });
      console.log("Login erfolgreich:", answer);
      token.set(answer.data.token); 
      loggedIn.update(prev => true); 
      window.location.href = "#/Home";
    } catch (error) {
      console.error("Fehler bei der Registrierung:", error);
      
    }
  }
</script>

<form on:submit|preventDefault={registerUser}>
  <h1>Registrierung</h1>
  <div>
    <label for="username">Benutzername:</label>
    <input id="username" type="text" bind:value={username} />
  </div>
  <div>
    <label for="E-mail">E-mail:</label>
    <input id="E-mail" type="E-mail" bind:value={email} />
  </div>
  <div>
    <label for="password">Passwort:</label>
    <input id="password" type="password" bind:value={password} />
  </div>
  <div id='checkwrapper'>
    <input id='checkbox' type="checkbox">
    <span>Hiermit aktzeptiere ich die<a href="#x/Nutzungsbedingungen">Terms of use</a></span>
  </div>
  <button type="submit">Registrieren</button>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  div {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }

  label {
    margin-bottom: 0.5rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #000000;
    border-radius: 0.5rem;
  }

  button {
    padding: 0.5rem;
    border: 1px solid #000000;
    border-radius: 0.5rem;
    background-color: #000000;
    color: #ffffff;
  }
  form {
    margin-top: 10rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }


  div {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }

  label {
    margin-bottom: 0.5rem;
  }

  input {
    width: 93%;
    height: 2rem;
    font-size: 20px;
    padding: 0.5rem;
    border: 1px solid #000000;
    border-radius: 0.5rem;
  }

  button {
    margin-top: 3rem;
    width: 65%;
    padding: 0.5rem;
    border: 1px solid #000000;
    border-radius: 0.5rem;
    background-color: #000000;
    color: #ffffff;
  }

  #checkbox {
    padding: 0;
    margin:0;
    margin-right: 10px;
    width: 20px;
  }

  #checkwrapper {
    flex-direction: row;
    align-items: center;
  }

</style>
