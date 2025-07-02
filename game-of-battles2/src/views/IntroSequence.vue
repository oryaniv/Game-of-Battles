<template>
  <div class="intro-sequence-container">
    <!-- Text 1: "You must rise to the challenge," -->
    <Transition name="fade-in-out">
      <p v-if="currentStep === 1" class="intro-text">You must rise to the challenge</p>
    </Transition>

    <!-- Text 2: "Or else, you will..." -->
    <Transition name="fade-in-out">
      <p v-if="currentStep === 2" class="intro-text">Or else, you will...</p>
    </Transition>

    <!-- Game Logo -->
    <Transition name="fade-in-only">
      <div v-if="currentStep >= 3" class="logo-wrapper">
        <GameLogo /> <!-- Your GameLogo component -->
      </div>
    </Transition>

    <!-- Press Any Key Text -->
    <Transition name="fade-in-out">
      <p v-if="currentStep === 4" class="press-any-key-text">Press any key to start</p>
    </Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
// Assuming GameLogo.vue is in the same directory or correctly aliased
import GameLogo from '../components/GameLogo.vue'; // Adjust path as needed
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'IntroSequence',
  components: {
    GameLogo, // Register the GameLogo component
  },
  setup() {

    const router = useRouter();
    const currentStep = ref(0); // 0: initial, 1: text1, 2: text2, 3: logo, 4: press any key

    const sequenceTimers: ReturnType<typeof setTimeout>[] = [];

    const startSequence = () => {
      // Step 1: Show "You must rise to the challenge,"
      sequenceTimers.push(setTimeout(() => {
        currentStep.value = 1;
      }, 500)); // Short delay before first text appears

      // Step 2: Show "Or else, you will..."
      sequenceTimers.push(setTimeout(() => {
        currentStep.value = 0; // Hide text1
        currentStep.value = 2; // Show text2
      }, 500 + 2000)); // 0.5s initial + 2s display for text1

      // Step 3: Show GameLogo
      sequenceTimers.push(setTimeout(() => {
        currentStep.value = 0; // Hide text2
        currentStep.value = 3; // Show logo
      }, 500 + 2000 + 2000)); // 0.5s initial + 2s text1 + 2s text2

      // Step 4: Show "Press any key to start"
      sequenceTimers.push(setTimeout(() => {
        currentStep.value = 4; // Show press any key text
        // Add global keydown listener ONLY at the final step
        window.addEventListener('keydown', handleKeyPress);
      }, 500 + 2000 + 2000 + 2000)); // 0.5s initial + 2s text1 + 2s text2 + 2s logo
    };

    const handleKeyPress = () => {
      if (currentStep.value === 4) {
        // Navigate to MainMenu
        console.log('Key pressed! Navigating to /MainMenu');
        // IMPORTANT: Replace with your actual Vue Router navigation
        // For example: this.$router.push('/MainMenu');
        // As this is a setup function, you might need to access router via useRoute/useRouter if applicable
        // Or if using Options API for routing, this.$router would be available directly.
        // For demonstration, we'll just log.
        router.push("/MainMenu");
      }
    };

    onMounted(() => {
      startSequence();
    });

    onBeforeUnmount(() => {
      // Clear all pending timeouts to prevent memory leaks if component unmounts early
      sequenceTimers.forEach(timerId => clearTimeout(timerId));
      // Remove the keydown listener
      window.removeEventListener('keydown', handleKeyPress);
    });

    return {
      currentStep,
    };
  },
});
</script>

<style scoped>
.intro-sequence-container {
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

.intro-text {
  font-family: 'Cinzel Decorative', serif; /* Cinzel Decorative font */
  font-size: 3.5em; /* Adjust size as needed */
  color: white;
  text-align: center;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.7); /* Soft white glow */
  margin: 0; /* Remove default paragraph margins */
  position: absolute; /* Position centrally */
}

.logo-wrapper {
  /* This wrapper helps center the GameLogo component and manage its visibility */
  position: absolute;
  /* The GameLogo component itself should handle its own sizing/centering within this wrapper */
}

.press-any-key-text {
  font-family: 'Exo 2', sans-serif; /* Your main UI font */
  font-size: 1.5em;
  color: white;
  text-align: center;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); /* Subtle white glow */
  margin-top: 180px; /* Position below the logo */
  position: absolute; /* Position relative to container */
}


/* --- Vue Transition Styles for Fading --- */
.fade-in-out-enter-active,
.fade-in-out-leave-active,
.fade-in-only-enter-active,
.fade-in-only-leave-active {
  transition: opacity 1s ease-in-out; /* 1 second fade duration */
  position: absolute; /* Needed for elements to overlap during transition */
}

.fade-in-out-enter-from,
.fade-in-out-leave-to {
  opacity: 0;
}

.fade-in-out-enter-to,
.fade-in-out-leave-from {
  opacity: 1;
}

.fade-in-only-enter-from{
  opacity: 0;
}


/* --- Font Imports (if not global) --- */
/* You would include these in your main CSS file or App.vue's style block */
/* @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Exo+2:wght@400;700&family=Metal+Mania&display=swap'); */
</style>
