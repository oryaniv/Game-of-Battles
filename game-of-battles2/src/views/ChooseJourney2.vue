<template>
  <div class="journey-screen-container" :class="{ 'selected-pyramid-active': animationPhase !== 'idle' }">
    <div class="journey-title-wrapper" v-if="animationPhase === 'idle'">
      <h1 class="journey-title-text">
        Choose Your J<span class="journey-logo-outer-circle"><span class="journey-logo-circle-inner"></span></span>urney
      </h1>
    </div>

    <div class="difficulty-towers-container">
      <!-- Easy Pyramid -->
      <div
        class="difficulty-pyramid Easy"
        :class="{ 'selected-pyramid': selectedDifficulty === 'Easy' }"
        @click="selectDifficulty('Easy')"
        @mouseenter="showDescription('Easy'); playHoverSound();"
        @mouseleave="hideDescription"
      >
        <div class="pyramid-block block-top">
          <PyramidBlock v-if="enemyPlaques[2]" :enemyPlaque="enemyPlaques[2]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>

        <div class="pyramid-block block-mid-1">
           <PyramidBlock v-if="enemyPlaques[1]" :enemyPlaque="enemyPlaques[1]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        
        <div class="pyramid-block block-bottom">
          <PyramidBlock v-if="enemyPlaques[0]" :enemyPlaque="enemyPlaques[0]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        <p v-if="animationPhase === 'idle'" class="pyramid-label">Easy</p>
      </div>

      <!-- Normal Pyramid -->
      <div
        class="difficulty-pyramid Normal"
        :class="{ 'selected-pyramid': selectedDifficulty === 'Normal' }"
        @click="selectDifficulty('Normal')"
        @mouseenter="showDescription('Normal'); playHoverSound();"
        @mouseleave="hideDescription"
      >
        <div class="pyramid-block block-top">
          <PyramidBlock v-if="enemyPlaques[4]" :enemyPlaque="enemyPlaques[4]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        <div class="pyramid-block block-mid-2">
          <PyramidBlock v-if="enemyPlaques[3]" :enemyPlaque="enemyPlaques[3]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        <div class="pyramid-block block-mid-1">
          <PyramidBlock v-if="enemyPlaques[2]" :enemyPlaque="enemyPlaques[2]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        <div class="pyramid-block block-mid-0">
          <PyramidBlock v-if="enemyPlaques[1]" :enemyPlaque="enemyPlaques[1]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        <div class="pyramid-block block-bottom">
          <PyramidBlock v-if="enemyPlaques[0]" :enemyPlaque="enemyPlaques[0]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        <p v-if="animationPhase === 'idle'" class="pyramid-label">Normal</p>
      </div>

      <!-- Hard Pyramid -->
      <div
        class="difficulty-pyramid Hard"
        :class="{ 'selected-pyramid': selectedDifficulty === 'Hard' }"
        @click="selectDifficulty('Hard')"
        @mouseenter="showDescription('Hard'); playHoverSound();"
        @mouseleave="hideDescription"
      >
        <div class="pyramid-block block-top">
          <PyramidBlock v-if="enemyPlaques[6]" :enemyPlaque="enemyPlaques[6]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        <div class="pyramid-block block-mid-4">
          <PyramidBlock v-if="enemyPlaques[5]" :enemyPlaque="enemyPlaques[5]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        <div class="pyramid-block block-mid-3">
          <PyramidBlock v-if="enemyPlaques[4]" :enemyPlaque="enemyPlaques[4]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        <div class="pyramid-block block-mid-2">
          <PyramidBlock v-if="enemyPlaques[3]" :enemyPlaque="enemyPlaques[3]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        <div class="pyramid-block block-mid-1">
          <PyramidBlock v-if="enemyPlaques[2]" :enemyPlaque="enemyPlaques[2]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        <div class="pyramid-block block-mid-0">
          <PyramidBlock v-if="enemyPlaques[1]" :enemyPlaque="enemyPlaques[1]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        <div class="pyramid-block block-bottom">
          <PyramidBlock v-if="enemyPlaques[0]" :enemyPlaque="enemyPlaques[0]" 
          :playerPlaqueCurrentLevel="playerPlaqueCurrentLevel" :difficulty="selectedDifficulty" />
        </div>
        <p v-if="animationPhase === 'idle'" class="pyramid-label">Hard</p>
      </div>
    </div>

    <!-- Player Plaque (will animate down the selected pyramid) -->
    <div v-if="animationPhase === 'descending' || animationPhase === 'ascending' || animationPhase === 'pre-ascending'"
         class="player-plaque"
         :style="playerPlaqueStyle">
      <div class="combatant-sprite-in-plaque">
        <CombatantSprite :combatant="iconCombatant" />
      </div>
    </div>

    <DescriptionCloud v-if="descriptionText && animationPhase === 'idle'" class="description-cloud" :text="descriptionText" />

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onBeforeUnmount, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { RunManager, RunsStatus } from '../GameData/RunManager';
import { Difficulty } from "../logic/Difficulty";
import { Team } from '@/logic/Team';
import { Combatant } from '@/logic/Combatant';
import CombatantSprite from '../components/CombatantSprite.vue';
import DescriptionCloud from '../components/DescriptionCloud.vue';
import PyramidBlock from '../components/PyramidBlock.vue';
import { getEnemyTeamCombatantTypes } from '../GameData/EnemyRepository';
import { getCombatantByType } from '@/boardSetups';
import { delay } from '@/UIUtils';
import { playHoverSound, playTowerTraversalSound, playTowerAscendSound, playSwordClashSound } from '@/GameData/SoundUtils';

export default defineComponent({
  name: 'JourneyScreen',
  components: {
    CombatantSprite,
    DescriptionCloud,
    PyramidBlock
  },
  setup() {

    const router = useRouter();

    const runManager = RunManager.getInstance();
    const currentRun = runManager.getRun();
    const iconCombatant = currentRun.team.combatants[0];
   

    const selectedDifficulty = ref<Difficulty | undefined>(currentRun.difficulty || undefined);
    const animationPhase = ref<'idle' | 'zooming' | 'descending' | 'pre-ascending' | 'ascending' | 'complete'>
    (currentRun.status === RunsStatus.CREATED ? 'idle' : 'pre-ascending');
    const playerPlaqueCurrentLevel = ref(currentRun.currentLevel || 1); // 0 = top, 1 = first block, etc.
    const animationTimeouts: ReturnType<typeof setTimeout>[] = [];

    // New reactive refs for player plaque position
    const playerPlaqueX = ref(0);
    const playerPlaqueY = ref(0);

    const playerPlaqueXOffset = 150;

    const enemyTeam = ref<Team>(new Team('enemy team', 1));
    
    let allBlocksElements = ref<{ [key: string]: HTMLElement[] }>();

    const enemyData = ref<{ [key: string]: { id: number, level: number, isSecret?: boolean, isBoss?: boolean, combatant?: Combatant }[] }>({
      Easy: [{ id: 1, level: 1 }, { id: 2, level: 2 }, { id: 3, level: 3, isBoss: true }], // Enemies on bottom and top blocks
      Normal: [{ id: 1, level: 1 }, { id: 2, level: 2 }, { id: 3, level: 3, isSecret: true }, { id: 4, level: 4 }, { id: 5, level: 5, isBoss: true }],
      Hard: [{ id: 1, level: 1 }, { id: 2, level: 2 }, { id: 3, level: 3, isSecret: true }, { id: 4, level: 4 }, { id: 5, level: 5 }, { id: 6, level: 6, isSecret: true }, { id: 7, level: 7, isBoss: true }],
    });

    console.log(allBlocksElements.value);

    // Define pyramid block heights for calculations (must match CSS)
    const blockHeights = {
      Easy: [100, 100, 100], // bottom, mid, top
      Normal: [100, 100, 100, 100, 100],
      Hard: [100, 100, 100, 100, 100, 100, 100],
    };

    // Define enemy plaque data for each difficulty (level is 0-indexed from bottom)

    // --- Player Plaque Positioning ---
    const playerPlaqueStyle = computed(() => {
      if (animationPhase.value === 'idle') return {};

      return {
        left: `${playerPlaqueX.value}px`,
        top: `${playerPlaqueY.value}px`,
        transition: animationPhase.value === 'descending' || animationPhase.value === 'ascending' ? 'top 1.5s linear, opacity 0.3s ease-out' : 'opacity 0.3s ease-out',
      };
    });


    

    const enemyPlaques = computed(() => {
      if(selectedDifficulty.value && (animationPhase.value === 'ascending' || animationPhase.value === 'descending' || animationPhase.value === 'pre-ascending')) {
        return enemyData.value[selectedDifficulty.value];
      }
      return [];
    });

    

    // --- Enemy Plaque Positioning ---
    const enemyPlaqueStyle = (level: number) => {
      if (!selectedDifficulty.value || animationPhase.value === 'idle' || !allBlocksElements.value) return {};
      
      
      const block = allBlocksElements.value[selectedDifficulty.value][level - 1];
      const blockRects = block.getBoundingClientRect();
      console.log(blockRects);
      
      return {
        left: `${blockRects.left + blockRects.width / 2 - 90}px`,
        top: `${blockRects.top + blockRects.height / 2 - 100}px`,
        opacity: 1,
        transition: 'opacity 0.3s ease-out',
      }
    };

    // --- Animation Sequence ---
    const startPyramidAnimation = async (difficulty: Difficulty) => { // Made async
      if (animationPhase.value !== 'idle') return; // Prevent re-triggering
      
      runManager.setDifficulty(difficulty);
      runManager.setStatus(RunsStatus.IN_PROGRESS);
      runManager.setCurrentLevel(1);

      selectedDifficulty.value = difficulty;
      animationPhase.value = 'zooming';
      playerPlaqueCurrentLevel.value = 0; // Start player plaque at level 0 (top)
      playSwordClashSound();
      playTowerTraversalSound();

      // Ensure DOM is updated for selected pyramid class before measurements
      await nextTick();

      const pyramidElement = document.querySelector(`.difficulty-pyramid.${selectedDifficulty.value}`);
      if (!pyramidElement) {
        console.error('Selected pyramid element not found for animation.');
        animationPhase.value = 'idle'; // Reset if element not found
        return;
      }

      const pyramidRect = pyramidElement.getBoundingClientRect();
      const containerRect = document.querySelector('.journey-screen-container')?.getBoundingClientRect() || { top: 0, left: 0 };

      // Calculate initial player plaque position (above the selected pyramid)
      const initialPlaqueX = pyramidRect.left + pyramidRect.width / 2 - containerRect.left;
      const initialPlaqueY = pyramidRect.top - containerRect.top - 80; // 80px above the top of the pyramid

      playerPlaqueX.value = initialPlaqueX;
      playerPlaqueY.value = initialPlaqueY;

      // Scroll to bring the selected pyramid into view
      const scrollTargetY = pyramidRect.top - (window.innerHeight / 2) + (pyramidRect.height / 2);
      //Use the scrollable container for scrollTo
      const scrollContainer = document.querySelector('.journey-screen-container');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollTargetY, behavior: 'smooth' });
      }


      // Step 1: Zoom in on the selected pyramid
      animationTimeouts.push(setTimeout(() => {
        // After zoom, start descent
        startPlayerPlaqueDescent();
      }, 1500)); // Zoom duration
    };

    const startPlayerPlaqueDescent = async () => {

      animationPhase.value = 'descending';
      const totalLevels = -1 || blockHeights[selectedDifficulty.value as keyof typeof blockHeights].length;

      await nextTick(); // Ensure DOM is updated for selected pyramid class before measurements

      const pyramidElement = document.querySelector(`.difficulty-pyramid.${selectedDifficulty.value}`);
      if (!pyramidElement) {
        console.error('Selected pyramid element not found for descent.');
        animationPhase.value = 'idle'; // Reset if element not found
        return;
      }

      const pyramidRect = pyramidElement.getBoundingClientRect();
      const containerRect = document.querySelector('.journey-screen-container')?.getBoundingClientRect() || { top: 0, left: 0 };
      const currentPyramidBlocks = pyramidElement.querySelectorAll('.pyramid-block');

      let currentLevel = 0;
      const descentInterval = 1500; // Time per level descent

      const descend = () => {
        straightDescend();
        if (currentLevel < totalLevels) {

          playerPlaqueCurrentLevel.value = currentLevel;

          let currentLevelHeightSum = 0;
          for (let i = 0; i < currentLevel; i++) {
            const block = currentPyramidBlocks[currentPyramidBlocks.length - 1 - i] as HTMLElement; // Cast to HTMLElement
            if (block) {
              currentLevelHeightSum += block.offsetHeight - 10; // Subtract overlap
            }
          }
          const targetBlock = currentPyramidBlocks[currentPyramidBlocks.length - 1 - currentLevel] as HTMLElement; // Cast to HTMLElement
          let targetY = 0;
          if (targetBlock) {
            // Position at the top edge of the current block
            targetY = (pyramidRect.bottom - containerRect.top) - currentLevelHeightSum - targetBlock.offsetHeight;
            // Adjust to center on the block
            targetY += (targetBlock.offsetHeight / 2) - 25; // 25 is half of player plaque height (50px)
          }

          playerPlaqueY.value = targetY - 50; // Update reactive Y position

          // Scroll to keep the player plaque in view as it descends
          const scrollContainer = document.querySelector('.journey-screen-container') as HTMLElement;
          if (scrollContainer) {
            // Calculate target scroll position to keep plaque roughly centered in its scrollable area
            const plaqueTopRelativeToScrollContainer = playerPlaqueY.value;
            const viewportCenter = scrollContainer.scrollTop + (scrollContainer.offsetHeight / 2);
            const plaqueCenter = plaqueTopRelativeToScrollContainer + 40; // 40 is half of plaque height (80px)

            // Only scroll if the plaque is moving out of the current viewport center
            if (Math.abs(plaqueCenter - viewportCenter) > 50) { // Threshold to prevent constant tiny scrolls
                scrollContainer.scrollTo({
                    top: plaqueTopRelativeToScrollContainer - (scrollContainer.offsetHeight / 2) + 40, // Center plaque in viewport
                    behavior: 'smooth'
                });
            }
          }

          currentLevel++;
          animationTimeouts.push(setTimeout(descend, descentInterval));
        } else {
          runManager.setStatus(RunsStatus.IN_PROGRESS);
        }
      };
      descend();
    };

    const straightDescend = () => {
      
      animationPhase.value = 'descending';
      if(!allBlocksElements.value || !selectedDifficulty.value) {
        return;
      }
      const block = allBlocksElements.value[selectedDifficulty.value][0];
      const blockRects = block.getBoundingClientRect();
      console.log(blockRects);
      

      playerPlaqueX.value = (blockRects.left + blockRects.width / 2) + playerPlaqueXOffset;
      playerPlaqueY.value = (blockRects.top + blockRects.height / 2) - 95;

      // Scroll to keep the player plaque in view as it descends
      const scrollContainer = document.querySelector('.journey-screen-container') as HTMLElement;
      if (scrollContainer) {
        // Calculate target scroll position to keep plaque roughly centered in its scrollable area
        const plaqueTopRelativeToScrollContainer = playerPlaqueY.value;
        const viewportCenter = scrollContainer.scrollTop + (scrollContainer.offsetHeight / 2);
        const plaqueCenter = plaqueTopRelativeToScrollContainer + 40; // 40 is half of plaque height (80px)

        // Only scroll if the plaque is moving out of the current viewport center
        if (Math.abs(plaqueCenter - viewportCenter) > 50) { // Threshold to prevent constant tiny scrolls
            scrollContainer.scrollTo({
                top: plaqueTopRelativeToScrollContainer - (scrollContainer.offsetHeight / 2) + 40, // Center plaque in viewport
                behavior: 'smooth'
            });
        }
      }

      setTimeout(() => {
        revealNextEnemy(1);
        setTimeout(() => {
          nextFight();
        }, 1000);
      }, 2500);
    }

    const revealNextEnemy = (level: number) => {
      if(!selectedDifficulty.value) {
        return;
      }

      const combatantType = getEnemyTeamCombatantTypes(selectedDifficulty.value!, level)[0];
      const combatant = getCombatantByType(combatantType, enemyTeam.value);
      const currentEnemy = enemyData.value[selectedDifficulty.value][level - 1];
      console.log(combatant, currentEnemy);
      currentEnemy.combatant = combatant;
    }

    const nextFight = () => {
      router.push('/Match');
    }

    const assignAllBlocksElements = () => {
      allBlocksElements.value = {
        'Easy': [document.querySelector('.difficulty-pyramid.Easy .pyramid-block.block-top') as HTMLElement,
         document.querySelector('.difficulty-pyramid.Easy .pyramid-block.block-mid-1') as HTMLElement,
          document.querySelector('.difficulty-pyramid.Easy .pyramid-block.block-bottom') as HTMLElement].reverse(),
        'Normal': [document.querySelector('.difficulty-pyramid.Normal .pyramid-block.block-top') as HTMLElement,
         document.querySelector('.difficulty-pyramid.Normal .pyramid-block.block-mid-2') as HTMLElement,
          document.querySelector('.difficulty-pyramid.Normal .pyramid-block.block-mid-1') as HTMLElement,
           document.querySelector('.difficulty-pyramid.Normal .pyramid-block.block-mid-0') as HTMLElement,
            document.querySelector('.difficulty-pyramid.Normal .pyramid-block.block-bottom') as HTMLElement].reverse(),
        'Hard': [document.querySelector('.difficulty-pyramid.Hard .pyramid-block.block-top') as HTMLElement,
         document.querySelector('.difficulty-pyramid.Hard .pyramid-block.block-mid-4') as HTMLElement,
          document.querySelector('.difficulty-pyramid.Hard .pyramid-block.block-mid-3') as HTMLElement,
           document.querySelector('.difficulty-pyramid.Hard .pyramid-block.block-mid-2') as HTMLElement,
            document.querySelector('.difficulty-pyramid.Hard .pyramid-block.block-mid-1') as HTMLElement,
             document.querySelector('.difficulty-pyramid.Hard .pyramid-block.block-mid-0') as HTMLElement,
              document.querySelector('.difficulty-pyramid.Hard .pyramid-block.block-bottom') as HTMLElement].reverse()
      };
    }

    const placePlayerPlaque = async () => {
      if(!selectedDifficulty.value || animationPhase.value === 'idle' || !allBlocksElements.value) {
        return;
      }

      
      const block = allBlocksElements.value[selectedDifficulty.value][playerPlaqueCurrentLevel.value - 1];
      const blockRects = block.getBoundingClientRect();
      let targetY = blockRects.top + (blockRects.height / 2) - 85;
      let targetX = blockRects.left + blockRects.width / 2 + 150;
      playerPlaqueX.value = targetX;
      playerPlaqueY.value = targetY;

      const scrollContainer = document.querySelector('.journey-screen-container');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: targetY - window.innerHeight + blockRects.height , behavior: 'auto' });
      }
      playTowerAscendSound();
      await delay(1000);

      if(animationPhase.value === 'pre-ascending') {
        startAscencion();
      }
    }

    const startAscencion = () => {
      if(!selectedDifficulty.value || animationPhase.value === 'idle' || !allBlocksElements.value) {
        return;
      }

      animationPhase.value = 'ascending';
      
      const mutliplier = updatePlayerNextLevel();
      const block = allBlocksElements.value[selectedDifficulty.value][playerPlaqueCurrentLevel.value - 1];
      const blockRects = block.getBoundingClientRect();
      console.log(mutliplier);
      playerPlaqueY.value = playerPlaqueY.value - (blockRects.height * mutliplier) + 25 * mutliplier;

      
      setTimeout(() => {
        revealNextEnemy(playerPlaqueCurrentLevel.value);
        setTimeout(() => {
          nextFight();
        }, 1500);
      }, 2500);
    }

    const updatePlayerNextLevel = () => {
       const nextEnemyData = enemyData.value[selectedDifficulty.value!][playerPlaqueCurrentLevel.value];
       if(nextEnemyData.isSecret && !runManager.getHasPerferctStreak()) {
         runManager.setCurrentLevel(playerPlaqueCurrentLevel.value + 2);
         playerPlaqueCurrentLevel.value = playerPlaqueCurrentLevel.value + 2;
         return 2
       } else {
         runManager.setCurrentLevel(playerPlaqueCurrentLevel.value + 1);
         playerPlaqueCurrentLevel.value = playerPlaqueCurrentLevel.value + 1;
         return 1;
       }
    }

    onMounted(() => {
      assignAllBlocksElements();
      placePlayerPlaque();
      // playChooseJourneySound();
    });

    // --- Cleanup ---
    onBeforeUnmount(() => {
      animationTimeouts.forEach(clearTimeout);
    });

    const descriptionText = ref('');

    const showDescription = (difficulty: string) => {
      if(difficulty === 'Easy') {
        descriptionText.value = 'Easy AI is basic and forgiving, but don\'t let your guard down.';
      }
      if(difficulty === 'Normal') {
        descriptionText.value = "Normal AI will exploit your mistakes, yet won't play optimally.";
      }
      if(difficulty === 'Hard') {
        descriptionText.value = "Hard AI doesn't pull any punches. You must know the game and plan ahead.";
      }
    }
    const hideDescription = () => {
      descriptionText.value = '';
    }

    return {
      selectedDifficulty,
      animationPhase,
      playerPlaqueCurrentLevel,
      enemyPlaques,
      startPyramidAnimation,
      playerPlaqueStyle,
      enemyPlaqueStyle,
      selectDifficulty: startPyramidAnimation, // Bind click to start animation
      straightDescend,
      iconCombatant,
      revealNextEnemy,
      enemyTeam,
      nextFight,
      descriptionText,
      showDescription,
      hideDescription,
      playHoverSound
    };
  },
});
</script>

<style scoped>

.bobobob {
  position: fixed;
  left: 0;
  width: 200px;
  height: 200px;
  background-color: red;
  color: white;
}

/* --- General Screen Layout --- */
.journey-screen-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  /* Changed overflow: hidden to overflow-y: auto for scrolling */
  overflow-y: auto;
  overflow-x: hidden; /* Keep horizontal hidden */
  /*padding-top: 50px;*/
  background-image: url('../assets/Backgrounds/Swirl2.png'); /* Placeholder for generated background */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* --- Title "Choose Your Journey" --- */
.journey-title-wrapper {
  margin-bottom: 50px;
  transition: opacity 1s ease-out, transform 1s ease-out;
}

.journey-screen-container.selected-pyramid-active .journey-title-wrapper {
  opacity: 0;
  transform: translateY(-100px); /* Move title up and out */
}

.journey-title-text {
  font-family: 'Metal Mania', sans-serif;
  font-size: 4em;
  color: #7A5B8C;
  text-shadow: -1px -1px 0px #A17A50, 1px 1px 0px #8B7355, 0 0 15px rgba(255, 215, 0, 0.6);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  margin: 50px 0 0 0;
}

/* --- Moon Widget (reusing styles from logo) --- */
.journey-logo-outer-circle {
  width: 1em;
  height: 1em;
  border-radius: 50%;
  background-image: url('../assets/Menus/plumMarble4.png');
  background-size: cover;
  background-position: center;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 0 15px 5px rgba(255, 215, 0, 0.6);
  margin: 0px 10px;
  position: relative;
}

.journey-logo-circle-inner {
    background-color: black;
    width: 84%;
    height: 90%;
    border-radius: 50%;
    position: absolute;
    top: 0px;
    left: 0px;
}

/* --- Difficulty Pyramids Container --- */
.difficulty-towers-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 90%;
  position: absolute;
  bottom: 0;
  height: 70vh;
  max-height: 700px;
  transition: opacity 1s ease-out; /* Fade out other pyramids */
}

/* --- Individual Pyramid --- */
.difficulty-pyramid {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  background-color: transparent;
  border-radius: 0;
  overflow: hidden;
  cursor: pointer;
  transition: transform 1.5s ease-out, box-shadow 0.3s ease-out, opacity 1s ease-out; /* Smooth transitions */

}

/* Hover effect for pyramids */
.difficulty-pyramid:hover {
  transform: translateY(-5px) scale(1.02);
  
  z-index: 10;
}

/* --- Selected Pyramid Animation --- */
.journey-screen-container.selected-pyramid-active .difficulty-towers-container {
  justify-content: center; /* Center the selected pyramid */
}

.journey-screen-container.selected-pyramid-active .difficulty-pyramid:not(.selected-pyramid) {
  opacity: 0; /* Hide non-selected pyramids */
  pointer-events: none; /* Disable clicks on hidden pyramids */
}

.difficulty-pyramid.selected-pyramid {
  /* Adjust scale and translateY to make it fill most of the screen */
  transform: scale(2.5) translateY(100px); /* Increased scale and adjusted Y */
  z-index: 20;
  cursor: default;
}


/* --- Pyramid Blocks --- */
.pyramid-block {
  background-image: url('../assets/Backgrounds/LessDarkStone3.png'); /* Your dark slate marble background */
  background-color: #2F4F4F;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100px;
  border-radius: 5px;
  box-shadow:
    inset 0 0 5px rgba(0,0,0,0.5),
    0 5px 10px rgba(0,0,0,0.3);
  margin-bottom: -10px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Easy Pyramid (3 blocks) */
.difficulty-pyramid.Easy .pyramid-block.block-bottom { width: 260px; } /* Doubled from 150px */
.difficulty-pyramid.Easy .pyramid-block.block-mid-1 { width: 200px; } /* Doubled from 120px */
.difficulty-pyramid.Easy .pyramid-block.block-top { width: 120px; } /* Adjusted from 180px to 90px for sharper apex */

/* Normal Pyramid (5 blocks) */
.difficulty-pyramid.Normal .pyramid-block.block-bottom { width: 360px; } /* Doubled from 180px */
.difficulty-pyramid.Normal .pyramid-block.block-mid-0 { width: 300px; } /* Doubled from 150px */
.difficulty-pyramid.Normal .pyramid-block.block-mid-1 { width: 240px; } /* Doubled from 120px */
.difficulty-pyramid.Normal .pyramid-block.block-mid-2 { width: 180px; } /* Doubled from 90px */
.difficulty-pyramid.Normal .pyramid-block.block-top { width: 120px; } /* Doubled from 60px */

/* Hard Pyramid (7 blocks) */
.difficulty-pyramid.Hard .pyramid-block.block-bottom { width: 420px; } /* Doubled from 210px */
.difficulty-pyramid.Hard .pyramid-block.block-mid-0 { width: 360px; } /* Doubled from 180px */
.difficulty-pyramid.Hard .pyramid-block.block-mid-1 { width: 300px; } /* Doubled from 150px */
.difficulty-pyramid.Hard .pyramid-block.block-mid-2 { width: 240px; } /* Doubled from 120px */
.difficulty-pyramid.Hard .pyramid-block.block-mid-3 { width: 180px; } /* Doubled from 90px */
.difficulty-pyramid.Hard .pyramid-block.block-mid-4 { width: 120px; } /* Added this block and its width */
.difficulty-pyramid.Hard .pyramid-block.block-top { width: 80px; } /* Adjusted for the 7th block */


.pyramid-label {
  font-family: 'Metal Mania', sans-serif;
  font-size: 2em;
  color: white;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  margin-top: 10px;
  margin-bottom: 15px;
  position: absolute;
  bottom: 10px;
  text-align: center;
  width: 100%;
  transition: opacity 0.3s ease;
}

/* Hide label by default, show on hover */
.difficulty-pyramid .pyramid-label {
    opacity: 1;
}

/* --- Player Plaque --- */
.player-plaque {
  position: absolute;
  width: 150px; /* Size of the plaque */
  height: 150px;
  border-radius: 10px;
  background-color: rgba(47, 79, 79, 0.9); /* Dark slate gray, more opaque */
  box-shadow:
    inset 1px 1px 3px rgba(255, 255, 255, 0.2),
    inset -1px -1px 3px rgba(0, 0, 0, 0.5),
    0 0 0 3px #FFD700, /* Bright gold border */
    0 0 15px rgba(255, 215, 0, 0.7); /* Strong glow */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 30; /* Above pyramids */
  /* transition: top 0.5s linear, left 0.5s linear, opacity 0.3s ease-out; */ /* For smooth movement */
}

/* Example player sprite inside plaque */
.player-plaque .combatant-sprite-in-plaque {
  transform: scale(1.8);
}

.description-cloud {
  width: 600px;
} 


/* Font Imports (if not global) */
/* @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&family=Metal+Mania&display=swap'); */
</style>
