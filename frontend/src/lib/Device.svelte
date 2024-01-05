<script>
    
      export let device;
    
      console.log("device:", device);
      
      
      console.log("device:", device._id);
      
      function linkPage() {
        window.location.href = `#/Detail?deviceId=${device._id}`;
    }
    </script>




<main  on:click={linkPage} >
    <img src='ZebraPflanze.png' alt='Pflanze'>
    <div id='wrapper'>
        <span>Marty</span>
        <span>Gießen</span>
    </div>
</main>





<style>
    main {
        background-color: rgb(68, 67, 67);
        border-radius: 10px;
        width: 100%;
        padding: 0;
        margin-bottom: 2rem;
        /* height: 50px; */
    }
    #wrapper {
        padding-left: 2rem;
        padding-right: 2rem;
        padding-bottom: 10px;
        display: flex;
        justify-content: space-between;
    }
    img {
        width: 100%;
    }
</style>