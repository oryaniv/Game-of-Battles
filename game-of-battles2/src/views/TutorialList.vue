<template>
  <div class="tutorial-list-view">
     <div class="tutorial-list-panel">
    <h1>Choose Tutorial</h1>
    <div class="tutorial-list-container">
      <button 
        v-for="i in tutorialManager.getTutorialCount()" 
        :key="i"
        class="tutorial-button"
        @click="selectTutorial(i)"
        @mouseover="showDescription(i)"
        @mouseleave="hideDescription"
      >
        {{ tutorialManager.getTutorial(i)?.title }}
      </button>
    </div>
   </div>
   <DescriptionCloud class="tutorial-description" v-if="description" :text="description" />
   <button class="tutorial-back-button" @click="backToMainMenu">Back</button>
  </div>
  
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { TutorialManager } from '@/GameData/TutorialManager';
import DescriptionCloud from '@/components/DescriptionCloud.vue';
import { useRouter } from 'vue-router';
import { RunManager, RunType } from '@/GameData/RunManager';
import { Team } from '@/logic/Team';
import { Difficulty } from "../logic/Difficulty";

export default defineComponent({
  name: 'TutorialList',
  components: {
    DescriptionCloud
  },
  setup() {
    const router = useRouter();
    const tutorialManager = TutorialManager.getInstance();
    const description = ref('');

    const selectTutorial = (index: number) => {
      RunManager.getInstance().createRun(new Team('Player Team', 0), 0, index, RunType.TUTORIAL, Difficulty.EASY);
      router.push(`/Match`);
    };

    const showDescription = (id: number) => {
      description.value = tutorialManager.getTutorial(id)?.description || '';
    };
    const hideDescription = () => {
      description.value = '';
    };

    const backToMainMenu = () => {
      router.push('/MainMenu');
    };

    return {
      tutorialManager,
      selectTutorial,
      description,
      showDescription,
      hideDescription,
      backToMainMenu
    };
  }
});
</script>

<style scoped>
.tutorial-list-view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 95vh;
}
.tutorial-list-panel {
  padding: 20px;

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

h1 {
  font-family: 'Cinzel Decorative';
  color: white;
  font-size: 2.5em;
  margin-bottom: 30px;
}

.tutorial-list-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 300px;
}

.tutorial-button {
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
}

.tutorial-button:hover {
  background-color: #3A5F5F;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2),
    inset -1px -1px 2px rgba(0, 0, 0, 0.4),
    0 0 0 2px #FFD700,
    0 0 0 3px #CDAD00,
    5px 5px 10px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px); /* Maintain lift on hover */
}

.tutorial-description {
  position: absolute;
  bottom: 4%;
  left: 50%;
  transform: translate(-50%, 0%);
  z-index: 100;
  max-width: 30%;
}

.tutorial-back-button {
  position: absolute;
  bottom: 4%;
  right: 4%;
  font-family: 'Exo 2', sans-serif;
    font-size: 1.1em;
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    min-width: 120px;
    background-color: #2F4F4F;
    border: none;
    box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.2), inset -1px -1px 2px rgba(0, 0, 0, 0.4), 0 0 0 2px #A17A50, 0 0 0 3px #8B7355, 3px 3px 6px rgba(0, 0, 0, 0.4);
    transition: all 0.15s ease-in-out;
}

.tutorial-back-button:hover {
  background-color: #3A5F5F;
  box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.3), inset -1px -1px 2px rgba(0, 0, 0, 0.5), 0 0 0 2px #FFD700, 0 0 0 3px #CDAD00, 5px 5px 10px rgba(0, 0, 0, 0.5);

}



</style>