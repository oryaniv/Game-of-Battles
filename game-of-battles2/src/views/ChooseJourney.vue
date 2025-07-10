<template>
  <div class="journey-screen-container">
    <div class="journey-title-wrapper">
      <h1 class="journey-title-text">
        Choose Your J<span class="journey-logo-outer-circle"><span class="journey-logo-circle-inner"></span></span>urney
      </h1>
    </div>

    <div class="difficulty-towers-container">
      <!-- Easy Pyramid (3 blocks) -->
      <div class="difficulty-pyramid easy" @click="selectDifficulty('easy')">
        <div class="pyramid-block block-top"></div>
        <div class="pyramid-block block-mid-1"></div>
        <div class="pyramid-block block-bottom"></div>
        <p class="pyramid-label">Easy</p>
        <!-- Removed button -->
      </div>

      <!-- Normal Pyramid (5 blocks) -->
      <div class="difficulty-pyramid normal" @click="selectDifficulty('normal')">
        <div class="pyramid-block block-top"></div>
        <div class="pyramid-block block-mid-2"></div>
        <div class="pyramid-block block-mid-1"></div>
        <div class="pyramid-block block-mid-0"></div>
        <div class="pyramid-block block-bottom"></div>
        <p class="pyramid-label">Normal</p>
        <!-- Removed button -->
      </div>

      <!-- Hard Pyramid (7 blocks) -->
      <div class="difficulty-pyramid hard" @click="selectDifficulty('hard')">
        <div class="pyramid-block block-top"></div>
        <div class="pyramid-block block-mid-4"></div> <!-- Added block-mid-4 -->
        <div class="pyramid-block block-mid-3"></div>
        <div class="pyramid-block block-mid-2"></div>
        <div class="pyramid-block block-mid-1"></div>
        <div class="pyramid-block block-mid-0"></div>
        <div class="pyramid-block block-bottom"></div>
        <p class="pyramid-label">Hard</p>
        <!-- Removed button -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'JourneyScreen',
  methods: {
    selectDifficulty(difficulty: string) {
      console.log(`Difficulty selected: ${difficulty}`);
      // Implement navigation to the next screen (e.g., this.$router.push('/game-start', { params: { difficulty }}));
    }
  }
});
</script>

<style scoped>
/* --- General Screen Layout --- */
.journey-screen-container {
  position: relative;
  width: 100vw;
  height: 85vh;
  background-color: black; /* Solid black background */
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Align content from top */
  align-items: center;
  padding-top: 50px; /* Space from top edge */
  background-image: url('../assets/Backgrounds/Swirl1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* --- Title "Choose Your Journey" --- */
.journey-title-wrapper {
  margin-bottom: 50px; /* Space between title and pyramids */
}

.journey-title-text {
  font-family: 'Metal Mania', sans-serif; /* Your logo font */
  font-size: 4em; /* Large size for main title */
  color: #7A5B8C; /* Brighter plum from your logo */
  text-shadow:
    -1px -1px 0px #A17A50,
    1px 1px 0px #8B7355,
    0 0 15px rgba(255, 215, 0, 0.6); /* Enhanced gold glow */
  text-align: center;
  display: flex; /* To align text parts and the moon */
  align-items: center;
  justify-content: center;
  white-space: nowrap; /* Prevent wrapping */
  margin: 0;
}

/* --- Moon Widget (reusing styles from logo) --- */
.journey-logo-outer-circle {
  width: 1em; /* Scales with font size */
  height: 1em;
  border-radius: 50%;
  background-image: url('../assets/Menus/plumMarble4.png'); /* Your plum marble texture */
  background-size: cover;
  background-position: center;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 0 15px 5px rgba(255, 215, 0, 0.6); /* Slightly stronger gold glow for visibility */
  margin: 0px 10px; /* Adjust spacing around the moon within the text */
}

.journey-logo-circle-inner {
  background-color: black; /* Creates the crescent effect */
  width: 90%;
  height: 90%;
  border-radius: 50%;
}


/* --- Difficulty Pyramids Container --- */
.difficulty-towers-container {
  display: flex;
  align-items: flex-end; /* Align pyramids by their base */
  justify-content: space-around; /* Distribute pyramids across the screen width */
  width: 90%; /* Make container span most of the screen width */
  position: absolute; /* Position them at the bottom */
  bottom: 0; /* Align to bottom edge of screen */
  height: 70vh; /* Make container height 70% of viewport height */
  max-height: 700px; /* Cap max height to avoid excessively tall pyramids on very large screens */
}

.difficulty-pyramid {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end; /* Push content (label) to bottom within pyramid */
  position: relative;
  background-color: transparent;
  border-radius: 0;
  overflow: hidden;
  cursor: pointer; /* Indicate clickable */
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out; /* Smooth hover transition */
}

/* Hover effect for pyramids */
.difficulty-pyramid:hover {
  transform: translateY(-10px) scale(1.02); /* Lift and slightly scale on hover */
  box-shadow: 0 0 20px 8px rgba(255, 215, 0, 0.7); /* Stronger gold glow on hover */
  z-index: 10; /* Bring hovered pyramid to front */
}

/* --- Pyramid Blocks --- */
.pyramid-block {
  /* background-image: url('../assets/Menus/darkSlate1.png');  */
  background-color: #2F4F4F; /* Fallback */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* Height of each block segment increased */
  height: 100px; /* Doubled from 50px */
  border-radius: 5px; /* Slight rounding for block edges */
  box-shadow:
    inset 0 0 5px rgba(0,0,0,0.5), /* Inner shadow for depth */
    0 5px 10px rgba(0,0,0,0.3); /* Outer shadow for separation */
  margin-bottom: -10px; /* Doubled overlap to -10px */
  transition: all 0.3s ease; /* For potential hover effects */
  position: relative; /* For z-index if needed */
}

.difficulty-pyramid.easy .pyramid-block {
  /*background-image: url('../assets/Backgrounds/simpleLand5.png'); */
   /* background-image: url('../assets/Menus/darkSlate1.png'); */
   background-image: url('../assets/Backgrounds/DarkStone1.png');
}

.difficulty-pyramid.normal .pyramid-block {
  /*background-image: url('../assets/Backgrounds/cave3.png'); */
   /* background-image: url('../assets/Menus/darkSlate1.png'); */
   background-image: url('../assets/Backgrounds/DarkStone1.png');
}

.difficulty-pyramid.hard .pyramid-block {
  /*background-image: url('../assets/Backgrounds/temple10.png'); */
   /* background-image: url('../assets/Menus/darkSlate1.png'); */
   background-image: url('../assets/Backgrounds/DarkStone1.png');
}

/* Easy Pyramid (3 blocks) */
.difficulty-pyramid.easy .pyramid-block.block-bottom { width: 260px; } /* Doubled from 150px */
.difficulty-pyramid.easy .pyramid-block.block-mid-1 { width: 200px; } /* Doubled from 120px */
.difficulty-pyramid.easy .pyramid-block.block-top { width: 120px; } /* Adjusted from 180px to 90px for sharper apex */

/* Normal Pyramid (5 blocks) */
.difficulty-pyramid.normal .pyramid-block.block-bottom { width: 360px; } /* Doubled from 180px */
.difficulty-pyramid.normal .pyramid-block.block-mid-0 { width: 300px; } /* Doubled from 150px */
.difficulty-pyramid.normal .pyramid-block.block-mid-1 { width: 240px; } /* Doubled from 120px */
.difficulty-pyramid.normal .pyramid-block.block-mid-2 { width: 180px; } /* Doubled from 90px */
.difficulty-pyramid.normal .pyramid-block.block-top { width: 120px; } /* Doubled from 60px */

/* Hard Pyramid (7 blocks) */
.difficulty-pyramid.hard .pyramid-block.block-bottom { width: 420px; } /* Doubled from 210px */
.difficulty-pyramid.hard .pyramid-block.block-mid-0 { width: 360px; } /* Doubled from 180px */
.difficulty-pyramid.hard .pyramid-block.block-mid-1 { width: 300px; } /* Doubled from 150px */
.difficulty-pyramid.hard .pyramid-block.block-mid-2 { width: 240px; } /* Doubled from 120px */
.difficulty-pyramid.hard .pyramid-block.block-mid-3 { width: 180px; } /* Doubled from 90px */
.difficulty-pyramid.hard .pyramid-block.block-mid-4 { width: 120px; } /* Added this block and its width */
.difficulty-pyramid.hard .pyramid-block.block-top { width: 80px; } /* Adjusted for the 7th block */


.pyramid-label {
  font-family: 'Metal Mania', sans-serif;
  font-size: 2em;
  color: #FFD700; /* Gold color for labels */
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  margin-top: 10px;
  margin-bottom: 15px;
  position: absolute; /* Position label over the pyramid */
  top: -60px; /* Adjust to be above the pyramid */
  text-align: center;
  width: 100%;
  transition: opacity 0.3s ease; /* Smooth fade for label */
}

/* Hide label by default, show on hover */
.difficulty-pyramid .pyramid-label {
    opacity: 0;
}
.difficulty-pyramid:hover .pyramid-label {
    opacity: 1;
}

/* Removed buttons from template, so no need for their styles here */


/* Font Imports (if not global) */
/* @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&family=Metal+Mania&display=swap'); */
</style>
