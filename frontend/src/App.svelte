<script>
  import Register from "./Register.svelte";
  import Login from "./Login.svelte";
  import Router from 'svelte-spa-router';


  const routes= {
    "/": Login,
    "/Login": Login,
    "/Register": Register
  };
</script>



<main>
  <nav>
    <a href='#/Login'>LOGIN</a>
    <a href='#/Register'>Register</a>
  </nav>
  <h1>Joahhes ist Lost</h1>
  <Router {routes}></Router>
</main>



<style>
  h1 {
    color: red;
  }
</style>