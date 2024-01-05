<script>
  import Register from "./Register.svelte";
  import Login from "./Login.svelte";
  import Router from "svelte-spa-router";
  import Home from "./Home.svelte";
  import Detail from "./Detail.svelte";
  import Health from "./Health.svelte";
  import Connect from "./Connect.svelte";
  import DeviceSettings from "./DeviceSettings.svelte";

  const routes = {
    "/": Register,
    "/Login": Login,
    "/Register": Register,
    "/Home": Home,
    "/Detail": Detail,
    "/Health": Health,
    "/Connect": Connect,
    "/DeviceSettings": DeviceSettings,
  };
</script>

<main>
  <h1>PlantMonit</h1>
  <Router {routes}></Router>
  <nav>
    <a class="link" href="#/Login">login</a>
    <a class="link" href="#/Register">Register</a>
    <a class="link" href="#/Home">Home</a>
  </nav>
</main>

<style>
  main {
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100vh;
    /* border: 2px solid white; */
  }
  nav {
    width: 100%;
    display: flex;
    justify-content: space-around;
    position: fixed;
    right: 0;
    bottom: 0;
    align-items: center;
    background-color: #000000;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  .link {
    color: #ffffff;
  }
  h1 {
    margin:0;
    padding: 10px;
    background-color: #000000;
    text-align: center;
  }
</style>
