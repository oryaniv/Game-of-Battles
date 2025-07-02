<template>
  <div class="Game-Logo">
    <h1>
      <span class="Game-Logo-Text">Di <span class="skull-icon"></span> F<div class="logo-outer-circle"><div class="logo-circle-inner"></div></div>r Me</span>
    </h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';


export default defineComponent({});


</script>

<style scoped>
.Game-Logo {
  font-family: "MetalMania-Regular";
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.skull-icon {
  /*background-image: url('../assets/skull_example.png');*/
  /*background-image: url('../assets/skull_for_logo.svg'); */
  background-image: url('../assets/Skull_and_crossbones.svg');
  width: 111px;
  height: 114px;
  display: inline-block;
  background-size: cover;
  margin-right: 20px;
}

.Game-Logo h1 {
  font-size: 160px;
  margin-top: 0.25em;
}

.Game-Logo-Text {
  /* Ensure the text is visible */
  display: flex; /* Make it a flex container to align "DIE F" and "R ME" with the circle */
  align-items: center; /* Vertically center the text with the circle */
  justify-content: center; /* Center the whole logo */
  white-space: nowrap; /* Prevent "DIE FOR ME" from wrapping if width is constrained */

  /* --- Improvements for Text Pop/Contrast --- */
  /* Add a subtle gold outer glow to the text */
  text-shadow:
    -1px -1px 0px #A17A50,  /* Thin gold outline top-left */
    1px 1px 0px #8B7355,   /* Thin gold outline bottom-right */
    0 0 10px rgba(255, 215, 0, 0.4); /* Soft gold glow */
    /* Adjust colors and values as needed for subtlety vs. pop */

    /* color: #5E3B68; */
    color: #8C5E9E;
  
}

.Game-Logo-Text .logo-outer-circle {
  margin: 0px 7px;
}

.logo-outer-circle {
    width: 1em;
    height: 1em;
    border-radius: 50%;
    background-image: url('../assets/Menus/plumMarble4.png');
    display: inline-flex;
    box-shadow: 0 0 15px 3px rgba(255, 215, 0, 0.4);
}

.logo-circle-inner {
  background-color: black;
  width: 90%; 
  height: 90%;
  border-radius: 50%;
}



</style>
