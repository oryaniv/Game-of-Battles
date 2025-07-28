<template>
  <div class="logo-screen">
    <div class="logo-container">
      
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'COHLogo',
  setup() {
    return {};
  }
});
</script>

<style scoped>
.logo-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: black; /* Solid black background */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* Prevent content overflow */
}

.logo-container {
  width: 500px;
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('../assets/Logo/COH.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transform: rotateY(180deg);
}
</style>