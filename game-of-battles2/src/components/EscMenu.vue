<template>
 <div class="esc-menu-overlay">
    <div class="esc-menu-container">
        <div class="esc-menu-content">
            <h3 class="esc-menu-subtitle">Umbral Moon</h3>
            <h1 class="esc-menu-title">Di<img class="skull-icon" src="../assets/Skull_and_crossbones.svg" alt="Skull" /> For Me!</h1>
            <div class="esc-menu-options">
                <button @click="dismissEscMenu" class="esc-menu-option">
                    Continue
                </button>
                <button @click="openSettingsMenu" class="esc-menu-option">
                    Settings
                </button>
                <button @click="shouldReturnToMainMenu" class="esc-menu-option">
                    Main Menu
                </button>
            </div>
        </div>
    </div>

    <SettingsMenu v-if="showSettingsMenu" @options-saved="onOptionsSaved" @options-canceled="onOptionsCanceled"/>

    <GameMessagePrompt v-if="showAreYouSurePopup"
      :show="showAreYouSurePopup"
      :title="popupTitle"
      :message="popupMessage"
      :yesButtonText="yesButtonText"
      :noButtonText="noButtonText"
      @dismissed="handlePopupDismissed"
    />
 </div>

</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router'
import GameMessagePrompt from './GameMessagePrompt.vue';
import SettingsMenu from './SettingsMenu.vue';

export default defineComponent({
    name: 'EscMenu',
    emits: ['esc-menu-dismissed', 'options-saved'],
    components: {
        SettingsMenu,
        GameMessagePrompt,
    },
    setup(props, {emit}) {

        const router = useRouter();

        const showSettingsMenu = ref(false);

        const dismissEscMenu = () => {
            emit('esc-menu-dismissed');
        }

        const shouldReturnToMainMenu = () => {
            showAreYouSurePopup.value = true;
        }

        const ReturnToMainMenu = () => {
            router.push("/MainMenu");
        }

        const openSettingsMenu = () => {
            showSettingsMenu.value = true;
        }

        const showAreYouSurePopup = ref(false);
        const popupTitle = ref('Hold on...');
        const popupMessage = ref('Are you sure you want to return to the main menu? All your progress will be lost.');
        const handlePopupDismissed = (confirm: boolean) => {
            showAreYouSurePopup.value = false;
            if(confirm) {
               ReturnToMainMenu();
            }
        }

        const onOptionsSaved = () => {
           showSettingsMenu.value = false;
           emit('options-saved');
        };

        const onOptionsCanceled = () => {
           showSettingsMenu.value = false;
        };

        const yesButtonText = ref('Afraid so...');
        const noButtonText = ref('Hell No!');

        return {
            dismissEscMenu,
            openSettingsMenu,
            showSettingsMenu,
            showAreYouSurePopup,
            popupTitle,
            popupMessage,
            handlePopupDismissed,
            shouldReturnToMainMenu,
            onOptionsSaved,
            onOptionsCanceled,
            yesButtonText,
            noButtonText
        }
    }
})
</script>

<style scoped>

h1.esc-menu-title {
  font-family: 'Metal Mania', sans-serif; /* Your logo font for the title */
  margin-top: -20px;
  font-size: 2.5em; /* Large size for main title */
  color: #7A5B8C; /* Your chosen brighter plum for the logo text */
  text-shadow:
    -1px -1px 0px #A17A50,
    1px 1px 0px #8B7355,
    0 0 10px rgba(255, 215, 0, 0.4);
  text-align: center;
}

h3.esc-menu-subtitle {
  font-family: 'Cinzel Decorative';
  margin: -0.75em 0 1.5em 0;
  font-size: 1em;
  font-style: italic;
  font-weight: bold;
  text-align: center;
  color: black;
  text-shadow:
    -1px -1px 0px #7A5B8C,
    1px 1px 0px #5E3B68,
    0 0 10px rgba(255, 215, 0, 0.4);
}

.esc-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999999;
  backdrop-filter: blur(2px);
}

.esc-menu-container {
  width: 450px; /* Wider for dialogue */
  max-width: 90%;
  padding: 25px;
  min-height: 200px; /* Ensure space for content */

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

.esc-menu-options {
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 25px;
  flex-direction: column;
}

.esc-menu-option {
  font-family: 'Exo 2', sans-serif;
  font-size: 1.1em;
  color: white;
  padding: 10px 25px;
  border-radius: 20px;
  min-width: 200px;

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

.esc-menu-option:hover {
  background-color: #3A5F5F;
  cursor: pointer;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.3),
    inset -1px -1px 2px rgba(0, 0, 0, 0.5),
    0 0 0 2px #FFD700,
    0 0 0 3px #CDAD00,
    5px 5px 10px rgba(0, 0, 0, 0.6);
}

.esc-menu-option:active {
  background-color: #2A4545;
  box-shadow:
    inset 0px 0px 5px rgba(0, 0, 0, 0.8),
    0 0 0 2px #A17A50,
    1px 1px 3px rgba(0, 0, 0, 0.3);
  transform: translateY(1px);
}

.skull-icon {
  width: 40px;
  height: 40px;
  vertical-align: middle;
}

</style>