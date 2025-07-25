<template>
  <div :class="{ 'game-dialog-overlay-center': dialogMode === 0, 'game-dialog-overlay-side': dialogMode === 1 }">
    <div class="game-dialog-container">
      <!-- <h2 class="dialog-header">{{ currentDialog[0] }}</h2> -->
      <p class="dialog-text">{{ currentDialog[dialogIndex] }}</p>
      <div class="dialog-buttons">
        <button v-show="dialogIndex > 0" class="game-button dialog-button prev" @click="dialogIndex--">Prev</button>
        <button v-show="dialogIndex === currentDialog.length - 1"  class="game-button dialog-button yes-sir" @click="dismissDialog">Yes, Sir!</button>
        <button v-show="dialogIndex < currentDialog.length - 1" class="game-button dialog-button next" @click="dialogIndex++">Next</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { DialogStep, StepMode, stepType } from '../GameData/TutorialManager';


export default defineComponent({
  name: 'GameDialog2',
  props: {
    dialog: {
      type: Object as () => DialogStep,
      default: () => (
            { 
                id: 0,
                text: [],
                trigger: () => false,
                mode: StepMode.CENTER,
                done: false,
                stepType: stepType.REGULAR
            }
        )
    }
  },
  emits: ['dialog-dismissed'],
  setup(props, { emit }) {

    const dismissDialog = () => {
      emit('dialog-dismissed');
    };

    const dialogIndex = ref(0);

    return {
      dismissDialog,
      dialogIndex,
      currentDialog: props.dialog.text,
      dialogMode: props.dialog.mode
    };
  }
});
</script>

<style scoped>
.game-dialog-overlay-center {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* background-color: rgba(0, 0, 0, 0.7); */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500;
  /* backdrop-filter: blur(2px); */
}

.game-dialog-overlay-side {
  position: fixed;
  top: 32%;
  right: 20px;
  /* width: 100%;
  height: 100%; */
  /* background-color: rgba(0, 0, 0, 0.7); */
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  z-index: 1500;
  /* backdrop-filter: blur(2px); */
}

.game-dialog-overlay-center .game-dialog-container {
  width: 600px; /* Wider for dialogue */
  max-width: 90%;
  padding: 25px;
  min-height: 200px; /* Ensure space for content */
}

.game-dialog-overlay-side .game-dialog-container {
  width: 250px; 
  max-width: 250px;
  padding: 25px;
  min-height: 350px; 
}

.game-dialog-container {
  /* width: 600px; 
  max-width: 90%;
  padding: 25px;
  min-height: 200px;  */
  border-radius: 20px;
  box-shadow:
    0 0 0 5px #2F4F4F, /* Dark slate gray border */
    0 0 0 7px #A17A50, /* Gold/bronze accent border */
    0 0 25px rgba(0, 0, 0, 0.9); /* Stronger outer shadow */
  
  background-image: url('../assets/Menus/plumMarble4.png'); /* IMPORTANT: Update this path! */
  background-color: #5E3B68; /* Fallback plum */
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;

  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
 
}

.dialog-header {
  font-size: 24px;
  margin-bottom: 15px;
}

.dialog-text {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.dialog-buttons {
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-button.dialog-button {
  font-family: 'Exo 2', sans-serif;
  font-size: 1.1em;
  color: white;
  padding: 10px 25px;
  border-radius: 20px;
  min-width: 120px;

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

.game-button.dialog-button:hover {
  background-color: #3A5F5F;
  cursor: pointer;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.3),
    inset -1px -1px 2px rgba(0, 0, 0, 0.5),
    0 0 0 2px #FFD700,
    0 0 0 3px #CDAD00,
    5px 5px 10px rgba(0, 0, 0, 0.6);
}

.game-button.dialog-button:active {
  background-color: #2A4545;
  box-shadow:
    inset 0px 0px 5px rgba(0, 0, 0, 0.8),
    0 0 0 2px #A17A50,
    1px 1px 3px rgba(0, 0, 0, 0.3);
  transform: translateY(1px);
}

.game-button.dialog-button.yes-sir {
  
}

.game-button.dialog-button.next {
  margin-left: auto;
}

.game-button.dialog-button.prev {
  margin-right: auto;
}
</style>