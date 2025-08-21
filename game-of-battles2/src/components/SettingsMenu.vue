<template>
  <div class="popup-overlay">
    <div class="options-popup-container">
      <div class="options-popup-background">
        <h2 class="popup-title">Settings</h2>

        <!-- <div class="setting-tabs-container">
          <div class="setting-tab">
            <button class="setting-tab-label" @click="changeTab('general')">General</button>
          </div>
          <div class="setting-tab">
            <button class="setting-tab-label" @click="changeTab('sound')">Sound</button> 
          </div>
        </div> -->
        

        <div class="options-list">
          <!-- Sound On Checkbox -->
          <label class="option-item" @mouseover="changeDescriptionText('Toggle sound on/off')" @mouseleave="changeDescriptionText('')">
            <input type="checkbox" v-model="localOptions.soundOn" @change="playCheckboxSound"/>
            <span class="option-label">Sound On</span>
            <span class="custom-checkbox">
              <span v-if="localOptions.soundOn" class="checkbox-indicator">✔</span>
            </span>
          </label>

          <!-- SFX Volume Slider -->
          <label class="option-item" @mouseenter="changeDescriptionText('Adjust SFX sound volume')" @mouseleave="changeDescriptionText('')">
            <span class="option-label">SFX Volume</span>
            <input type="range" v-model="localOptions.sfxVolume" min="0" max="1" step="0.1" />
            <span class="volume-value">{{ localOptions.sfxVolume * 100 }}</span>
          </label>

          <label class="option-item" @mouseenter="changeDescriptionText('Adjust Music volume')" @mouseleave="changeDescriptionText('')">
            <span class="option-label">Music Volume</span>
            <input type="range" v-model="localOptions.musicVolume" min="0" max="1" step="0.1" />
            <span class="volume-value">{{ localOptions.musicVolume * 100 }}</span>
          </label>

          <!-- Show Grid Bars Checkbox -->
          <label class="option-item" @mouseenter="changeDescriptionText('Check in order to make board grid bars fully visible')" @mouseleave="changeDescriptionText('')">
            <input type="checkbox" v-model="localOptions.showGridBars" @change="playCheckboxSound"/>
            <span class="option-label">Show Grid Bars</span>
            <span class="custom-checkbox">
              <span v-if="localOptions.showGridBars" class="checkbox-indicator">✔</span>
            </span>
          </label>

          <!-- Disable Battle Comments Checkbox -->
          <label class="option-item" @mouseenter="changeDescriptionText('Check to disable side comments in battle')" @mouseleave="changeDescriptionText('')">
            <input type="checkbox" v-model="localOptions.disableBattleComments" @change="playCheckboxSound"/>
            <span class="option-label">Disable In-Battle Comments</span>
            <span class="custom-checkbox">
              <span v-if="localOptions.disableBattleComments" class="checkbox-indicator">✔</span>
            </span>
          </label>

          <!-- Disable Post Battle Comments Checkbox -->
          <label class="option-item" @mouseenter="changeDescriptionText('Check to stop the game from mocking the player for losing')" @mouseleave="changeDescriptionText('')">
            <input type="checkbox" v-model="localOptions.disablePostBattleComments" @change="playCheckboxSound"/>
            <span class="option-label">Disable Post-Battle Insults</span>
            <span class="custom-checkbox">
              <span v-if="localOptions.disablePostBattleComments" class="checkbox-indicator">✔</span>
            </span>
          </label>
        </div>

        <div class="popup-actions">
          <button @click="saveOptions" class="game-button">Save</button>
          <button @click="cancelOptions" class="game-button">Cancel</button>
        </div>

        <DescriptionCloud v-show="descriptionText" :text="descriptionText" class="settings-description-cloud" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import DescriptionCloud from './DescriptionCloud.vue';
import OptionsManager from '../GameData/OptionsManager';
import { GameOptions } from '../GameData/OptionsManager';
import { SoundManager } from '../GameData/SoundManager';
import { SoundByte } from '../GameData/SoundLibrary';


function loadOptions(): GameOptions {
  return {
    soundOn: optionsManager.getSoundOn(),
    showGridBars: optionsManager.getShowGridBars(),
    disableBattleComments: optionsManager.getDisableBattleComments(),
    disablePostBattleComments: optionsManager.getDisablePostBattleComments(),
    sfxVolume: optionsManager.getSFXVolume(),
    musicVolume: optionsManager.getMusicVolume(),
  };
}

function saveOptions(options: GameOptions): void {
  optionsManager.setSoundOn(options.soundOn);
  optionsManager.setShowGridBars(options.showGridBars);
  optionsManager.setDisableBattleComments(options.disableBattleComments);
  optionsManager.setDisablePostBattleComments(options.disablePostBattleComments);
  optionsManager.setSFXVolume(options.sfxVolume);
  SoundManager.getInstance().updateSFXVolume(options.sfxVolume);
  optionsManager.setMusicVolume(options.musicVolume);
  SoundManager.getInstance().updateMusicVolume(options.musicVolume);

  if(!options.soundOn) {
    SoundManager.getInstance().updateMusicVolume(0);
  } else {
    SoundManager.getInstance().updateMusicVolume(options.musicVolume);
  }


  SoundManager.getInstance().playSound(SoundByte.WRITING);
}

const optionsManager = OptionsManager.getInstance(); // Instantiate your options manager

export default defineComponent({
  name: 'OptionsPopup',
  components: {
    DescriptionCloud
  },
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
    saveOptions() {
      saveOptions(this.localOptions); // Call your manager to save
      this.$emit('options-saved', this.localOptions); // Emit event with new options
    },
    cancelOptions() {
      // Reset local options to initial state if cancelled
      SoundManager.getInstance().playSound(SoundByte.CANCEL);
      this.localOptions = { ...this.initialOptions };
      this.$emit('options-canceled'); // Emit event
    },
  },
  created() {
    // Ensure initial options are loaded correctly when component is created
    this.localOptions = { ...this.initialOptions };
  },
  setup() {
    const descriptionText = ref('');
    
    const changeDescriptionText = (text: string) => {
      descriptionText.value = text;
    }

    const changeTab = (tab: string) => {
      console.log(tab);
    }

    const playCheckboxSound = () => {
      SoundManager.getInstance().playSound(SoundByte.CHECKBOX_CHECK);
    }

    return {
      changeTab,
      changeDescriptionText,
      descriptionText,
      playCheckboxSound,
    }
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
  position: relative;
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

.setting-tabs-container {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.setting-tab {
  background-color: #5E3B68;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
}

.setting-tab-label {
  font-family: 'Exo 2', sans-serif;
  font-size: 1.2em;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
}

.setting-tab-label:hover {
  background-color: #7A5B8C;
  cursor: pointer;
}

.setting-tab-label.active {
  background-color: #7A5B8C;
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

.settings-description-cloud {
  position: absolute;
  bottom: -20%;
  left: 50%;
  transform: translateX(-50%);
  max-width: 80%;
}

input[type="range"] {
    -webkit-appearance: none; /* Remove default styling for WebKit browsers */
    width: 50%;
    height: 10px; /* Thinner track for the actual range input */
    background: transparent; /* Make the default track transparent */
    outline: none;
    margin: 0;
    padding: 0;
    transform: translateY(25%);
    z-index: 2; /* Ensure the thumb is above the custom track */
}

/* Custom track styling */
input[type="range"]::-webkit-slider-runnable-track {
    width: 100%;
    height: 10px;
    background: linear-gradient(to right, #f0c040, #e0a020); /* Gold gradient for the filled part */
    border-radius: 5px; /* Rounded track */
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

input[type="range"]::-moz-range-track {
    width: 100%;
    height: 10px;
    background: linear-gradient(to right, #f0c040, #e0a020); /* Gold gradient for the filled part */
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

/* Custom thumb styling */
input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px; /* Larger thumb */
    height: 24px;
    border-radius: 50%; /* Circular thumb */
    background: #f0c040; /* Gold color for thumb */
    cursor: pointer;
    margin-top: -7px; /* Adjust to center thumb on track */
    box-shadow: 0 0 8px rgba(240, 192, 64, 0.7); /* Glow effect */
    border: 2px solid #fff; /* White border for contrast */
    transition: background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

input[type="range"]::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #f0c040;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(240, 192, 64, 0.7);
    border: 2px solid #fff;
    transition: background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

input[type="range"]::-webkit-slider-thumb:hover {
    background: #ffd700; /* Lighter gold on hover */
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.9);
}

input[type="range"]::-moz-range-thumb:hover {
    background: #ffd700;
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.9);
}

.volume-value {
  font-family: 'Exo 2', sans-serif;
  font-size: 1.2em;
  color: #ffd700;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
  margin-left: 10px;
  width: 30px;
}

/* Font Imports (if not global) */
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&display=swap');
/* @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&family=Metal+Mania&display=swap'); */
</style>
