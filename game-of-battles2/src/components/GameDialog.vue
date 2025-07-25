<template>
  <div v-if="isVisible" class="game-dialog-overlay">
    <div class="game-dialog-container">
      <div class="game-dialog-background">
        <h3 class="dialog-header">{{ currentDialog.header }}</h3>
        <p class="dialog-text">{{ currentDialog.text }}</p>

        <div class="dialog-actions">
          <!-- OK Button (for single messages) -->
          <button
            v-if="!isSequence"
            @click="dismissDialog"
            class="game-button dialog-button"
          >
            OK
          </button>

          <!-- Back/Next Buttons (for sequences) -->
          <button
            v-if="isSequence && currentStep > 0"
            @click="prevStep"
            class="game-button dialog-button"
          >
            Back
          </button>
          <button
            v-if="isSequence && currentStep < dialogSequence.length - 1"
            @click="nextStep"
            class="game-button dialog-button"
          >
            Next
          </button>
          <button
            v-if="isSequence && currentStep === dialogSequence.length - 1"
            @click="dismissDialog"
            class="game-button dialog-button"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';

// Define the structure for a single dialog message
export interface DialogMessage {
  header: string;
  text: string;
}

export default defineComponent({
  name: 'GameDialog',
  props: {
    // Prop to control visibility from parent
    show: {
      type: Boolean,
      default: false
    },
    // For a single message
    dialog: {
      type: Object as () => DialogMessage | null,
      default: null
    },
    // For a sequence of messages (e.g., tutorial, boss dialogue)
    sequence: {
      type: Array as () => DialogMessage[],
      default: () => []
    }
  },
  emits: ['dismissed', 'sequence-finished'], // Emit events when dialog is dismissed or sequence ends

  setup(props, { emit }) {
    const isVisible = ref(false);
    const currentStep = ref(0); // Current step in a sequence

    // Determine if it's a sequence or a single message
    // eslint-disable-next-line
    debugger;
    const isSequence = computed(() => props.sequence && props.sequence.length > 0);

    

    // The dialog content currently being displayed
    const currentDialog = computed<DialogMessage>(() => {
      // Ensure sequence is not empty before trying to access elements
      if (isSequence.value && props.sequence[currentStep.value]) {
        return props.sequence[currentStep.value];
      }
      return props.dialog || { header: '', text: '' };
    });

    // Watch for changes in the 'show' prop
    watch(() => props.show, (newVal) => {
      isVisible.value = newVal;
      if (newVal) {
        currentStep.value = 0; // Reset to first step when shown
      }
    }, { immediate: true }); // Add immediate: true to run watcher on initial component mount

    // Watch for changes in the 'sequence' prop itself, in case it's populated after initial render
    watch(() => props.sequence, (newSequence) => {
      if (newSequence && newSequence.length > 0 && props.show) {
        currentStep.value = 0; // Reset step if sequence changes while dialog is visible
      }
    });

    const dismissDialog = () => {
      isVisible.value = false;
      emit('dismissed');
      if (isSequence.value) { // Check isSequence.value here, not props.sequence.length
        emit('sequence-finished'); // Emit specific event for sequences
      }
    };

    const nextStep = () => {
      if (isSequence.value && currentStep.value < props.sequence.length - 1) {
        currentStep.value++;
      }
    };

    const prevStep = () => {
      if (isSequence.value && currentStep.value > 0) {
        currentStep.value--;
      }
    };

    return {
      isVisible,
      isSequence,
      currentStep,
      currentDialog,
      dismissDialog,
      nextStep,
      prevStep,
      dialogSequence: props.sequence // Expose props.sequence as dialogSequence for template
    };
  }
});
</script>

<style scoped>
/* --- Dialog Overlay (Similar to other popups) --- */
.game-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* Dim background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500; /* Between game messages and error popups */
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

/* --- Dialog Container --- */
.game-dialog-container {
  width: 600px; /* Wider for dialogue */
  max-width: 90%;
  padding: 25px;
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
  min-height: 200px; /* Ensure space for content */
}

.game-dialog-background {
  width: 100%;
  height: 100%;
  padding: 15px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* --- Dialog Header --- */
.dialog-header {
  font-family: 'Metal Mania', sans-serif;
  font-size: 2.2em; /* Prominent header */
  color: #FFD700; /* Gold color for headers */
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  margin-bottom: 20px;
  margin-top: 0;
  text-align: center;
}

/* --- Dialog Text Content --- */
.dialog-text {
  font-family: 'Exo 2', sans-serif;
  font-size: 1.1em;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
  line-height: 1.5;
  text-align: center; /* Center text */
  flex-grow: 1; /* Allow text to take up available space */
  margin-bottom: 30px; /* Space above buttons */
  overflow-y: auto; /* Allow scrolling for long text */
  max-height: 150px; /* Max height for scrollable text area */
}

/* --- Dialog Action Buttons --- */
.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

/* Reusing game-button styles */
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

/* Font Imports (if not global) */
/* @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&family=Metal+Mania&display=swap'); */
</style>