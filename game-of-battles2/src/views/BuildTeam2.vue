<template>
  <div class="team-builder-screen">
    <h1 class="screen-title">Build Your Team</h1>

    <div class="combatant-selection-grid-area">
      <!-- Grid of Combatants -->
      <button
        v-for="combatant in combatants"
        :key="combatant.id"
        class="combatant-selection-grid-plaque"
        @click="selectCombatantForDetails(combatant)"
        @mouseenter="showDescription(combatant)"
        @mouseleave="hideDescription"
        :class="{ 'selected-plaque': selectedCombatant?.id === combatant.id }"
      >

        <div class="combatant-sprite-in-plaque"> 
          <CombatantSprite :combatant="combatant.combatantReference" />
        </div>
        <span class="combatant-name">{{ combatant.name }}</span>
      </button>
      
      <!-- New: Choose Button (appears below grid) -->
      <button
        v-if="selectedCombatantForChoice && chosenTeam.length < 5"
        @click="addCombatantToTeam(selectedCombatantForChoice)"
        class="game-button choose-button"
      >
        Add {{ selectedCombatantForChoice.name }}
      </button>
    </div>

    <!-- Section 2: Combatant Description / Stats Panel -->
    <div class="combatant-description-panel">
      <h3 class="description-panel-title">{{ selectedCombatantForChoice?.name || hoveredCombatant?.name || 'Combatant Info' }}</h3>
      
      <!-- Toggle between description and stats content -->
      <div v-if="selectedDescriptionView === 'description'" class="description-content">
        <p class="description-text">
          {{ selectedCombatantForChoice?.description || hoveredCombatant?.description || 'Hover over a combatant or click one to see their details.' }}
        </p>

        <p v-if="selectedCombatantForChoice || hoveredCombatant" class="role-text">
          Role: <span>{{ selectedCombatantForChoice?.role || hoveredCombatant?.role}}</span>
        </p>

        <p v-if="selectedCombatantForChoice || hoveredCombatant" class="ease-of-use-text">
          Ease of Use: <span>{{ selectedCombatantForChoice?.easeOfUse || hoveredCombatant?.easeOfUse}}</span>
        </p>

        <p v-if="selectedCombatantForChoice || hoveredCombatant" class="pros-text">
          Pros: <span>{{ selectedCombatantForChoice?.pros || hoveredCombatant?.pros}}</span>
        </p>

        <p v-if="selectedCombatantForChoice || hoveredCombatant" class="cons-text">
          Cons: <span>{{ selectedCombatantForChoice?.cons || hoveredCombatant?.cons}}</span>
        </p>
        
      </div>
      <div v-if="selectedDescriptionView !== 'description' && (selectedCombatantForChoice || hoveredCombatant)"  class="stats-content">
        <div 
           v-for="[statName, statValue] in getStatsToDisplay(selectedCombatantForChoice || hoveredCombatant)"
          :key="statName"
          class="stat-bar"
        >
          <span class="stat-name">{{ toStatUiName(statName) }}</span>
          <span
            class="stat-value"
            :style="{ color: 'white' }"
          >
            {{ statValue >= 0 ? Math.floor(statValue) : 0 }}
          </span> 
          <div class="bar-container">
            <div v-if="statValue === (selectedCombatantForChoice || hoveredCombatant).combatantReference.baseStats[statName]"
              class="bar-fill"
              :style="{ width: (statValue / toStatusScale(statName)) * 100 + '%' }"
            ></div>
          </div>
        </div>
        <div class="damage-reactions-list">
          <div class="damage-reaction-header">Damage Reactions:</div>
          <div class="damage-reaction-item" v-for="(reaction, index) in (selectedCombatantForChoice || hoveredCombatant).combatantReference?.resistances" :key="index">
            <img class="damage-reaction-icon" :src="showDamageSvg(reaction.type)" alt="Damage Reaction" />
            <span class="damage-reaction-text">{{ reaction.reaction }}</span>
          </div>
        </div>
      </div>

      <div class="description-panel-actions">
        <!-- Buttons only appear if a combatant is selected/hovered -->
        <template v-if="selectedCombatantForChoice || hoveredCombatant">
            <button
              v-if="selectedDescriptionView === 'description'"
              @click="selectedDescriptionView = 'stats'"
              class="game-button small-button"
            >
              Stats
            </button>
            <button
              v-else
              @click="selectedDescriptionView = 'description'"
              class="game-button small-button"
            >
              Description
            </button>
        </template>
      </div>
    </div>


    <!-- Section 3: Chosen Team Display -->
    <div class="chosen-team-section">
      <h2 class="section-title">Your Team ({{ chosenTeam.length }}/5)</h2>
      <div class="chosen-team-slots">

       <div v-for="slotIndex in 5" :key="slotIndex" class="team-slot-container">
        <div class="team-slot">
          <CombatantSprite v-if="chosenTeam[slotIndex - 1]" :combatant="chosenTeam[slotIndex - 1]" class="chosen-sprite" />
          <p v-else class="empty-slot-text">{{ romanNumerals[slotIndex - 1] }}</p>
        </div>
        <div class="team-slot-name-container">
          <span class="team-slot-name">{{ chosenTeam[slotIndex - 1]?.name }}</span>
        </div>
        <div class="remove-button-container" v-if="chosenTeam[slotIndex - 1]">
          <button class="remove-button" @click="removeSelected(slotIndex - 1)"></button>
        </div>
      </div>

      </div>
    </div>

    <!-- Section 4: Action Buttons (Bottom Center) -->
    <div class="team-builder-actions">
      <button @click="pickPremadeTeam" class="game-button">Pick For Me</button>
      <!--<button @click="removeSelected" class="game-button" :disabled="!selectedCombatantForChoice || !chosenTeam.some(c => c.id === selectedCombatantForChoice.id)">Remove</button> -->
      <button @click="finishTeamBuilding" class="game-button" :disabled="chosenTeam.length !== 5">Finish</button>
    </div>

    <!-- Back Button (Bottom Right) -->
    <button @click="goBack" class="game-button back-button">Back</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { CombatantDescription } from '@/logic/CombatantDescriptor';
import { CombatantType } from '@/logic/Combatants/CombatantType';
import { Team } from '@/logic/Team';
import { getCombatantByType } from '@/boardSetups';
import CombatantSprite from '../components/CombatantSprite.vue'; 
import { getNewCombatantName } from '@/CombatantNameProvider';
import { Combatant } from '@/logic/Combatants/Combatant';
import { premadeTeams } from './viewsHelpers/BuildTeamHelper';
import { combatantsWithDescriptions } from './viewsHelpers/BuildTeamHelper';
import { getStatUiName, getStatusScale, getDamageSvg } from '@/UIUtils';
import { DamageType } from './logic/Damage';
import { RunManager } from '@/GameData/RunManager';

export default defineComponent({
  name: 'TeamBuilder',
  components: {
    CombatantSprite, // Register the CombatantSprite component
  },
  setup() {

    const team = new Team('player team', 0);

    const router = useRouter();

    const combatants = ref<CombatantDescription[]>(combatantsWithDescriptions(team));

    const chosenTeam = ref<Combatant[]>([]);
    const hoveredCombatant = ref<CombatantDescription | null>(null);
    const selectedCombatantForChoice = ref<CombatantDescription | null>(null); // Changed name for clarity in selection process
    const selectedDescriptionView = ref<'description' | 'stats'>('description');

    const romanNumerals = ['I', 'II', 'III', 'IV', 'V'];

    const premadeTeamsForBuild = premadeTeams;

    const createCombatantFromType = (combatantType: CombatantType) => {
      const combatantToPush = getCombatantByType(combatantType, team);
      combatantToPush.name = getNewCombatantName(combatantType, chosenTeam.value.map(c => c.name));
      chosenTeam.value.push(combatantToPush);
    };

    const getSpriteClass = (combatant: CombatantDescription) => {
      return `sprite-${combatant.class.toLowerCase()} team-${combatant.teamIndex === 0 ? 'blue' : 'red'} facing-${combatant.facing}`;
    };

    // New: Handle clicking on a combatant plaque to show details consistently
    const selectCombatantForDetails = (combatant: CombatantDescription) => {
      selectedCombatantForChoice.value = combatant;
      // Also ensure description view is active when selected
      selectedDescriptionView.value = 'description'; 
    };

    // New: Add combatant to team
    const addCombatantToTeam = (combatant: CombatantDescription) => {
      if (chosenTeam.value.length < 5) {
        createCombatantFromType(combatant.combatantType);
        selectedCombatantForChoice.value = null; 
        hoveredCombatant.value = null; // Clear hover state
      }
    };

    const showDescription = (combatant: CombatantDescription) => {
        // Only show hover description if no combatant is currently selected for choice
        if (!selectedCombatantForChoice.value) {
            hoveredCombatant.value = combatant;
        }
    };

    const hideDescription = () => {
        // Only clear hover description if no combatant is currently selected for choice
        if (!selectedCombatantForChoice.value) {
            hoveredCombatant.value = null;
        }
    };

    const pickRandomTeam = () => {
      chosenTeam.value = [];
      const shuffled = combatants.value.sort(() => 0.5 - Math.random());
      chosenTeam.value = shuffled.slice(0, 5);
      selectedCombatantForChoice.value = null; // Clear selected on random pick
      hoveredCombatant.value = null; // Clear hovered on random pick
    };

    const pickPremadeTeam = () => {
      chosenTeam.value = [];
      const randomPremade = premadeTeamsForBuild[Math.floor(Math.random() * premadeTeamsForBuild.length)];
      for(let i = 0; i < randomPremade.length; i++) {
        createCombatantFromType(randomPremade[i]);
      }
      selectedCombatantForChoice.value = null; 
      hoveredCombatant.value = null; 
    };

    const removeSelected = (slotIndex: number) => {
      if (chosenTeam.value[slotIndex]) {
        chosenTeam.value.splice(slotIndex, 1);
      }
    };

    const finishTeamBuilding = () => {
      console.log('Team Building Finished:', chosenTeam.value);
      RunManager.getInstance().createRun(chosenTeam.value, 0, 0);
      router.push('/Journey');
      // this.$router.push('/start-match', { params: { team: chosenTeam.value.map(c => c.id) } });
    };

    const goBack = () => {
      console.log('Going back to previous screen...');
      router.push("/MainMenu");
    };

    // This computed property is now less relevant due to new selection flow
    const selectedCombatantInTeam = computed(() => {
      return selectedCombatantForChoice.value && chosenTeam.value.some(c => c.id === selectedCombatantForChoice.value!.id);
    });

    const getStatsToDisplay = (combatant: CombatantDescription) => {
      return Object.entries(combatant.combatantReference.baseStats);
    };

    const toStatUiName = (statName: string) => {
      return getStatUiName(statName);
    };

    const toStatusScale = (statName: string) => {
      return getStatusScale(statName);
    };

    const showDamageSvg = (damageType: DamageType) => {
      return getDamageSvg(damageType);
    };

    return {
      combatants,
      chosenTeam,
      hoveredCombatant,
      selectedCombatantForChoice, // Export the new selected state
      selectedDescriptionView,
      romanNumerals,
      getSpriteClass,
      selectCombatantForDetails, // Use new handler for details display
      addCombatantToTeam, // New handler for adding to team
      showDescription,
      hideDescription,
      pickRandomTeam,
      pickPremadeTeam,
      removeSelected,
      finishTeamBuilding,
      goBack,
      selectedCombatantInTeam, // Kept for now, but its usage might change
      getStatsToDisplay,
      toStatUiName,
      toStatusScale,
      showDamageSvg
    };
  },
});
</script>

<style scoped>
/* --- General Layout --- */
.team-builder-screen {
  position: relative;
  width: 95vw;
  height: 85vh;
  background-color: black; /* Or your desired main game background */
  /* background-image: url('../assets/Backgrounds/Swirl2.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat; 
  display: flex;
  flex-direction: row; /* Arrange main sections horizontally */
  justify-content: space-around; /* Distribute space */
  align-items: flex-start; /* Align content to top */
  padding: 20px;
  padding-top: 100px; /* Space for the title at the top */
  gap: 30px; /* Space between main sections */
}

.screen-title {
  font-family: 'Cinzel Decorative', sans-serif;
  font-size: 2.5em;
  color: white;
  /* text-shadow: -1px -1px 0px #A17A50, 1px 1px 0px #8B7355, 0 0 10px rgba(255, 215, 0, 0.4); */
  margin-bottom: 20px;
  text-align: center;
  z-index: 10;
  position: absolute; /* Position title at the top center */
  top: 0px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
}

/* --- Combatant Selection Area (Grid) --- */
.combatant-selection-grid-area {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns */
  gap: 15px; /* Space between plaques */
  width: 450px; /* Adjusted width for 3 columns of 80px plaques + gaps */
  max-width: 45%; /* Responsive max width */
  position: relative; /* For the "Choose" button positioning */
}

.combatant-selection-grid-plaque {
  width: 100%;
  padding-top: 100%; /* Maintain aspect ratio */
  position: relative;
  border-radius: 10px;
  cursor: pointer;
  background-color: rgba(47, 79, 79, 0.7); /* Dark slate gray, semi-transparent */
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* Align name to bottom */
  align-items: center;
  overflow: hidden;
  box-shadow:
    inset 1px 1px 3px rgba(255, 255, 255, 0.1),
    inset -1px -1px 3px rgba(0, 0, 0, 0.4),
    0 0 0 2px rgba(161, 122, 80, 0.7), /* Gold border */
    0 0 0 3px rgba(139, 115, 85, 0.5),
    4px 4px 8px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.combatant-selection-grid-plaque.selected-plaque {
    box-shadow:
    inset 1px 1px 3px rgba(255, 255, 255, 0.3),
    inset -1px -1px 3px rgba(0, 0, 0, 0.6),
    0 0 0 3px #FFD700, /* Gold highlight when selected */
    0 0 0 5px #CDAD00,
    8px 8px 16px rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
    z-index: 60;
}


.combatant-selection-grid-plaque:hover {
  background-color: rgba(58, 95, 95, 0.9);
  box-shadow:
    inset 1px 1px 3px rgba(255, 255, 255, 0.2),
    inset -1px -1px 3px rgba(0, 0, 0, 0.5),
    0 0 0 2px #FFD700,
    0 0 0 3px #CDAD00,
    6px 6px 12px rgba(0, 0, 0, 0.6);
  transform: scale(1.05);
  z-index: 50;
}

/* CombatantSprite component inside the plaque */
.combatant-sprite-in-plaque {
  position: absolute;
  top: 20%;
  left: 32%;
  transform: scale(1.2);
  /*transform: translate(-50%, -50%); */

}

.combatant-name {
  font-family: 'Exo 2', sans-serif;
  font-size: 0.9em;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
  white-space: nowrap;
  position: absolute; /* Position name inside plaque */
  bottom: 8px; /* Adjust distance from bottom */
  width: 100%;
}


/* New: Choose Button below grid */
.choose-button {
    position: absolute;
    bottom: -60px; /* Adjust distance from the grid */
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    min-width: 150px;
    padding: 12px 25px; /* Slightly larger padding for a prominent button */
    font-size: 1.2em; /* Larger font size */
}


/* --- Combatant Description Panel --- */
.combatant-description-panel {
  width: 350px; /* Adjusted width */
  height: 550px;
  max-width: 35%;
  padding: 15px 20px;
  text-align: center;
  border-radius: 20px;
  box-shadow:
    0 0 15px 5px rgba(245, 232, 210, 0.6),
    0 0 25px 8px rgba(245, 232, 210, 0.4) inset;
  /* Use Plum Marble Background */
  background-image: url('../assets/Menus/plumMarble3.png'); /* IMPORTANT: Update this path! */
  background-color: #5E3B68; /* Fallback to plum */
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 5;
  transition: all 0.3s ease;
  min-height: 250px; /* Adjusted height for content */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative; /* For inner buttons */
}

.description-panel-title {
  font-family: 'Cinzel Decorative', sans-serif;
  font-size: 1.8em; /* Slightly larger title for panel */
  color: white;
  /* text-shadow: -1px -1px 0px #A17A50, 1px 1px 0px #8B7355, 0 0 8px rgba(255, 215, 0, 0.3); */
  margin-bottom: 15px;
  margin-top: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description-content, .stats-content {
    flex-grow: 1;
    width: 100%;
    padding: 0 10px;
    text-align: left;
    overflow-y: auto;
    color: white;
    font-family: 'Exo 2', sans-serif;
}

.description-text, .description-stats, .role-text, .pros-text, .cons-text, .ease-of-use-text {
  font-family: 'Exo 2', sans-serif;
  font-size: 1em;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
  margin: 5px 0;
}

.role-text, .pros-text, .cons-text, .ease-of-use-text {
  margin-top: 20px;
}

.role-text span, .pros-text span, .cons-text span, .ease-of-use-text span {
  margin-left: 3px;
}


.description-stats.placeholder-text {
    opacity: 0.7;
    font-style: italic;
}


.description-panel-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-top: 15px;
}

/* Small button styling for Description/Stats toggle */
.game-button.small-button {
  font-size: 0.9em;
  padding: 8px 15px;
  max-width: 100px;
  min-width: 80px;
  border-radius: 15px;
}

.game-button.small-button.active-view-button {
  background-color: #3A5F5F;
  box-shadow:
    inset 0 0 5px rgba(0,0,0,0.7),
    0 0 0 2px #FFD700;
}


/* --- Chosen Team Display --- */
.chosen-team-section {
  width: 250px;
  max-width: 25%;
  padding: 15px;
  /* Use Dark Slate Marble Background */
  background-image: url('../assets/Menus/darkSlate1.png'); /* IMPORTANT: Update this path! */
  background-color: #2F4F4F; /* Fallback to dark slate gray */
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 15px;
  box-shadow: 0 0 0 3px #A17A50, 0 0 10px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 5;
  min-height: 250px;
}

.section-title {
  font-family: 'Cinzel Decorative', sans-serif;
  font-size: 1.5em;
  color: white;
  /* text-shadow: 0 0 5px rgba(255, 215, 0, 0.5); */
  margin-bottom: 15px;
}

.chosen-team-slots {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.team-slot {
  width: 70px;
  height: 70px;
  background-color: rgba(47, 79, 79, 0.6);
  border: 1px dashed rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.team-slot-container {
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
}

.team-slot-name-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.team-slot-name {
  font-family: 'Exo 2', sans-serif;
  font-size: 1em;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
}

/* Chosen sprite inside team slot */
.chosen-sprite {
  background-repeat: no-repeat;
  background-position: center;
  image-rendering: pixelated;
}
.empty-slot-text {
  font-family: 'Exo 2', sans-serif;
  font-size: 1.5em;
  color: rgba(255, 255, 255, 0.6);
  font-weight: bold;
}


/* --- Action Buttons (Bottom Center) --- */
.team-builder-actions {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  z-index: 10;
}

/* Reusing .game-button from previous components */
.game-button {
  font-family: 'Exo 2', sans-serif;
  font-size: 1.1em;
  color: white;
  padding: 10px 20px;
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

.game-button:hover {
  background-color: #3A5F5F;
  cursor: pointer;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.3),
    inset -1px -1px 2px rgba(0, 0, 0, 0.5),
    0 0 0 2px #FFD700,
    0 0 0 3px #CDAD00,
    5px 5px 10px rgba(0, 0, 0, 0.6);
}

.game-button:active {
  background-color: #2A4545;
  box-shadow:
    inset 0px 0px 5px rgba(0, 0, 0, 0.8),
    0 0 0 2px #A17A50,
    1px 1px 3px rgba(0, 0, 0, 0.3);
  transform: translateY(1px);
}

.game-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: inset 1px 1px 2px rgba(0,0,0,0.5); /* Flat look when disabled */
}

/* --- Back Button (Bottom Right) --- */
.back-button {
  position: absolute;
  bottom: 20px; /* Changed from top to bottom */
  right: 85px;
  z-index: 10;
  /* Reuses .game-button style, no need for redundant styles */
}

.remove-button-container {
  margin-left: auto;
  align-self: center;
}

.remove-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #5E3B68;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  color: #fff;
  font-weight: bold;
  position: relative;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 2px;
    background-color: #fff;
    top: 50%;
    left: 50%;
  }

  &::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  &::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }

  &:hover {
    background-color: #4A6F6F;
  }

  &:active {
    background-color: #2A4F4F;
  }

}


.stat-bar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.stat-name {
  width: 100px;
  margin-right: 10px;
}

.stat-value {
  margin-right: 10px;
  font-weight: bold;
  min-width: 20px;
  max-width: 20px;
  color: white;
}

.bar-container {
  flex: 1;
  height: 10px;
  background-color: #555;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  background-color: green;
  border-radius: 5px;
  position: absolute;
  z-index: 2;
}

.damage-reactions-list {
  margin: 30px 0px 0px 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 35px;
}

.damage-reaction-header {
  margin-bottom: 10px;
  display: none;
}

.damage-reaction-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 30px;
}

.damage-reaction-icon {
  width: 20px;
  height: 20px;
  margin-bottom: 5px;
}

.damage-reaction-text {
  font-size: 10px;
}


/* --- Font Imports (if not global) --- */
/* @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&family=Metal+Mania&display=swap'); */
</style>
