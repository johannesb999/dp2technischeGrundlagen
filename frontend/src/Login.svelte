<script>
  import axios from "axios";
  import { push } from "svelte-spa-router";
  import { UserPlus, Pencil } from "lucide-svelte";
  import { loggedIn, token } from "./svelte-store";

  let memberSince = null;
  let password = "";
  let email = "";
  let username = "";
  let devicecount = 0;
  let isUsernameDisabled = true;
  let isEmailDisabled = true;
  let userCache;
  let emailChache;
  let currentToken = "";
  const unsubscribe = token.subscribe((value) => {
    currentToken = value;
  });

  run();

  async function loginUser() {
    userCache = username;
    emailChache = email;
    if (!email.includes("@") || !email.match(/\.[a-z]+$/)) {
      alert("Bitte geben Sie eine gültige E-Mail-Adresse ein");
      return;
    }
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
      token.set(response.data.token);
      username = response.data.username;
      console.log(username);
      loggedIn.update((prev) => true);
      checkToken();
      // window.location.href = '#/Home'
      push("/Home");
    } catch (error) {
      console.error("Fehler beim Login:", error);
    }
  }

  function linkPage() {
    window.location.href = "#/Register";
  }

  // Logout-Funktion
  async function logoutUser() {
    console.log("logging out...");
    token.set("");
    username = "";
    email = "";
    loggedIn.update((prev) => false);
  }

  // axios interceptor for JWT
  axios.interceptors.request.use(
    (config) => {
      if (currentToken) {
        config.headers.authorization = `Bearer ${currentToken}`;
      } else {
        console.log("token gelöscht");
        delete config.headers.authorization;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  async function deleteUser() {
    const response = await axios.post("http://localhost:3001/delete-user");
  }

  //----if logged in----

  async function checkToken() {
    try {
      const response = await axios.post("http://localhost:3001/get-token");
      console.log(response);
      memberSince = response.data.data.createdAt.split(",")[0];
      username = response.data.data.username;
      userCache = username;
      email = response.data.data.email;
      emailChache = email;
      console.log(username);
      const answer = await axios.post("http://localhost:3000/get-devices");
      devicecount = answer.data.length;
    } catch (error) {
      console.error("Kein Token vorhanden oder ungültig", error);
    }
  }

  function enableUsername() {
    username = null;
    isUsernameDisabled = false;
  }

  function enableemail() {
    email = null;
    isEmailDisabled = false;
  }

  function editUser() {
    if (!isEmailDisabled) {
      if (email === emailChache || email === null) {
        email = emailChache;
      } else {
        console.log(email);
        updateUser();
        emailChache = email;
      }
    } else if (!isUsernameDisabled) {
      if (username === userCache || username === null) {
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
    try {
      const response = await axios.post("http://localhost:3001/update-user", {
        emailChache,
        email,
        username,
      });
    } catch (error) {
      console.error(error);
    }
  }

  function run() {
    if ($loggedIn) {
      checkToken();
    }
  }
</script>

{#if !$loggedIn}
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
  <button id="registerbtn" on:click={linkPage}>Registrieren</button>
{:else}
  <form>
    <h1>Nutzerinformationen</h1>
    <button id="icon">
      <UserPlus size="50"></UserPlus>
    </button>
    <div>
      <label for="username-display">Benutzername:</label>
      <div class="testcontainer">
        <input
          disabled={isUsernameDisabled}
          id="username-display"
          type="text"
          bind:value={username}
        />
        <button
          class="editbtn"
          on:click={() => {
            enableUsername();
          }}
        >
          <Pencil></Pencil>
        </button>
      </div>
    </div>
    <div>
      <label for="email-display">Email:</label>
      <div class="testcontainer">
        <input
          disabled={isEmailDisabled}
          id="email-display"
          type="email"
          bind:value={email}
        />
        <button
          class="editbtn"
          on:click={() => {
            enableemail();
          }}
        >
          <Pencil></Pencil>
        </button>
      </div>
      {#if !isEmailDisabled || !isUsernameDisabled}
        <button on:click={editUser}>Speichern</button>
      {/if}
    </div>
    <div>
      <input disabled placeholder={memberSince} />
    </div>
    <div>
      <input disabled placeholder={devicecount.toString()} />
    </div>
    <!-- <p>{memberSince}</p> -->
    <!-- <p>{devicecount}</p> -->
    <button id="registerbtn" on:click={deleteUser} style="margin-top: 15px;"
      >delete</button
    >
    <button on:click={logoutUser} style="margin-top: 6px;">Ausloggen</button>
  </form>
{/if}

<style>
  form {
    margin-top: 5rem;
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
