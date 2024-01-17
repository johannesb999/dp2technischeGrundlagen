<script>
  import Register from "./Register.svelte";
  import Login from "./Login.svelte";
  import Router from "svelte-spa-router";
  import Homee from "./Home.svelte";
  import Detail from "./Detail.svelte";
  import Health from "./Health.svelte";
  import Connect from "./Connect.svelte";
  import DeviceSettings from "./DeviceSettings.svelte";
  import Buddy from "./Buddy.svelte";
  import Nutzungsbedingungen from "./Nutzungsbedingungen.svelte";

  import { currentRoute, loggedIn } from './svelte-store';

  import { User, Home, ChevronLeft, Droplet } from 'lucide-svelte'

  const routes = {
    "/": Login,
    "/Login": Login,
    "/Register": Register,
    "/Home": Homee,
    "/Detail": Detail,
    "/Health": Health,
    "/Connect": Connect,
    "/DeviceSettings": DeviceSettings,
    "/Buddy": Buddy,
    "/Nutzungsbedingungen": Nutzungsbedingungen,
  };
  function goback() {
    window.history.back();
  }

  function changeRoute(route) {
    currentRoute.set(route);
    // ... Logik zur Anzeige der entsprechenden Komponente ...
  }

  function print() {
    console.log()
  }

</script>

<main>
  {#if $currentRoute === '/Login'}
    <div id='header'>
      <h1>PlantMonit</h1>
    </div>
    <button on:click={print}>print</button> 
    {#if $loggedIn}
      <nav>
        <a on:click={() => changeRoute('/Home')} class="link" href="#/Home"><Home></Home></a>
        <a on:click={() => changeRoute('/Buddy')} class="link" href="#/Buddy"><Droplet></Droplet></a>
        <a on:click={() => changeRoute('/Login')} class="link" href="#/Login"><User></User></a>
      </nav>
    {/if}
  {:else if $currentRoute === '/Home' || $currentRoute === '/Buddy'}
  <div id='header'>
    <h1>PlantMonit</h1>
  </div>
  <nav>
    <a on:click={() => changeRoute('/Home')} class="link" href="#/Home"><Home></Home></a>
    <a on:click={() => changeRoute('/Buddy')} class="link" href="#/Buddy"><Droplet></Droplet></a>
    <a on:click={() => changeRoute('/Login')} class="link" href="#/Login"><User></User></a>
  </nav>
  {:else }
    <div id='header'>
      <button on:click={goback} style="background-color: transparent; margin:0; padding:0;">
        <ChevronLeft size={50}></ChevronLeft>  
      </button>
      <h1>PlantMonit</h1>
    </div>
    <nav>
      <a on:click={() => changeRoute('/Home')} class="link" href="#/Home"><Home></Home></a>
      <a on:click={() => changeRoute('/Buddy')} class="link" href="#/Buddy"><Droplet></Droplet></a>
      <a on:click={() => changeRoute('/Login')} class="link" href="#/Login"><User></User></a>
    </nav>
  {/if}
  <Router {routes}></Router>
</main>

<style>
  #header {
    display: flex;
    position: fixed;
    z-index: 100;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background-color: black;
  }
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
    height: 2rem;
    display: flex;
    justify-content: space-around;
    position: fixed;
    z-index: 1000;
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
    margin-right: auto;
    margin-left: auto;
    padding: 10px;
    background-color: #000000;
    text-align: center;
  }
</style>
