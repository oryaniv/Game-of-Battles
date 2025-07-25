<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="main-menu-container-arc">
      <h1 v-if="!newGameMode" class="main-menu-title-arc">DIE FOR ME</h1>
      <h2 v-if="!newGameMode" class="main-menu-subtitle-arc">Web Demo</h2>

      <h2 v-if="newGameMode" class="new-game-title">New Game</h2>

      <div class="menu-arc-container">
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
            @mouseover="showDescription = true; description = item.description"
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
            @mouseover="showDescription = true; description = item.description"
            @mouseleave="showDescription = false; description = ''"
            :style="getArcButtonPosition(index, newGameMenuItems.length)"
            >
            {{ item.label }}
            </button>
        </div>

      </div>
    </div>

    <DescriptionCloud class="description-cloud" v-if="showDescription" :text="description" />

    <SettingsMenu v-if="optionsMode" @options-saved="onOptionsSaved" @options-canceled="onOptionsCanceled" />

    <GameMessagePrompt v-if="showTutorialPopup"
      :show="showTutorialPopup"
      :title="popupTitle"
      :message="popupMessage"
      @dismissed="handlePopupDismissed"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import DescriptionCloud from '../components/DescriptionCloud.vue';
import SettingsMenu from '../components/SettingsMenu.vue';
import { useRouter } from 'vue-router'
import { RunManager, RunType } from '@/GameData/RunManager';
import { Team } from '@/logic/Team';
import { Difficulty } from "../GameOverMessageProvider";
import GameMessagePrompt from '@/components/GameMessagePrompt.vue';

// interface MenuItem {
//   id: number;
//   label: string;
//   onPress: () => void;
//   description: string;
// }

export default defineComponent({
  components: {
    DescriptionCloud,
    SettingsMenu, 
    GameMessagePrompt
  },
  setup() {

    const router = useRouter();
    
    const mainMenuItems = ([
      { id: 3, label: 'Credits', onPress: () => { showCredits(); }, description: 'Show game credits' },
      { id: 1, label: 'New Game', onPress: () => { newGameMode.value = true; }, description: 'Play against the AI or another player' },
      { id: 2, label: 'Settings', onPress: () => { optionsMode.value = true; }, description: 'Change game settings' },
      { id: 4, label: 'About Me', onPress: () => { aboutMode.value = true; }, description: 'About the developer' },
    ]);

    const newGameMenuItems = ref([
      { id: 3, label: 'Tutorial', onPress: () => { startTutorial(); }, description: 'Learn how to play' },
      { id: 1, label: 'Single Player',  onPress: () => { startSinglePlayer(); }, description: 'Play against the AI' },
      { id: 2, label: 'Showdown', onPress: () => {  }, description: 'Play against another player' },
      { id: 4, label: 'Back', onPress: () => { newGameMode.value = false; }, description: 'Back to Main menu' }
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


    const onOptionsSaved = () => {
      optionsMode.value = false;
    };
    const onOptionsCanceled = () => {
      optionsMode.value = false;
    };

    const showCredits = () => {
      router.push("/Credits");
    };

    const startSinglePlayer = () => {
      if(newPlayer) {
        suggestTutorial();
        return;
      }
      router.push("/Team");
    };

    const startTutorial = () => {
      RunManager.getInstance().createRun(new Team('Player Team', 0), 0, 1, RunType.TUTORIAL, Difficulty.EASY);
      router.push("/Match");
    };

    const suggestTutorial = () => {
      showTutorialPopup.value = true;
    };

    let newPlayer = true;

    const showTutorialPopup = ref(false);
    const popupTitle = ref('One moment...');
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
      handlePopupDismissed
    };
  },
});
</script>

<style scoped>
/* Base container assumes full screen and black background from outside */
.min-h-screen {
  min-height: 95vh;
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
  padding: 1rem; /* 16px */
}

/* Main Menu Container for Arc Concept */
.main-menu-container-arc {
  /* Using your established plum marble background */
  background-color: #5E3B68; /* Plum background color (as fallback) */
  background-image: url('../assets/Menus/plumMarble3.png');
  /* background-image: url('../assets/Menus/darkSlate1.png'); */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  padding: 40px; /* Adjust padding to give space around the arc */
  border-radius: 20px; /* Soft rounded corners for the entire menu block */
  
  display: flex;
  flex-direction: column;
  align-items: center; /* Center items horizontally */
  
  /* Applying a border/frame similar to your sound popup */
  box-shadow:
    0 0 0 5px #2F4F4F, /* Dark slate gray border */
    0 0 0 7px #A17A50, /* Gold/bronze accent border */
    0 0 20px rgba(0, 0, 0, 0.7); /* Outer shadow for depth */
  
  max-width: 600px; /* Increased max width to accommodate arc */
  width: 90%; /* Responsive width */
  min-height: 550px; /* Increased min height for arc space */
  justify-content: flex-start; /* Align title to top */
  position: relative; /* For absolute positioning of arc container */
  margin-top: -40px;
}

.main-menu-title-arc {
  font-family: 'Metal Mania', sans-serif; /* Your logo font for the title */
  margin-top: -20px;
  font-size: 5.5em; /* Large size for main title */
  color: #7A5B8C; /* Your chosen brighter plum for the logo text */
  text-shadow:
    -1px -1px 0px #A17A50,
    1px 1px 0px #8B7355,
    0 0 10px rgba(255, 215, 0, 0.4);
  text-align: center;
}

.main-menu-subtitle-arc {
  margin-top: -60px;
  color: white;
  font-family: 'Exo 2';
  font-size: 20px;
  font-style: italic;
}

.new-game-title {
  font-family: 'Cinzel Decorative';
  color: white;
  font-size: 2.5em;
}

.menu-arc-container {
  position: absolute;
  top: 60%; /* Adjust to position the center of the arc */
  left: 50%;
  transform: translate(-50%, -50%); /* Center the arc container itself */
  width: 400px; /* Define area for arc, adjust as needed */
  height: 400px; /* Make it square */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Central Glowing Arc/Moon Element */
.central-glowing-arc {
  width: 80%; /* Size of the outer arc */
  height: 80%;
  border-radius: 50%;
  /* background-image: url('../assets/Menus/plumMarble3.png'); */
  background-image: url('../assets/Menus/darkSlate1.png');
  background-color: #5E3B68;
  background-size: cover;
  background-position: center;
  position: absolute;
  box-shadow: 0 0 25px 8px rgba(255, 215, 0, 0.8); /* Stronger gold glow */
  overflow: hidden; /* Crucial for the crescent effect */
  transform: rotate(-30deg); /* Rotate the moon if desired */
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
  font-size: 1.2em; /* Slightly smaller font for arc placement */
  font-weight: bold;
  color: white;
  text-align: center;
  padding: 10px 15px; /* Adjusted padding */
  border-radius: 10px;
  cursor: pointer;

  /* Stone slab style from previous concept */
  background-color: #2F4F4F; 
  /* background-color: #5E3B68; */
  border: none;
  box-shadow:
    inset 2px 2px 5px rgba(0, 0, 0, 0.6),
    inset -2px -2px 5px rgba(255, 255, 255, 0.1),
    0 0 0 2px rgba(161, 122, 80, 0.7),
    0 0 0 3px rgba(139, 115, 85, 0.5),
    4px 4px 8px rgba(0, 0, 0, 0.5);

  transition: all 0.2s ease-in-out;
  position: absolute; /* Crucial for arc positioning */
  min-width: 120px; /* Ensure buttons have consistent width */
}

.menu-option-panel-arc:hover {
  background-color: #3A5F5F;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2),
    inset -1px -1px 2px rgba(0, 0, 0, 0.4),
    0 0 0 2px #FFD700,
    0 0 0 3px #CDAD00,
    5px 5px 10px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px); /* Maintain lift on hover */
}

.description-cloud {
  position: absolute;
  bottom: 4%;
  left: 50%;
  transform: translate(-50%, 0%);
  z-index: 100;
  max-width: 20%;
}

/* Ensure fonts are loaded if not globally */
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&family=Metal+Mania&display=swap');
</style>
