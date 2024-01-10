<script>
  import axios from "axios";
  import { UserPlus, Pencil } from 'lucide-svelte'

  let password = "";
  let email = "";
  let loggedIn = false; 
  let token = "";
  let username = "";
  let isUsernameDisabled = true;
  let isEmailDisabled = true;

  async function loginUser() {
    userCache = username;
    emailChache = email;
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
      username = response.data.username;
      console.log(username);
      setAxiosAuthToken(token);
      loggedIn = true;
    } catch (error) {
      console.error("Fehler beim Login:", error);
    }
  }

  // Logout-Funktion
  async function logoutUser() {
    token = "";
    setAxiosAuthToken(token);
    username = "";
    email = "";
    loggedIn = false;
    // Hier sollten Sie auch den lokalen Speicher oder Session-Speicher bereinigen, falls Sie den Token dort gespeichert haben
    localStorage.removeItem('token'); // Beispiel, wenn Sie localStorage verwenden
    const response = await axios.post("http://localhost:3001/logout");
    console.log(response);
    // Weiterleitung zur Login-Seite oder einer anderen Seite
    window.location.href = "#/Login";
  }

  // axios interceptor for JWT
  // axios.interceptors.request.use(
  //   (config) => {
  //     console.log("interceptorToken:", token);
  //     if (token) {
  //       config.headers.authorization = `Bearer ${token}`;
  //     }
  //     return config;
  //   },
  //   (error) => {
  //     return Promise.reject(error);
  //   }
  // );
  function setAxiosAuthToken(token) {
  axios.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      } else {
        delete config.headers.authorization;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}






  async function checkToken() {
    try {
      const response = await axios.post("http://localhost:3001/get-token");
      console.log(response);
      username = response.data.data.username;
      userCache = username;
      email = response.data.data.email
      emailChache = email;
      loggedIn = response.data.bool;
      console.log(username);  
    } catch(error) {
      console.error("Kein Token vorhanden oder ungültig", error);
      loggedIn = false;
    }
  }


  // function enable(editParam) {
  //   console.log(editParam);
  //   editParam = "";
  //   isInputDisabled = false;
  // }
  function enableUsername() {
    username = null;
    isUsernameDisabled = false;
  }

  function enableemail() {
    email = null;
    isEmailDisabled = false;
  }

  let userCache;
  let emailChache;

  function editUser() {
    // console.log(username);
    // console.log(userCache);
    if(!isEmailDisabled){
      if (email === emailChache || email === null) {
        email = emailChache
      } else {
        console.log(email)
        updateUser();
        emailChache = email;
      }
    } else if(!isUsernameDisabled) {
      if(username === userCache || username === null) {
        // console.log("keine änderung");
        username = userCache;
      } else {
        console.log(username);
        updateUser();
        userCache = username;
      }
    }
    isEmailDisabled = true;
    isUsernameDisabled = true;
  }

  async function updateUser() {
    console.log(emailChache);
    try {
      const response = await axios.post("http://localhost:3001/update-user", {
        emailChache,
        email,
        username,
      })
    } catch(error) {
      console.error(error)
    }
  }

  function linkPage() {
    window.location.href = '#/Register'
  }

  function run() {
    checkToken();
  }
  run();
  </script>

{#if !loggedIn}
  <form on:submit|preventDefault={loginUser}>
    <h1>Login</h1>
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
  <button id='registerbtn' on:click={linkPage}>Registrieren</button>
{:else}
  <form>
    <h1>Nutzerinformationen</h1>
    <button id='icon'>
      <UserPlus size='50'></UserPlus>
    </button>
    <div>
      <label for='username-display'>Benutzername:</label>
      <div class='testcontainer'>
        <input disabled={isUsernameDisabled} id='username-display' type='text' bind:value={username}>
        <button class='editbtn' on:click={() =>{
          enableUsername();
        }}>
          <Pencil></Pencil>
        </button>
      </div>
    </div>
    <div>
      <label for='email-display'>Email:</label>
      <div class='testcontainer'>
        <input disabled={isEmailDisabled} id='email-display' type='email' bind:value={email}>
        <button class='editbtn' on:click={() =>{
          enableemail();
        }}>
          <Pencil></Pencil>
        </button>
      </div>
      {#if !isEmailDisabled || !isUsernameDisabled}
      <button on:click={editUser}>Speichern</button>
      {/if}
    </div>
    <button on:click={logoutUser}>Ausloggen</button>
  </form>
{/if}


<style>
    form {
    margin-top: 10rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .testcontainer {
    display: flex;
    position: relative;
    flex-direction: row;
    align-items: center;
  }

  .editbtn {
    position: absolute;
    background-color: transparent;
    border: none;
    width: fit-content;
    height: fit-content;
    margin: 0;
    padding: 0;
    right: 10px;
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

  #icon {
    padding: 1rem;
    margin: 0;
    width: fit-content;
    border-radius: 50px;
    display: flex;
  }

  #registerbtn {
    margin-left: auto;
    margin-right: auto;
    margin-top: 10px;
    background-color: transparent;
    border: none;
  }
</style>