<template>
  <div class="intro-view">
    
    <!-- Sound Preference Popup Overlay -->
    <div v-if="showSoundPopup" class="popup-overlay">
      <div class="sound-popup-container">
        <!-- Popup Background with Marble Texture -->
        <div class="sound-popup-background">
          <p class="popup-question">Sound on?</p>
          <div class="popup-buttons">
            <button @click="selectSoundPreference(true)" class="game-button">Hell yes!</button>
            <button @click="selectSoundPreference(false)" class="game-button">No...</button>
            <!-- <button @click="goToMenu" class="game-button">Main Menu</button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { OptionsManager } from '@/GameData/OptionsManager';

export default defineComponent({
  name: 'SoundOnOff',
  data() {
    return {
      showSoundPopup: true, // Set to true to show the popup initially
    };
  },
  methods: {
    selectSoundPreference(soundOn: boolean) {
      OptionsManager.getInstance().setSoundOn(soundOn);
      this.showSoundPopup = false;
      this.$router.push("/LogoScreen");
    },
    goToMenu() {
      this.$router.push("/MainMenu");
    }
  },
});
</script>

<style scoped>

/* Base Intro View container (assuming full screen and black background from outside) */
.intro-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* Assuming a black background is applied to the body or a parent div */
}

/* Example title for the intro screen, matching existing font/color */
.game-title {
  font-family: 'Exo 2', sans-serif; /* Using Exo 2, assuming it's imported or available */
  color: white;
  font-size: 4em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  z-index: 1; /* Ensure title is above global black background */
}

/* --- Popup Styles --- */

.popup-overlay {
  position: fixed; /* Covers the entire viewport */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* Semi-transparent black overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure it's on top of everything */
}

.sound-popup-container {
  width: 400px; /* Adjust width as needed */
  max-width: 90%; /* Responsive sizing */
  padding: 20px;
  border-radius: 20px; /* Soft rounded corners for the outer container */
  box-shadow:
    0 0 0 5px #2F4F4F, /* Dark slate gray border (acts as a frame base) */
    0 0 0 7px #A17A50, /* Gold/bronze accent border */
    0 0 20px rgba(0, 0, 0, 0.7); /* Outer shadow for depth */

  /* The plum marble background for the popup content */
  background-image: url('../assets/Menus/plumMarble3.png'); /* IMPORTANT: Update this path! */
  background-color: #5E3B68; /* Fallback color */
  background-size: cover; /* Ensures marble texture covers the area */
  background-repeat: no-repeat;
  background-position: center;

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative; /* For z-indexing if inner content has shadows */
}

.sound-popup-background {
  /* This div holds the actual content and gets the marble background */
  width: 100%;
  height: 100%;
  padding: 20px; /* Padding inside the marble background */
  border-radius: 15px; /* Slightly smaller border-radius than container to fit */
  /* We apply the marble background here again, or ensure it's inherited.
     For this example, applying it to .sound-popup-container should be enough
     if you just want the content directly on it. */
}

.popup-question {
  font-family: 'Exo 2', sans-serif; /* Consistency with Exo 2 */
  font-size: 1.8em; /* Larger size for primary question */
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
  margin-bottom: 30px; /* Space between question and buttons */
}

.popup-buttons {
  display: flex;
  gap: 20px; /* Space between buttons */
  justify-content: center;
  width: 100%;
}

/* Reusing the general button styles from your action menu */
.game-button {
  font-family: 'Exo 2', sans-serif; /* Ensure Exo 2 is used for button text */
  font-size: 20px; /* Adjusted size for popup buttons */
  color: white;
  padding: 10px 25px; /* Adjust padding */
  border-radius: 20px; /* Rounded corners */
  flex: 1; /* Allow buttons to grow and fill space */
  max-width: 150px; /* Max width for each button */

  /* Base background color from the menu frame/marble veins */
  background-color: #2F4F4F; /* Dark Slate Gray */

  /* 3D / volumetric effect using shadows, now with the subtle gold border */
  border: none; /* No native border */
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2), /* Inner highlight (top-left) */
    inset -1px -1px 2px rgba(0, 0, 0, 0.4),    /* Inner shadow (bottom-right) */
    0 0 0 2px #A17A50, /* Gold border */
    0 0 0 3px #8B7355, /* Deeper gold border for depth */
    3px 3px 6px rgba(0, 0, 0, 0.4);             /* Outer shadow for depth */

  /* Optional: Add hover/active states for interactivity */
  transition: all 0.15s ease-in-out; /* Smooth transitions */
}

.game-button:hover {
  background-color: #3A5F5F; /* Slightly lighter slate gray on hover */
  cursor: pointer;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.3),
    inset -1px -1px 2px rgba(0, 0, 0, 0.5),
    0 0 0 2px #FFD700, /* Slightly brighter gold on hover for the border */
    0 0 0 3px #CDAD00, /* Darker gold for subtle depth */
    5px 5px 10px rgba(0, 0, 0, 0.6);
}

.game-button:active {
  background-color: #2A4545; /* Slightly darker slate gray when pressed */
  box-shadow:
    inset 0px 0px 5px rgba(0, 0, 0, 0.8),
    0 0 0 2px #A17A50,
    1px 1px 3px rgba(0, 0, 0, 0.3);
  transform: translateY(1px);
}

/* Ensure Exo 2 is available if not globally imported */
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&display=swap');
</style>
