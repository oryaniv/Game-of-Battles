<template>
  <div class="popup-overlay">
    <div class="options-popup-container">
      <div class="options-popup-background">
        <h2 class="popup-title">Settings</h2>

        <div class="options-list">
          <!-- Sound On Checkbox -->
          <label class="option-item">
            <input type="checkbox" v-model="localOptions.soundOn"  />
            <span class="custom-checkbox">
              <span v-if="localOptions.soundOn" class="checkbox-indicator">✔</span>
            </span>
            <span class="option-label">Sound On</span>
          </label>

          <!-- Show Grid Bars Checkbox -->
          <label class="option-item">
            <input type="checkbox" v-model="localOptions.showGridBars" />
            <span class="custom-checkbox">
              <span v-if="localOptions.showGridBars" class="checkbox-indicator">✔</span>
            </span>
            <span class="option-label">Show Grid Bars</span>
          </label>

          <!-- Disable Battle Comments Checkbox -->
          <label class="option-item">
            <input type="checkbox" v-model="localOptions.disableBattleComments" />
            <span class="custom-checkbox">
              <span v-if="localOptions.disableBattleComments" class="checkbox-indicator">✔</span>
            </span>
            <span class="option-label">Disable Battle Comments</span>
          </label>

          <!-- Disable Post Battle Comments Checkbox -->
          <label class="option-item">
            <input type="checkbox" v-model="localOptions.disablePostBattleComments" />
            <span class="custom-checkbox">
              <span v-if="localOptions.disablePostBattleComments" class="checkbox-indicator">✔</span>
            </span>
            <span class="option-label">Disable Post-Battle Comments</span>
          </label>
        </div>

        <div class="popup-actions">
          <button @click="saveOptions" class="game-button">Save</button>
          <button @click="cancelOptions" class="game-button">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import OptionsManager from '../GameData/OptionsManager';

// Placeholder for your GameOptions interface
export interface GameOptions {
  soundOn: boolean;
  showGridBars: boolean;
  disableBattleComments: boolean;
  disablePostBattleComments: boolean;
}


function loadOptions(): GameOptions {
  return {
    soundOn: optionsManager.getSoundOn(),
    showGridBars: optionsManager.getShowGridBars(),
    disableBattleComments: optionsManager.getDisableBattleComments(),
    disablePostBattleComments: optionsManager.getDisablePostBattleComments(),
  };
}

function saveOptions(options: GameOptions): void {
  optionsManager.setSoundOn(options.soundOn);
  optionsManager.setShowGridBars(options.showGridBars);
  optionsManager.setDisableBattleComments(options.disableBattleComments);
  optionsManager.setDisablePostBattleComments(options.disablePostBattleComments);
}

const optionsManager = OptionsManager.getInstance(); // Instantiate your options manager

export default defineComponent({
  name: 'OptionsPopup',
  props: {
    // Initial options passed from parent (e.g., main menu)
    initialOptions: {
      type: Object as PropType<GameOptions>,
      required: false,
      default: () => loadOptions() // Load defaults if no initial options provided
    }
  },
  emits: ['options-saved', 'options-canceled'], // Events to communicate with parent

  data() {
    return {
      // Create a local copy of options to edit, so we don't modify props directly
      localOptions: { ...this.initialOptions } as GameOptions,
    };
  },
  methods: {
    toggleOption(key: keyof GameOptions) {
      // eslint-disable-next-line
      debugger;
      this.localOptions[key] = !this.localOptions[key];
    },
    saveOptions() {
      saveOptions(this.localOptions); // Call your manager to save
      this.$emit('options-saved', this.localOptions); // Emit event with new options
    },
    cancelOptions() {
      // Reset local options to initial state if cancelled
      this.localOptions = { ...this.initialOptions };
      this.$emit('options-canceled'); // Emit event
    },
  },
  created() {
    // Ensure initial options are loaded correctly when component is created
    this.localOptions = { ...this.initialOptions };
  }
});
</script>

<style scoped>
/* --- Popup Overlay (Same as sound popup) --- */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* --- Options Popup Container (Styled like sound popup / main menu) --- */
.options-popup-container {
  width: 500px; /* Wider to accommodate checkboxes and labels */
  max-width: 90%;
  padding: 20px;
  border-radius: 20px;
  box-shadow:
    0 0 0 5px #2F4F4F,
    0 0 0 7px #A17A50,
    0 0 20px rgba(0, 0, 0, 0.7);
  /* Changed background to dark stone/metal texture */
  background-image: url('../assets/Menus/darkSlate1.png'); /* Placeholder for dark stone/metal texture */
  background-color: #2F4F4F; /* Fallback to dark slate gray */
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.options-popup-background {
  width: 100%;
  height: 100%;
  padding: 20px;
  border-radius: 15px;
}

.popup-title {
  font-family: 'Cinzel Decorative', sans-serif; /* Consistent title font */
  font-size: 2.5em; /* Smaller than main logo, but still prominent */
  color: #7A5B8C; /* Brighter plum for title */
  color: white;
  /*text-shadow:
    -1px -1px 0px #A17A50,
    1px 1px 0px #8B7355,
    0 0 8px rgba(255, 215, 0, 0.3); */
  margin-bottom: 30px;
  text-align: center;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 15px; /* Space between option rows */
  width: 80%; /* Width of the options list */
  margin-bottom: 30px; /* Space before buttons */
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Space out checkbox/indicator and label */
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 8px;
  /* background-color: rgba(47, 79, 79, 0.8); Dark Slate Gray with slight transparency */
  background-color: rgba(94, 59, 104, 0.8);
  box-shadow: inset 0 0 5px rgba(0,0,0,0.5); /* Subtle inner shadow */
  transition: background-color 0.2s ease;
}

.option-item:hover {
  /*background-color: rgba(58, 95, 95, 0.9); */ /* Slightly lighter on hover */
  background-color: rgba(114, 79, 124, 0.9); /* Slightly lighter plum color */
}

.option-label {
  font-family: 'Exo 2', sans-serif; /* Your main UI font */
  font-size: 1.2em;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
  flex-grow: 1; /* Allow label to take up remaining space */
  text-align: left; /* Align label text to the left */
  margin-left: 15px; /* Space between custom checkbox and label */
}

/* Hide the native checkbox */
.option-item input[type="checkbox"] {
  display: none;
}

/* Custom Checkbox Appearance */
.custom-checkbox {
  width: 25px; /* Size of the custom checkbox square */
  height: 25px;
  border-radius: 5px; /* Slightly rounded corners */
  background-color: #2F4F4F; /* Dark Slate Gray for the checkbox base */
  border: 2px solid #A17A50; /* Gold/bronze border for the checkbox */
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2), /* Inner highlight */
    inset -1px -1px 2px rgba(0, 0, 0, 0.4);    /* Inner shadow */
  transition: all 0.2s ease;
}

/* Indicator (the "V") */
.checkbox-indicator {
  font-size: 1.5em; /* Size of the checkmark */
  color: #FFD700; /* Bright gold for the checkmark */
  line-height: 1; /* Adjust vertical alignment */
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.7); /* Subtle glow for the V */
}

/* When the custom checkbox is checked, maybe a slight change to its background */
.option-item input[type="checkbox"]:checked + .custom-checkbox {
  background-color: #3A5F5F; /* Slightly different background when checked */
  box-shadow:
    inset 0 0 5px rgba(0,0,0,0.7), /* Deeper inner shadow when checked */
    0 0 5px rgba(255, 215, 0, 0.4); /* Subtle outer glow when checked */
}


/* --- Buttons (Reuse game-button style) --- */
.popup-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  width: 100%;
}

.game-button {
  font-family: 'Exo 2', sans-serif;
  font-size: 1.2em; /* Slightly smaller for popup */
  color: white;
  padding: 10px 25px;
  border-radius: 20px;
  flex: 1;
  max-width: 150px;

  /* background-color: #2F4F4F; */
  background-color: #5E3B68;
  border: none;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2),
    inset -1px -1px 2px rgba(0, 0, 0, 0.4),
    0 0 0 2px #A17A50,
    0 0 0 3px #8B7355,
    3px 3px 6px rgba(0, 0, 0, 0.4);
  transition: all 0.15s ease-in-out;
}

.game-button:hover {
  background-color: #7A5B8C;
  cursor: pointer;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.3),
    inset -1px -1px 2px rgba(0, 0, 0, 0.5),
    0 0 0 2px #FFD700,
    0 0 0 3px #CDAD00,
    5px 5px 10px rgba(0, 0, 0, 0.6);
}

.game-button:active {
  background-color: #7A5B8C;
  box-shadow:
    inset 0px 0px 5px rgba(0, 0, 0, 0.8),
    0 0 0 2px #A17A50,
    1px 1px 3px rgba(0, 0, 0, 0.3);
  transform: translateY(1px);
}

/* Font Imports (if not global) */
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&display=swap');
/* @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&family=Metal+Mania&display=swap'); */
</style>
