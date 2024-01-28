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
        <a on:click={() => changeRoute('/Home')} class="tab" href="#/Home"><Home size={35}></Home></a>
        <a on:click={() => changeRoute('/Buddy')} class="tab" href="#/Buddy"><Droplet size={33}></Droplet></a>
        <a on:click={() => changeRoute('/Login')} class="tab active" href="#/Login"><User size={33}></User></a>
      </nav>
    {/if}
  {:else if $currentRoute === '/Home' || $currentRoute === '/Buddy'}
  <div class='link' id='header'>
    <h1>PlantMonit</h1>
  </div>
  <nav>
    <a on:click={() => changeRoute('/Home')} class={$currentRoute === "/Home" ? "tab active" : "tab"} href="#/Home"><Home size={35}></Home></a>
    <a on:click={() => changeRoute('/Buddy')} class={$currentRoute === "/Buddy" ? "tab active" : "tab"} href="#/Buddy"><Droplet size={33}></Droplet></a>
    <a on:click={() => changeRoute('/Login')} class="tab" href="#/Login"><User size={33}></User></a>
  </nav>
  {:else }
    <div id='header'>
      <button on:click={goback} style="background-color: transparent; margin:0; padding:0;">
        <ChevronLeft size={50}></ChevronLeft>  
      </button>
      <h1>PlantMonit</h1>
    </div>
    <nav>
      <a on:click={() => changeRoute('/Home')} class='tab active' href="#/Home"><Home size={35}></Home></a>
      <a on:click={() => changeRoute('/Buddy')} class="tab" href="#/Buddy"><Droplet size={33}></Droplet></a>
      <a on:click={() => changeRoute('/Login')} class="tab" href="#/Login"><User size={33}></User></a>
    </nav>
  {/if}
  <Router {routes}></Router>
</main>

<style>
  #header {
    display: flex;
    position: fixed;
    z-index: 100000000000;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background-color: rgb(46, 50, 45);
    padding-top: 10px;
    padding-bottom: 10px;
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
    z-index: 100000000;
    right: 0;
    bottom: -1px;
    align-items: center;
    background-color: rgba(46, 50, 45);
    padding-top: 30px;
    padding-bottom: 20px;
  }
  .tab {
    color: #ffffff;
  }
  .active {
    color: green;
  }
  h1 {
    margin:0;
    margin-right: auto;
    margin-left: auto;
    padding: 10px;
    text-align: center;
  }
</style>
