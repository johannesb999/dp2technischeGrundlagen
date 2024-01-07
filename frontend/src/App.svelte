<script>
  import Register from "./Register.svelte";
  import Login from "./Login.svelte";
  import Router from "svelte-spa-router";
  import Homee from "./Home.svelte";
  import Detail from "./Detail.svelte";
  import Health from "./Health.svelte";
  import Connect from "./Connect.svelte";
  import DeviceSettings from "./DeviceSettings.svelte";

  import { User, Home, ChevronLeft } from 'lucide-svelte'

  const routes = {
    "/": Register,
    "/Login": Login,
    "/Register": Register,
    "/Home": Homee,
    "/Detail": Detail,
    "/Health": Health,
    "/Connect": Connect,
    "/DeviceSettings": DeviceSettings,
  };
  function goback() {
    window.history.back();
  }


</script>

<main>
  <div id='header'>
    <button on:click={goback} style="background-color: transparent; margin:0; padding:0;">
      <ChevronLeft size={50}></ChevronLeft>  
    </button>
    <h1>PlantMonit</h1>
  </div>
  <Router {routes}></Router>
  <nav>
    <a class="link" href="#/Login"><User></User></a>
    <!-- <a class="link" href="#/Register">Register</a> -->
    <a class="link" href="#/Home"><Home></Home></a>
  </nav>
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
