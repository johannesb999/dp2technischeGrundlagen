<script>
  import Register from "./Register.svelte";
  import Login from "./Login.svelte";
  import Router from "svelte-spa-router";
  import Home from "./Home.svelte";
  import Detail from "./Detail.svelte";
  import Health from "./Health.svelte";

  const routes = {
    "/": Register,
    "/Login": Login,
    "/Register": Register,
    "/Home": Home,
    "/Detail": Detail,
    "/Health": Health,
  };
</script>

<main>
  <nav>
    <a class="link" href="#/Login">LOGIN</a>
    <a class="link" href="#/Register">Register</a>
    <a class="link" href="#/Home">Home</a>
  </nav>
  <h1>PlantMonit</h1>
  <Router {routes}></Router>
</main>

<style>
  nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: #000000;
    padding: 1rem;
  }
  .link {
    color: #ffffff;
  }
  h1 {
    text-align: center;
  }
</style>
