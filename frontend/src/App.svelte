<script>
  import Register from "./Register.svelte";
  import Login from "./Login.svelte";
  import Router from 'svelte-spa-router';
  import Home from "./Home.svelte";
  import Detail from "./Detail.svelte";


  const routes= {
    "/": Register,
    "/Login": Login,
    "/Register": Register,
    "/Home": Home,
    "/Detail": Detail
  };
</script>



<main>
  <nav>
    <a href='#/Login'>LOGIN</a>
    <a href='#/Register'>Register</a>
    <a href='#/Home'>Home</a>
  </nav>
  <!-- <h1>Joahhes ist Lost</h1> -->
  <Router {routes}></Router>
</main>



<style>

</style>