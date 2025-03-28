
<template>
  <div class="game-container">
    <div class="message">{{ turnMessage }}</div>
    <div class="round-count">Round: {{ roundCount }}</div>
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
          :class="{ validMove: isMoveValid({ x: x - 1, y: y - 1 }), validAttack: isAttackValid({ x: x - 1, y: y - 1 }) }"
          @click="performAction({ x: x - 1, y:  y - 1})"
        >
          <!-- <div>{{x -1}},{{y - 1}}</div> -->
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
              <div class="health-fill" :style="calcHealthFill(getCombatant({ x, y }))"></div>
            </div>
            <div class="stamina-bar">
              <div class="stamina-fill" :style="calcStaminaFill(getCombatant({ x, y }))"></div>
            </div>
            {{ getCombatant({ x, y }).name }}
            <img v-if="isDefending(getCombatant({ x, y }))" class="defend-icon" src="./assets/defend.svg" alt="Defend" />
            <transition-group name="damage-text" tag="div">
              <div
                v-for="effect in getCombatantEffects({ x: x - 1, y: y - 1 })"
                :key="effect.id"
                class="damage-effect"
                :style="{ color: effect.color }"
              >
                <div v-if="effect.weak">Weak!</div>
                <div v-if="effect.critical">Critical!</div>
                {{ effect.damage }}
                <div v-if="effect.miss">Miss!</div>
                <div v-if="effect.fumble">Fumble!</div>
                <div v-if="effect.blocked">Blocked!</div>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </div>
    <div class="actions">
      <div v-if="currentCombatant">
        Actions Remaining: {{ actionsRemaining }}
        <button :disabled="attackMode" @click="showAttackOptions">Attack</button>
        <button :disabled="hasMoved" @click="defend">Defend</button>
        <button v-if="!hasMoved" @click="showMoveOptions">Move</button>
        <button v-if="hasMoved" @click="undoMove">Undo</button>
        <button @click="specialSkill">Special Skill</button>
        <button @click="skip">Skip</button>
        <button :disabled="!moveMode && !attackMode" @click="cancel">Cancel</button>
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
import { ActionResult, AttackResult } from './logic/attackResult';
import { DamageType, DamageReaction } from './logic/Damage';

export default defineComponent({
  setup() {
    const board = ref(new Board(10, 10));
    const whiteTeam = ref(new Team('White Team', 0));
    const blackTeam = ref(new Team('Black Team', 1));
    /// add to white team
    whiteTeam.value.addCombatant(new Militia('M', { x: 0, y: 4 }, whiteTeam.value));
    whiteTeam.value.addCombatant(new Militia('M', { x: 2, y: 4 }, whiteTeam.value));
    whiteTeam.value.addCombatant(new Militia('M', { x: 4, y: 4 }, whiteTeam.value));
    whiteTeam.value.addCombatant(new Militia('M', { x: 6, y: 4 }, whiteTeam.value));
    whiteTeam.value.addCombatant(new Militia('M', { x: 8, y: 4 }, whiteTeam.value));
    /// add to black team
    blackTeam.value.addCombatant(new Militia('M', { x: 0, y: 5 }, blackTeam.value));
    blackTeam.value.addCombatant(new Militia('M', { x: 2, y: 5 }, blackTeam.value));
    blackTeam.value.addCombatant(new Militia('M', { x: 4, y: 5 }, blackTeam.value));
    blackTeam.value.addCombatant(new Militia('M', { x: 7, y: 5 }, blackTeam.value));
    blackTeam.value.addCombatant(new Militia('M', { x: 9, y: 5 }, blackTeam.value));

    const teams = ref([whiteTeam.value, blackTeam.value]);
    const game = ref(new Game(teams.value, board.value as Board));
    const teamColors = ref(['white', 'black']);
    const actionsRemaining = ref(5);
    const turnMessage = ref('');
    const selectedPosition = ref<Position | null>(null);
    const canUndo = ref(false);
    const lastMove = ref<Position | null>(null);

    const currentCombatant = computed(() => game.value.getCurrentCombatant());
    const currentTeam = computed(()=> game.value.teams[(game.value as Game).getCurrentTeamIndex()]); 
    const roundCount = computed(() => (game.value as Game).getRoundCount());

    const moveMode = ref(false);
    const validMoves = ref<Position[]>([]);
    const hasMoved = ref(false);
    const previousPosition = ref<Position | null>(null);

    const attackMode = ref(false);
    const validAttacks = ref<Position[]>([]);

    const damageEffects = ref<{ [key: string]: any[] }>({});

    const getCombatantEffects = (position: Position) => {
      const key = `${position.x},${position.y}`;
      return damageEffects.value[key] || [];
    };

    onMounted(() => {
      updateTurnMessage();

      actionsRemaining.value = currentTeam.value.combatants.length;
    });

    const updateTurnMessage = () => {
      if(game.value.isGameOver()) {
        turnMessage.value = `Game Over`;
      } else {
        turnMessage.value = `${game.value.teams[(game.value as Game).getCurrentTeamIndex()].name}'s Turn`;
      }
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

    const performAction = (position: Position) => {
      if (moveMode.value) {
        moveCombatant(position);
      } else if (attackMode.value) {
        attackTarget(position);
      }
    }

    const canDefend = () => {
      return hasMoved;
    }

    const defend = () => {
      const defendCost = currentCombatant.value?.defend();
      game.value.nextTurn(defendCost);
      prepareNextTurn();
    };

    const moveCombatant = (position: Position) => {
      if (isMoveValid(position) && currentCombatant.value) {
        previousPosition.value = { ...currentCombatant.value.position };
        currentCombatant.value.move(position, board.value as Board);
        validMoves.value = [];
        hasMoved.value = true;
        moveMode.value = false;

        if (actionsRemaining.value <= 0) {
          game.value.nextTurn();
          prepareNextTurn();
          hasMoved.value = false;
        }
      }
    };

    const showMoveOptions = () => {
      if (currentCombatant.value) {
        validMoves.value = board.value.getValidMoves(currentCombatant.value);
        moveMode.value = true;
      }
    };

    const cancel = () => {
      moveMode.value = false;
      attackMode.value = false;
      validMoves.value = [];
      validAttacks.value = [];
    };

    const isMoveValid = (position: Position): boolean => {
      // debugger;
      return validMoves.value.some(
        (move) => move.x === (position.x) && move.y === (position.y)
      );
    };

    const undoMove = () => {
      if (previousPosition.value && currentCombatant.value) {
        currentCombatant.value.move(previousPosition.value, board.value as Board);
        previousPosition.value = null;
        hasMoved.value = false;
      }
    };


    const showAttackOptions = () => {
      if (currentCombatant.value) {
        validAttacks.value = board.value.getValidAttacks(currentCombatant.value);
        attackMode.value = true;
      }
    };

    const isAttackValid = (position: Position): boolean => {
      return validAttacks.value.some(
        (attack) => attack.x === position.x && attack.y === position.y
      );
    };

    const attackTarget = (position: Position) => {
      if (isAttackValid(position) && currentCombatant.value) {
        const result: ActionResult = game.value.executeAttack(currentCombatant.value, position, board.value as Board); 
        game.value.nextTurn(result.cost);
        validAttacks.value = [];
        attackMode.value = false;
        applyAttackEffects(result, position);
        prepareNextTurn();
      }
    };

    const applyAttackEffects = (actionResult: ActionResult, position: Position) => {
      const reaction = actionResult.reaction;
      const attackRes = actionResult.attackResult;
      const isMiss = attackRes === AttackResult.Miss;
      const isFumble = attackRes === AttackResult.Fumble;
      const isWeak = reaction === DamageReaction.WEAKNESS;
      const isCritical = attackRes === AttackResult.CriticalHit;
      const isBlocked = reaction === DamageReaction.IMMUNITY;
      const finalDamage = actionResult.damage.amount;
      const effect = {
            id: Date.now(),
            damage: isMiss || isFumble ? "" : Math.round(finalDamage),
            weak: isWeak,
            critical: isCritical,
            miss: isMiss,
            fumble: isFumble,
            blocked: isBlocked,
            color: getDamageColor(actionResult.damage.type),
          };

          const key = `${position.x},${position.y}`;
          if (!damageEffects.value[key]) {
            damageEffects.value[key] = [];
          }
          damageEffects.value[key].push(effect);

          setTimeout(() => {
            damageEffects.value[key] = damageEffects.value[key].filter(
              (e: any) => e.id !== effect.id
            );
          }, 1000);

          setTimeout(() => {
            const hitCombatant = getCombatant({ x: position.x + 1, y: position.y + 1 });
            if(hitCombatant && hitCombatant.stats.hp <= 0) {
              board.value.removeCombatant(hitCombatant); 
            }
          }, 500);
    };

    const specialSkill = () => {
      // Implement special skill logic here
      actionsRemaining.value--;
      game.value.nextTurn();
      prepareNextTurn();
    };

    
    const skip = () => {
      if(currentTeam.value.getAliveCombatants().length === 1) {
        game.value.nextTurn(1);
      } else {
        game.value.nextTurn(0.5);
      }
      prepareNextTurn();
    };

    const prepareNextTurn = () => {
      actionsRemaining.value = game.value.getActionsRemaining();
      hasMoved.value = false;
      previousPosition.value = null;
      updateTurnMessage();
    };

    const isDefending = (combatant: Combatant) => {
      return combatant.isDefending();
    };

    const calcHealthFill = (combatant: Combatant) => {
      const maxHealth = combatant.baseStats.hp;
      const currentHealth = combatant.stats.hp;
      return { width: (combatant.stats.hp / combatant.baseStats.hp) * 100 + '%' };
    };

    const calcStaminaFill = (combatant: Combatant) => {
      const maxStamina = combatant.baseStats.stamina;
      const currentStamina = combatant.stats.stamina;
      return { width: (combatant.stats.stamina / combatant.baseStats.stamina) * 100 + '%' };
    };

    const getDamageColor = (type: DamageType): string => {
      switch (type) {
        case DamageType.Slash:
        case DamageType.Crush:
        case DamageType.Pierce:
          return 'white';
        case DamageType.Fire:
          return 'orange';
        case DamageType.Ice:
          return 'lightblue';
        case DamageType.Lightning:
          return 'yellow';
        case DamageType.Blight:
          return 'green';
        case DamageType.Holy:
          return 'rgb(255, 255, 204)'; // Light yellow-white
        case DamageType.Dark:
          return 'purple';
        case DamageType.Unstoppable:
          return 'black';
        default:
          return 'white';
      }
    };

    return {
      board,
      teams,
      teamColors,
      getCombatant,
      isCurrentCombatant,
      actionsRemaining,
      turnMessage,
      canDefend,
      defend,
      specialSkill,
      skip,
      currentCombatant,
      canUndo,
      isDefending,
      roundCount,
      moveMode,
      cancel,
      showMoveOptions,
      isMoveValid,
      moveCombatant,
      undoMove,
      hasMoved,
      attackMode,
      showAttackOptions,
      isAttackValid,
      attackTarget,
      performAction,
      calcHealthFill,
      calcStaminaFill,
      getCombatantEffects,
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

.validMove {
  background-color: #e8ef8d;
  cursor: pointer;
}

.validAttack {
  background-color:rgb(226, 83, 83);
  cursor: pointer;
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
    height: 3px;
    background-color: darkred;
}

.stamina-bar{
    width: 100%;
    height: 3px;
    background-color: blue;
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

.damage-text-enter-active,
.damage-text-leave-active {
  transition: all 0.5s ease;
  position: absolute;
  top: -20px;
}

.damage-text-enter-from,
.damage-text-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.damage-effect {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: bold;
  animation: floatUp 1s forwards;
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -10px);
  }
  80%{
    opacity: 1;
    transform: translate(-50%, -10px);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -30px);
  }
}
</style>