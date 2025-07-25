<template>
  <div v-if="isVisible" class="game-message-popup-overlay">
    <div class="game-message-popup-container">
      <div class="game-message-popup-background">
        <h3 class="popup-message-title">{{ title }}</h3>
        <p class="popup-message-text">{{ message }}</p>
        <div class="buttons-container">
          <button @click="dismiss(true)" class="game-button popup-ok-button yes">Sure, why not</button>
          <button @click="dismiss(false)" class="game-button popup-ok-button no">Nah, I'm good</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'GameMessagePopup',
  props: {
    // Prop to control visibility from parent
    show: {
      type: Boolean,
      default: false
    },
    // Message title (e.g., "Error", "Info", "Cannot Attack")
    title: {
      type: String,
      default: "Game Message"
    },
    // The actual message text
    message: {
      type: String,
      default: "An unexpected event occurred."
    }
  },
  emits: ['dismissed'], // Emit event when popup is dismissed

  setup(props, { emit }) {
    const isVisible = ref(props.show); // Internal state for visibility

    // Watch for changes in the 'show' prop to update internal visibility
    watch(() => props.show, (newVal) => {
      isVisible.value = newVal;
    });

    const dismiss = (confirm: boolean) => {
      isVisible.value = false;
      emit('dismissed', confirm); // Notify parent that popup has been dismissed
    };

    return {
      isVisible,
      dismiss,
    };
  }
});
</script>

<style scoped>
/* --- Popup Overlay (Covers entire screen, dims background) --- */
.game-message-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0); /* Darker overlay than intro popup to really block */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Very high z-index to be on top of everything */
  backdrop-filter: blur(3px); /* Optional: subtle blur effect on background */
  -webkit-backdrop-filter: blur(3px); /* For Safari */
}

/* --- Popup Container (The main box for the message) --- */
.game-message-popup-container {
  width: 550px; /* Adjust width as needed */
  max-width: 90%;
  padding: 20px;
  border-radius: 20px; /* Consistent rounded corners */
  
  /* Styling to match your menu/popup aesthetic */
  box-shadow:
    0 0 0 5px #2F4F4F, /* Dark slate gray border */
    0 0 0 7px #A17A50, /* Gold/bronze accent border */
    0 0 25px rgba(0, 0, 0, 0.9); /* Stronger outer shadow */
  
  background-image: url('../assets/Menus/darkSlate1.png'); /* Dark slate marble background for contrast */
  background-color: #2F4F4F; /* Fallback */
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.game-message-popup-background {
  /* Inner padding/shaping if needed, otherwise can be removed */
  width: 100%;
  height: 100%;
  padding: 15px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* --- Message Title --- */
.popup-message-title {
  font-family: 'CinzelDecorative-Regular', sans-serif; /* Consistent title font */
  font-size: 1.5em;
  color: white; /* Bright gold for titles */
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  margin-bottom: 15px;
  margin-top: 0;
}

/* --- Message Text --- */
.popup-message-text {
  font-family: 'Exo 2', sans-serif; /* Consistent UI font */
  font-size: 1.1em;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
  margin-bottom: 40px; /* Space above button */
  line-height: 1.4;
}

/* --- OK Button (Reusing game-button style) --- */
.game-button.popup-ok-button {
  font-family: 'Exo 2', sans-serif;
  font-size: 1.1em;
  color: white;
  padding: 10px 30px;
  border-radius: 20px;
  min-width: 100px;
  
  /* Inherit base button styles */
  background-color: #2F4F4F;
  border: none;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2),
    inset -1px -1px 2px rgba(0, 0, 0, 0.4),
    0 0 0 2px #A17A50,
    0 0 0 3px #8B7355,
    3px 3px 6px rgba(0, 0, 0, 0.4);
  transition: all 0.15s ease-in-out;
}

.buttons-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
}

.game-button.popup-ok-button:hover {
  background-color: #3A5F5F;
  cursor: pointer;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.3),
    inset -1px -1px 2px rgba(0, 0, 0, 0.5),
    0 0 0 2px #FFD700,
    0 0 0 3px #CDAD00,
    5px 5px 10px rgba(0, 0, 0, 0.6);
}

.game-button.popup-ok-button:active {
  background-color: #2A4545;
  box-shadow:
    inset 0px 0px 5px rgba(0, 0, 0, 0.8),
    0 0 0 2px #A17A50,
    1px 1px 3px rgba(0, 0, 0, 0.3);
  transform: translateY(1px);
}

/* Font Imports (if not global) */
/* @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&family=Metal+Mania&display=swap'); */
</style>