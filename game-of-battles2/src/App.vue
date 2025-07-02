<template>
  <router-view/>
</template>

<style>

@font-face {
  font-family: "Exo2-Regular";
  src: url("@/assets/fonts/Exo2-Regular.ttf") format("truetype");
  font-weight: bold;
  font-style: normal;
}

@font-face {
  font-family: "MetalMania-Regular";
  src: url("@/assets/fonts/MetalMania-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "Creepster-Regular";
  src: url("@/assets/fonts/Creepster-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "Nosifer-Regular";
  src: url("@/assets/fonts/Nosifer-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

#app {
  height: 100vh;
}

@supports (height: 100dvh) {
  #app {
    height: 100dvh;
  }
}


</style>
