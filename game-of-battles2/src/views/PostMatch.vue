<template>
  <div class="post-match-screen">
    <div class="message">{{ receivedMessage }}</div>
    <div class="button-container">
      <button v-if="playerSurvived && !runCompleted" class="game-button" @click="continueToNextLevel">{{ nextMatchText() }}</button>
      <button v-if="!playerSurvived || runCompleted" class="game-button" @click="returnToMenu">Main Menu</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { RunManager, RunsStatus, RunType } from '@/GameData/RunManager';
import { TutorialManager } from '@/GameData/TutorialManager';
import { getDifficulyLevelCount } from '@/GameData/EnemyRepository';
import { refreshTeam } from '@/boardSetups';

export default defineComponent({
  setup() {
    const router = useRouter();
    // const route = useRoute(); 
    const receivedMessage = ref('');
    const playerSurvived = ref(false);
    const runCompleted = ref(false);
    const runManager = RunManager.getInstance();

    const continueToNextLevel = () => {
      const playerTeam = runManager.getTeam();
      refreshTeam(playerTeam);
      // router.push('/Match');
      router.push('/Journey');
    };

    const returnToMenu = () => {
      runManager.clear();
      router.push('/MainMenu');
    };

    onMounted(() => {      
      getStateParams();
      updateRun();
    });

    const getStateParams = () => {
      if(!window.history || !window.history.state) {
        return;
      }
      
      receivedMessage.value = window.history.state.postMatchMessage;
      playerSurvived.value = window.history.state.playerSurvived;
    }

    const updateRun = () => {

      if(runManager.getRunType() === RunType.SINGLE_PLAYER) {
        updateSinglePlayerRun();
      }
      else if(runManager.getRunType() === RunType.MULTI_PLAYER) {
        updateMultiplayerRun();
      }
      else if(runManager.getRunType() === RunType.TUTORIAL) {
        updateTutorialRun();
      }
    }


    const updateSinglePlayerRun = () => {
      runManager.setScore(100);
      const difficulty = runManager.getDifficulty();
      const difficultyLevelCount = getDifficulyLevelCount(difficulty!);
      if(runManager.getCurrentLevel() + 1 > difficultyLevelCount) {
        runCompleted.value = true;
        runManager.setStatus(RunsStatus.COMPLETED);
      }
    }

    const updateMultiplayerRun = () => {
      
    }

    const updateTutorialRun = () => {
       runManager.setCurrentLevel(runManager.getCurrentLevel() + 1);
       if(runManager.getCurrentLevel() > TutorialManager.getInstance().getTutorialCount()) {
        runCompleted.value = true;
        runManager.setStatus(RunsStatus.COMPLETED);
       }
    }

    const nextMatchText = () => {
      if(runManager.getRunType() === RunType.SINGLE_PLAYER) {
        return 'Next Match';
      }
      else if(runManager.getRunType() === RunType.TUTORIAL) {
        return 'Next Lesson';
      }
      return 'Next Something';
    }

    return {
      receivedMessage,
      playerSurvived,
      continueToNextLevel,
      returnToMenu,
      getStateParams,
      runCompleted,
      nextMatchText
    };
  }
});
</script>

<style scoped>
.post-match-screen {
  background-color: black;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.message {
  color: white;
  text-align: center;
  margin-bottom: 2em;
  font-family: 'Cinzel Decorative', sans-serif;
  font-size: 2.5em;
  max-width: 70%;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

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
</style>
