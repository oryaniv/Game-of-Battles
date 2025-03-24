
<template>
  <div class="game-container">
    <div class="message">{{ turnMessage }}</div>
    <div class="board">
      <div
        v-for="y in 10"
        :key="y"
        class="row"
      >
        <div
          v-for="x in 10"
          :key="x"
          class="panel"
          @click="panelClick({ x, y })"
        >
          <!--<div>{{x}},{{y}}</div> -->
          <div
            v-if="getCombatant({ x , y})"
            class="combatant"
            :style="{ 
              color: teamColors[getCombatant({ x, y }).team.getIndex() === 0 ? 0 : 1],
              boxShadow: isCurrentCombatant({ x, y }) ? '0 0 10px 5px rgba(0, 255, 0, 0.7)' : '',
              animation: isCurrentCombatant({ x, y }) ? 'glow 2s infinite alternate' :  ''
              }"
            
          >
            <div class="health-bar">
              <div class="health-fill" :style="{ width: (getCombatant({ x, y }).hp / 100) * 100 + '%' }"></div>
            </div>
            {{ getCombatant({ x, y }).name }}
            <img v-if="isDefending(getCombatant({ x, y }))" class="defend-icon" src="./assets/defend.svg" alt="Defend" />
          </div>
        </div>
      </div>
    </div>
    <div class="actions">
      <div v-if="currentCombatant">
        Actions Remaining: {{ actionsRemaining }}
        <button @click="attack">Attack</button>
        <button @click="defend">Defend</button>
        <button @click="move">Move</button>
        <button @click="specialSkill">Special Skill</button>
        <button @click="undo" :disabled="!canUndo">Undo</button>
        <button @click="skip">Skip</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, onMounted, computed } from 'vue';
import { Militia} from './logic/Combatants/Militia'; // Assuming your combatant.ts is in the same directory.
import { Combatant } from './logic/Combatant';
import { Board } from './logic/Board';
import { Team } from './logic/Team';
import { Game } from './logic/Game';
import { Position } from './logic/Position';

export default defineComponent({
  setup() {
    const board = ref(new Board(10, 10));
    const redTeam = ref(new Team('Red Team', 0));
    const blueTeam = ref(new Team('Blue Team', 1));
    /// add to red team
    redTeam.value.addCombatant(new Militia('M', { x: 0, y: 0 }, redTeam.value));
    redTeam.value.addCombatant(new Militia('M', { x: 2, y: 0 }, redTeam.value));
    redTeam.value.addCombatant(new Militia('M', { x: 4, y: 0 }, redTeam.value));
    redTeam.value.addCombatant(new Militia('M', { x: 6, y: 0 }, redTeam.value));
    redTeam.value.addCombatant(new Militia('M', { x: 8, y: 0 }, redTeam.value));
    /// add to blue team
    blueTeam.value.addCombatant(new Militia('M', { x: 1, y: 9 }, blueTeam.value));
    blueTeam.value.addCombatant(new Militia('M', { x: 3, y: 9 }, blueTeam.value));
    blueTeam.value.addCombatant(new Militia('M', { x: 5, y: 9 }, blueTeam.value));
    blueTeam.value.addCombatant(new Militia('M', { x: 7, y: 9 }, blueTeam.value));
    blueTeam.value.addCombatant(new Militia('M', { x: 9, y: 9 }, blueTeam.value));
    const teams = ref([redTeam.value, blueTeam.value]);
    const game = ref(new Game(teams.value, board.value as Board));
    const teamColors = ref(['red', 'blue']);
    const actionsRemaining = ref(5);
    const turnMessage = ref('');
    const selectedPosition = ref<Position | null>(null);
    const canUndo = ref(false);
    const lastMove = ref<Position | null>(null);

    const currentCombatant = computed(() => game.value.getCurrentCombatant());
    const currentTeam = computed(()=> game.value.teams[(game.value as Game).getCurrentTeamIndex()]);

    onMounted(() => {
      updateTurnMessage();

      actionsRemaining.value = currentTeam.value.combatants.length;
    });

    const updateTurnMessage = () => {
      turnMessage.value = `${game.value.teams[(game.value as Game).getCurrentTeamIndex()].name}'s Turn`;
    };

    const getCombatant = (position: Position): Combatant | null => {
      return board.value.getCombatantAtPosition({x: position.x -1, y: position.y - 1});
    };

    const isCurrentCombatant = (position: Position): boolean => {
      if (currentCombatant.value && currentCombatant.value.position) {
        return (
          currentCombatant.value.position.x === position.x -1 &&
          currentCombatant.value.position.y === position.y -1
        );
      }
      return false;
    };

    const panelClick = (position: Position) => {
      if (selectedPosition.value && currentCombatant.value) {
        if (currentCombatant.value.move(position, board.value as Board)) {
          lastMove.value = currentCombatant.value.position;
          canUndo.value = true;
          selectedPosition.value = null;
          actionsRemaining.value--;
          if (actionsRemaining.value <= 0) {
            game.value.nextTurn();
            actionsRemaining.value = currentTeam.value.combatants.length;
            updateTurnMessage();
            canUndo.value = false;
            lastMove.value = null;
          }
        }
      } else {
        const combatant = getCombatant(position);
        if (combatant && combatant.team.getIndex() === (game.value as Game).getCurrentTeamIndex()) {
          selectedPosition.value = position;
        }
      }
    };

    const attack = () => {
      // Implement attack logic here
      actionsRemaining.value--;
      if (actionsRemaining.value <= 0) {
        game.value.nextTurn();
        actionsRemaining.value = currentTeam.value.combatants.length;
        updateTurnMessage();
      }
    };

    const defend = () => {
      const defendCost = currentCombatant.value?.defend();
      game.value.nextTurn(defendCost);
      updateTurnOrder();
    };

    const move = () => {
      // Logic is handled in panelClick
    };

    const specialSkill = () => {
      // Implement special skill logic here
      actionsRemaining.value--;
      game.value.nextTurn();
      updateTurnOrder();
    };

    const undo = () => {
      if (lastMove.value && currentCombatant.value) {
        currentCombatant.value.move(lastMove.value, board.value as Board);
        lastMove.value = null;
        canUndo.value = false;
      }
    };

    const skip = () => {
      game.value.nextTurn();
      updateTurnOrder();
    };

    const updateTurnOrder = () => {
      actionsRemaining.value = game.value.getActionsRemaining();
      updateTurnMessage();
    };

    const isDefending = (combatant: Combatant) => {
      return combatant.isDefending();
    };

    return {
      board,
      teams,
      teamColors,
      getCombatant,
      isCurrentCombatant,
      panelClick,
      actionsRemaining,
      turnMessage,
      attack,
      defend,
      move,
      specialSkill,
      undo,
      skip,
      currentCombatant,
      canUndo,
      isDefending
    };
  },
});
</script>

<style scoped>

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.board {
  display: flex;
  flex-direction: column;
  background-color: black;
}

.row {
  display: flex;
}

.panel {
  width: 70px;
  height: 70px;
  background-color: gray;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
}

.combatant {
  transform: scale(2);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.3s ease-in-out;
}
.health-bar{
    width: 100%;
    height: 5px;
    background-color: darkred;
    margin-bottom: 2px;
}
.health-fill{
    background-color: red;
    height: 100%;
}
.defend-icon{
  position: absolute;
  top: 6px;
}

.actions {
  margin-top: 20px;
}

@keyframes glow {
  0% {
    box-shadow: 0 0 5px 2px rgba(0, 255, 0, 0.4);
  }
  100% {
    box-shadow: 0 0 10px 5px rgba(0, 255, 0, 0.7);
  }
}
</style>