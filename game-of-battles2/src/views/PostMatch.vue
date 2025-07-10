<template>
  <div class="post-match-screen">
    <div class="message">{{ receivedMessage }}</div>
    <div class="button-container">
      <button v-if="playerSurvived && !runCompleted" class="game-button" @click="continueToNextLevel">Next Match</button>
      <button v-if="!playerSurvived || runCompleted" class="game-button" @click="returnToMenu">Main Menu</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { RunManager, RunsStatus } from '@/GameData/RunManager';
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
      // eslint-disable-next-line no-debugger
      debugger;
      refreshTeam(playerTeam);
      router.push('/Match');
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
      // eslint-disable-next-line no-debugger
      debugger;
    //   if(false && !playerSurvived.value) {
    //     runManager.setStatus(RunsStatus.FAILED);
    //     return;
    //   }
      runManager.setCurrentLevel(runManager.getCurrentLevel() + 1);
      runManager.setScore(100);
      const difficulty = runManager.getDifficulty();
      const difficultyLevelCount = getDifficulyLevelCount(difficulty!);
      if(runManager.getCurrentLevel() > difficultyLevelCount) {
        runCompleted.value = true;
        runManager.setStatus(RunsStatus.COMPLETED);
      }
    }

    return {
      receivedMessage,
      playerSurvived,
      continueToNextLevel,
      returnToMenu,
      getStateParams,
      runCompleted
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
