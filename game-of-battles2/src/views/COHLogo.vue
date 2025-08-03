<template>
  <div class="logo-screen">
    <div class="circle"></div>
    <div class="logo-container">
      <!-- <img src="../assets/Logo/CircleHex1-circle.png" class="logo-hex" /> -->
      <img src="../assets/Logo/Sun.svg" class="logo-sun" />
      <img src="../assets/Logo/Moon.svg" class="logo-moon" />
    </div>

    <svg class="logo-text-svg" viewBox="0 0 200 200">
      <path id="circlePath"
            d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
            fill="none" />
      <text>
        <textPath href="#circlePath" startOffset="8%">
          CIRCLE OF HEX
        </textPath>
      </text>
    </svg>

  <!-- The Circle of Hex symbol image overlaid in the center -->
  <img src="../assets/Logo/CircleHex1-circle.png" alt="Hex Symbol" class="hex-symbol-overlay" />
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
  margin-top: 75px;
  width: 700px;
  height: 700px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('../assets/Logo/Logo3.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.logo-hex {
    width: 35px;
    height: 35px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    position: absolute;
    top: 227px;
    left: 335px;
    filter: brightness(1.25) saturate(1.15);
    /* --- CRITICAL CHANGES FOR ROUND SHADOW --- */
  border-radius: 50%; /* Makes the container perfectly round */

  /* Use the symbol as a background image for this round container */
  background-image: url('../assets/Logo/CircleHex1-circle.png'); /* IMPORTANT: Update this path! */
  background-size: contain; /* Ensures the symbol fits within the circle */
  background-repeat: no-repeat;
  background-position: center;
  
  /* --- Subtle Integration Effects (now will be round) --- */
  /* Option 1: Subtle Inner Shadow (makes it look slightly recessed) */
  /* box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5); */ /* Dark inner shadow */

  /* Option 2: Subtle Outer Glow (makes it look like it's emitting faint light) */
  /* box-shadow: 0 0 5px 2px rgba(255, 255, 0, 0.4); */ /* Soft yellow/gold glow */

  /* Option 3: Combination (recessed with a faint glow) */
  box-shadow:
    inset 0 0 5px rgba(0, 0, 0, 0.5),
    0 0 3px 1px rgba(255, 255, 0, 0.3);

  /* Optional: Subtle blur to blend edges (use sparingly for pixel art) */
  /* filter: blur(0.5px); */

  /* Optional: Blend mode if the symbol has transparency and you want it to interact with background */
  /* mix-blend-mode: screen; */
}

.logo-sun {
    width: 30px;
    height: 30px;
    position: absolute;
    top: 290px;
    left: 408px;
}

.logo-moon {
    width: 50px;
    height: 50px;
    position: absolute;
    top: 281px;
    left: 256px;
}

.logo-text-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;
}

.logo-text-svg text {
  /* font-family: 'Exo 2', sans-serif; */
  font-family: 'Cinzel Decorative', sans-serif;
  font-weight: bold;
  font-size: 20px;
  text-transform: uppercase;
  fill: #eab825;
}



.hex-symbol-overlay {
    position: absolute;
    width: 80px;
    height: 80px;
    top: 9%;
    left: 54%;
    transform: translate(-50%, -50%) rotate(15deg);
    z-index: 3;
    filter: brightness(1.25) saturate(1.15);
  /* You can add a subtle box-shadow here to integrate it */
  /* box-shadow: 0 0 5px rgba(0,0,0,0.5); */
}

.circle {
  position: absolute;
  top: 155px;
  left: 470px;
  width: 570px;
  height: 570px;
  background-color: transparent;
  border-radius: 100%;
  border: 1px solid #eab825;
  z-index: 10;
}

</style>