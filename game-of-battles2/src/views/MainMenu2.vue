<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="main-menu-container-arc">
      <h3 v-if="!newGameMode" class="main-menu-subtitle-arc">Umbral Moon</h3>
      <h1 v-if="!newGameMode" class="main-menu-title-arc">Di<img class="skull-icon" src="../assets/Skull_and_crossbones.svg" alt="Skull" /> For Me!</h1>

      <h2 v-if="newGameMode" class="new-game-title">New Game</h2>

      <div class="menu-arc-container" :class="{'menu-arc-container-small': !suitableScreenSize()}">
        <!-- Central Glowing Arc/Moon Element -->
        <div class="central-glowing-arc">
          <div class="central-arc-inner"></div> <!-- For the crescent effect -->
        </div>

        <!-- Menu Options arranged in an arc -->
        <div v-if="!newGameMode">
            <button
            v-for="(item, index) in mainMenuItems"
            :key="item.id"
            class="menu-option-panel-arc"
            @click="item.onPress()"
            @mouseenter="showDescription = true; description = item.description; playHoverSound()"
            @mouseleave="showDescription = false; description = ''"
            :style="getArcButtonPosition(index, mainMenuItems.length)"
            >
            {{ item.label }}
            </button>
        </div>

        <div v-if="newGameMode">
            <button
            v-for="(item, index) in newGameMenuItems"
            :key="item.id"
            class="menu-option-panel-arc"
            @click="item.onPress()"
            @mouseenter="showDescription = true; description = item.description; playHoverSound()"
            @mouseleave="showDescription = false; description = ''"
            :style="getArcButtonPosition(index, newGameMenuItems.length)"
            >
            {{ item.label }}
            </button>
        </div>

      </div>
    </div>

    <DescriptionCloud class="description-cloud" v-if="showDescription && suitableScreenSize()" :text="description" />

    <SettingsMenu v-if="optionsMode" @options-saved="onOptionsSaved" @options-canceled="onOptionsCanceled" />

    <GameMessagePrompt v-if="showTutorialPopup"
      :show="showTutorialPopup"
      :title="popupTitle"
      :message="popupMessage"
      @dismissed="handlePopupDismissed"
    />

    <GameMessagePopup v-if="showMessagePopup"
      :show="showMessagePopup"
      :title="messagePopupTitle"
      :message="messagePopupMessage"
      @dismissed="handleMessagePopupDismissed"
    />

    <div class="circle-of-hex-logo">
       <img class="hex-logo" src="../assets/Logo/FCOH_circle_without_50mt.png" alt="Hex Logo" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import DescriptionCloud from '../components/DescriptionCloud.vue';
import SettingsMenu from '../components/SettingsMenu.vue';
import { useRouter } from 'vue-router'
import GameMessagePrompt from '@/components/GameMessagePrompt.vue';
import GameMessagePopup from '@/components/GameMessagePopup.vue';
// import { SoundManager } from '@/GameData/SoundManager';
//import { SoundByte, Track } from '@/GameData/SoundLibrary';
import { playMenuButtonSound, playHoverSound } from '@/GameData/SoundUtils';



export default defineComponent({
  components: {
    DescriptionCloud,
    SettingsMenu, 
    GameMessagePrompt,
    GameMessagePopup
  },
  
  setup() {
    const router = useRouter();
    
    const mainMenuItems = ([
      { id: 3, label: 'Credits', onPress: () => { playMenuButtonSound(); showCredits(); }, description: 'Show game credits' },
      { id: 1, label: 'New Game', onPress: () => { playMenuButtonSound(); newGameMode.value = true; }, description: 'Play against the AI or another player' },
      { id: 2, label: 'Settings', onPress: () => { playMenuButtonSound(); optionsMode.value = true; }, description: 'Change game settings' },
      { id: 4, label: 'About us', onPress: () => { playMenuButtonSound(); showAboutUs(); aboutMode.value = true; }, description: 'Learn about the developers' },
    ]);

    const newGameMenuItems = ref([
      { id: 3, label: 'Tutorial', onPress: () => { playMenuButtonSound(); startTutorial(); }, description: 'Learn how to play' },
      { id: 1, label: 'Single Player',  onPress: () => { playMenuButtonSound(); startSinglePlayer(); }, description: 'Play against the AI' },
      { id: 2, label: 'Showdown', onPress: () => { playMenuButtonSound(); startShowdown(); }, description: 'Play against another player' },
      { id: 4, label: 'Back', onPress: () => { playMenuButtonSound(); newGameMode.value = false; }, description: 'Back to Main menu' }
    ]);

    const handleMenuItemClick = (label: string) => {
      console.log(`Clicked: ${label}`);
      // In your actual game, this would trigger router navigation etc.
    };

    // Function to calculate position for arc buttons
    const getArcButtonPosition = (index: number, totalItems: number) => {
      const radius = 180; // Distance from center of arc to center of button (pixels)
      const startAngle = 135; // Angle where the first button is placed (degrees, 0 is right, 90 is down)
      const arcSpread = 270; // Total degrees the buttons spread across
      
      // Calculate angle for current button, adjusted by total items for even spread
      const angleIncrement = totalItems > 1 ? arcSpread / (totalItems - 1) : 0;
      const currentAngleRad = (startAngle + (index * angleIncrement)) * (Math.PI / 180); // Convert to radians

      // Calculate X, Y position relative to the center of the arc container
      const x = radius * Math.cos(currentAngleRad);
      const y = radius * Math.sin(currentAngleRad);

      // Adjust for button's own size so its center is at (x,y)
      // And apply inverse rotation to keep text straight
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: `translate(-50%, -50%) rotate(${currentAngleRad * (180 / Math.PI)}deg) rotate(-${currentAngleRad * (180 / Math.PI)}deg)` // Keep button text horizontal
      };
    };

    const newGameMode = ref(false);
    const optionsMode = ref(false);
    const creditsMode = ref(false);
    const aboutMode = ref(false);
    const showDescription = ref(false);
    const description = ref('');
    const showMessagePopup = ref(false);
    const messagePopupTitle = ref('');
    const messagePopupMessage = ref('');
    const handleMessagePopupDismissed = () => {
      showMessagePopup.value = false;
    };


    const onOptionsSaved = () => {
      optionsMode.value = false;
    };
    const onOptionsCanceled = () => {
      optionsMode.value = false;
    };

    const showCredits = () => {
      showMessagePopup.value = true;
      messagePopupTitle.value = 'One moment...';
      messagePopupMessage.value = 'Credits are not available in this Beta.';
      // router.push("/Credits");
    };

    const startSinglePlayer = () => {
      if(newPlayer) {
        suggestTutorial();
        return;
      }
      router.push("/Team");
    };

    const startTutorial = () => {
      router.push("/TutorialList");
    };

    const startShowdown = () => {
      showMessagePopup.value = true;
      messagePopupTitle.value = 'One moment...';
      messagePopupMessage.value = 'Showdown is not available in this Beta. Why don\'t you try single player or tutorial?';
    };

    const showAboutUs = () => {
      showMessagePopup.value = true;
      messagePopupTitle.value = 'Yeah, yeah...';
      messagePopupMessage.value = 'Come on, you know me. I\'ll update this for those who don\'t when the game is released.';
    };

    const suggestTutorial = () => {
      showTutorialPopup.value = true;
    };

    let newPlayer = false;

    const showTutorialPopup = ref(false);
    const popupTitle = ref('Hold on...');
    const popupMessage = ref('Looks like you are a new player. Care to try the tutorial first?');
    const handlePopupDismissed = (confirm: boolean) => {
      showTutorialPopup.value = false;
      if(confirm) {
        startTutorial();
      } else {
        newPlayer = false;
        startSinglePlayer();
      }
    };

    const suitableScreenSize = () => {
      return window.innerHeight > 800;
    };

    return {
      mainMenuItems,
      handleMenuItemClick,
      getArcButtonPosition,
      newGameMenuItems,
      newGameMode,
      optionsMode,
      creditsMode,
      aboutMode,
      showDescription,
      description,
      onOptionsSaved,
      onOptionsCanceled,
      showTutorialPopup,
      popupTitle,
      popupMessage,
      handlePopupDismissed,
      playHoverSound,
      showMessagePopup,
      handleMessagePopupDismissed,
      messagePopupTitle,
      messagePopupMessage,
      showAboutUs,
      suitableScreenSize
    };
  },
});
</script>

<style scoped>

/* html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; 
  background-color: black; 
}

.min-h-screen {
  width: 100vw; 
  height: 100vh; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem; 
  box-sizing: border-box; 
  overflow: hidden; 
  position: relative; 
}
.flex {
  display: flex;
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.p-4 {
  padding: 1rem; 
}

.skull-icon {
  width: 90px;
  height: 90px;
  vertical-align: middle;
}

.main-menu-container-arc {
  background-color: #5E3B68;
  background-image: url('../assets/Menus/plumMarble3.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  padding: 40px; 
  border-radius: 20px; 
  
  display: flex;
  flex-direction: column;
  align-items: center; 
  
  box-shadow:
    0 0 0 5px #2F4F4F, 
    0 0 0 7px #A17A50, 
    0 0 20px rgba(0, 0, 0, 0.7); 
  
  max-width: 600px; 
  width: 90%; 
  min-height: 550px; 
  justify-content: flex-start; 
  position: relative; 
  margin-top: -40px;
}

.main-menu-title-arc {
  font-family: 'Metal Mania', sans-serif; 
  margin-top: -10px;
  font-size: 5.5em; 
  color: #7A5B8C; 
  text-shadow:
    -1px -1px 0px #A17A50,
    1px 1px 0px #8B7355,
    0 0 10px rgba(255, 215, 0, 0.4);
  text-align: center;
}

.main-menu-subtitle-arc {
    margin-top: -30px;
    margin-bottom: 10px;
    
    font-family: 'Cinzel Decorative';
    font-size: 24px;
    font-style: italic;
    font-weight: bold;
    text-align: center;


    color: black;
    text-shadow:
    -1px -1px 0px #7A5B8C,
    1px 1px 0px #5E3B68,
    0 0 10px rgba(255, 215, 0, 0.4);
}

.new-game-title {
  font-family: 'Cinzel Decorative';
  color: white;
  font-size: 2.5em;
}

.menu-arc-container {
  position: absolute;
  top: 60%; 
  left: 50%;
  transform: translate(-50%, -50%); 
  width: 400px; 
  height: 400px; 
  display: flex;
  justify-content: center;
  align-items: center;
}

.central-glowing-arc {
  width: 80%; 
  height: 80%;
  border-radius: 50%;
  background-image: url('../assets/Menus/darkSlate1.png');
  background-color: #5E3B68;
  background-size: cover;
  background-position: center;
  position: absolute;
  box-shadow: 0 0 25px 8px rgba(255, 215, 0, 0.8); 
  overflow: hidden; 
  transform: rotate(-30deg); 
}

.central-arc-inner {
    background-color: black;
    width: 86%;
    height: 91%;
    border-radius: 50%;
    position: absolute;
    top: 44%;
    left: 63%;
    transform: translate(-50%, -50%) translateX(-20%);
}


.menu-option-panel-arc {
  font-family: 'Exo 2', sans-serif;
  font-size: 1.2em; 
  font-weight: bold;
  color: white;
  text-align: center;
  padding: 10px 15px; 
  border-radius: 10px;
  cursor: pointer;

  background-color: #2F4F4F; 
  border: none;
  box-shadow:
    inset 2px 2px 5px rgba(0, 0, 0, 0.6),
    inset -2px -2px 5px rgba(255, 255, 255, 0.1),
    0 0 0 2px rgba(161, 122, 80, 0.7),
    0 0 0 3px rgba(139, 115, 85, 0.5),
    4px 4px 8px rgba(0, 0, 0, 0.5);

  transition: all 0.2s ease-in-out;
  position: absolute; 
  min-width: 120px; 
}

.menu-option-panel-arc:hover {
  background-color: #3A5F5F;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2),
    inset -1px -1px 2px rgba(0, 0, 0, 0.4),
    0 0 0 2px #FFD700,
    0 0 0 3px #CDAD00,
    5px 5px 10px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px); 
}

.description-cloud {
  position: absolute;
  bottom: clamp(50px, 4%, 150px);
  left: 50%;
  transform: translate(-50%, 0%);
  z-index: 100;
  max-width: 20%;
}

.circle-of-hex-logo {
  position: absolute;
  bottom:0;
  right:0;
  z-index: 100;
  width: 100px;
  height: 100px;
}

.hex-logo {
  width: 100%;
  height: 100%;
} */

/* ************************************************** */

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; 
  background-color: black; 
}

.min-h-screen { 
  width: 100vw; 
  height: 100vh; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem; 
  box-sizing: border-box; 
  overflow: hidden; 
  position: relative; 
}

.skull-icon {
  width: clamp(40px, 6vw, 90px); 
  height: auto; 
  vertical-align: middle;
}

.main-menu-container-arc {
  background-color: #5E3B68;
  background-image: url('../assets/Menus/plumMarble3.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  padding: clamp(20px, 5vw, 40px); 
  border-radius: 20px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; 
  gap: clamp(10px, 2vh, 30px); 

  box-shadow:
    0 0 0 5px #2F4F4F,
    0 0 0 7px #A17A50,
    0 0 20px rgba(0, 0, 0, 0.7);

  width: clamp(300px, 80vw, 600px); 
  height: clamp(400px, 65vh, 700px); 
  
  position: relative; 
}

.main-menu-title-arc {
  font-family: 'Metal Mania', sans-serif;
  margin-top: 0; 
  font-size: clamp(20px, 8vw, 5.5em); 
  color: #7A5B8C;
  text-shadow:
    -1px -1px 0px #A17A50,
    1px 1px 0px #8B7355,
    0 0 10px rgba(255, 215, 0, 0.4);
  text-align: center;
  line-height: 1; 
}

.main-menu-subtitle-arc {
    margin-top: 0.5em;
    margin-bottom: 0;
    
    font-family: 'Cinzel Decorative';
    font-size: clamp(16px, 3vw, 24px); 
    font-style: italic;
    font-weight: bold;
    text-align: center;

    color: black;
    text-shadow:
    -1px -1px 0px #7A5B8C,
    1px 1px 0px #5E3B68,
    0 0 10px rgba(255, 215, 0, 0.4);
}

.new-game-title {
  font-family: 'Cinzel Decorative';
  color: white;
  font-size: clamp(1.5em, 4vw, 2.5em); 
}

.menu-arc-container {
  position: absolute;
  top: clamp(375px, 55%, 800px);
  left: 50%;
  transform: translate(-50%, -50%);
  width: clamp(250px, 60vw, 400px); 
  height: clamp(250px, 60vw, 400px); 
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-arc-container.menu-arc-container-small {
  top: clamp(350px, 45%, 450px);
  transform: translate(-50%, -50%) scale(0.9);
}

.central-glowing-arc {
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background-image: url('../assets/Menus/darkSlate1.png');
  background-color: #5E3B68;
  background-size: cover;
  background-position: center;
  position: absolute;
  box-shadow: 0 0 25px 8px rgba(255, 215, 0, 0.8);
  overflow: hidden;
  transform: rotate(-30deg);
}

.central-arc-inner {
    background-color: black;
    width: 86%;
    height: 91%;
    border-radius: 50%;
    position: absolute;
    top: 44%;
    left: 63%;
    transform: translate(-50%, -50%) translateX(-20%);
}

.menu-option-panel-arc {
  font-family: 'Exo 2', sans-serif;
  font-size: clamp(0.9em, 2vw, 1.2em); 
  font-weight: bold;
  color: white;
  text-align: center;
  padding: clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 15px); 
  border-radius: 10px;
  cursor: pointer;

  background-color: #2F4F4F;
  border: none;
  box-shadow:
    inset 2px 2px 5px rgba(0, 0, 0, 0.6),
    inset -2px -2px 5px rgba(255, 255, 255, 0.1),
    0 0 0 2px rgba(161, 122, 80, 0.7),
    0 0 0 3px rgba(139, 115, 85, 0.5),
    4px 4px 8px rgba(0, 0, 0, 0.5);

  transition: all 0.2s ease-in-out;
  position: absolute;
  min-width: clamp(80px, 15vw, 120px); 
}

.menu-option-panel-arc:hover {
  background-color: #3A5F5F;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2),
    inset -1px -1px 2px rgba(0, 0, 0, 0.4),
    0 0 0 2px #FFD700,
    0 0 0 3px #CDAD00,
    5px 5px 10px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}

.description-cloud {
  position: absolute;
  bottom: clamp(2px, 4%, 50px); 
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  max-width: clamp(200px, 30vw, 300px); 
  text-align: center; 
}

.circle-of-hex-logo {
  position: absolute;
  bottom: clamp(5px, 2vh, 10px); 
  right: clamp(5px, 2vw, 10px); 
  z-index: 100;
  width: clamp(60px, 10vw, 100px); 
  height: auto; 
}

.hex-logo {
  width: 100%;
  height: 100%;
} 

/* Ensure fonts are loaded if not globally */
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&family=Metal+Mania&display=swap');
</style>
