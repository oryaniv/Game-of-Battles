
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
          :class="{ 
                    validMove: isMoveValid({ x: x - 1, y: y - 1 }),
                    validAttack: isAttackValid({ x: x - 1, y: y - 1 }),
                    validSkillHostile: isSkillTargetValid({ x: x - 1, y: y - 1 }) && isEnemy({ x: x, y: y }),
                    validSkillFriendly: isSkillTargetValid({ x: x - 1, y: y - 1 }) && isFriendly({ x: x , y: y  }),
                    validSkillNeutral: isSkillTargetValid({ x: x - 1, y: y - 1 }) && isNeutral({ x: x , y: y  }),
                    'aoe-highlight': isAoeHighlighted({ x: x - 1, y: y - 1 })
           }"
          @click="performAction({ x: x - 1, y:  y - 1})"
          @mouseover="showAoe({ x: x - 1, y: y - 1 })"
          @mouseleave="hideAoe"
        >
          <!-- <div class="coordinates" style="font-size: 24px;">{{x -1}},{{y - 1}}</div> -->
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
            <div :class="{'sprite-container': true, 'white': getCombatant({ x, y })?.team.getIndex() === 0}">
              <img class="combatant-sprite" :src="getCombatantSprite(getCombatant({ x, y }))" alt="Combatant" />
             
            </div>
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
            <transition-group name="damage-svg" tag="div">
              <img
                v-if="getCombatantEffects({ x: x - 1, y: y - 1 }).length > 0 && getCombatantEffects({ x: x - 1, y: y - 1 })[0].damage !== ''"
                :key="getCombatantEffects({ x: x - 1, y: y - 1 })[0].id"
                :src="getDamageSvg(getCombatantEffects({ x: x - 1, y: y - 1 })[0].type)"
                class="damage-svg-icon"
              />
            </transition-group>
            <div class="status-effect-indicator">
                <div
                  v-for="statusEffect in getCombatantStatusEffects({ x: x - 1, y: y - 1 })"
                  :key="statusEffect.name"
                  
                  :style="{ color: getStatusEffectColor(statusEffect.alignment) }"
                >
                  {{ getStatusEffectLetter(statusEffect.name) }}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="actionsRemaining > 0" class="actions">
      <span class="actions-remaining-label">Actions Remaining</span>
      <div  v-for="x in Math.floor(actionsRemaining)" class="turn-icon" :key="x">
      </div>
      <div v-if="actionsRemaining !== Math.round(actionsRemaining)" class="half-turn-icon" :key="x">
      </div>
    </div>

    <div class="action-menu" v-if="!isGameOver()">
      <div class="action-menu-button-container" v-if="currentCombatant">
        <button :disabled="attackMode || moveMode || showSkillsMenu || skillMode" @click="showAttackOptions">Attack</button>
        <button :disabled="hasMoved && !canDefendAndMove() || attackMode || moveMode || showSkillsMenu || skillMode" @click="defend">Defend</button>
        <button :disabled="attackMode || moveMode || showSkillsMenu || skillMode" v-if="!hasMoved" @click="showMoveOptions">Move</button>
        <button v-if="hasMoved" @click="undoMove">Undo Move</button>
        <button :disabled="showSkillsMenu || !hasActiveSpecialMoves() || skillMode" @click="showSpecialSkills">Special Skill</button>
        <button :disabled="attackMode || moveMode || showSkillsMenu || skillMode" @click="skip">Skip</button>
        <button :disabled="!moveMode && !attackMode && !showSkillsMenu && !skillMode" @click="cancel">Cancel</button>
      </div>
    </div>



    <div v-if="showSkillsMenu" class="skill-menu">
      <div class="skill-menu-header">
        <div class="skill-menu-header-name">{{ currentCombatant?.name }} The {{ currentCombatant?.getCombatantType() }}</div>
        <div class="skill-menu-header-sp-remaining">Remaining SP : {{ currentCombatant?.stats.stamina }}</div>
      </div>
      <div class="skill-menu-body">
        <div
          v-for="skill in getCombatantSpecialMoves(currentCombatant)"
          :key="skill.name"
          class="skill-item"
          :class="{ disabled: !isSkillEnabled(skill.name) }"
          :disabled="!isSkillEnabled(skill.name)"
          @click="showSkillTargets(skill.name)"
          @mouseover="showSkillDescription(skill.name)"
          @mouseleave="hideSkillDescription"
        >
          <span class="skill-name">{{ skill.name }}</span>
          <span class="skill-cost">{{ skill.cost }} SP</span>
        </div>
      </div>
      <div v-if="selectedSkillDescription" class="skill-description">
        {{ selectedSkillDescription }}
      </div>
    </div>

    <!-- <img class="dragon-left" src="./assets/white_dragon_black_back.png" alt="left dragon" />
    <img class="dragon-right" src="./assets/white_dragon_black_back.png" alt="right dragon" /> -->
    
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, onMounted, computed } from 'vue';
import { emitter } from './eventBus';
import { Combatant } from './logic/Combatant';
import { Board } from './logic/Board';
import { Team } from './logic/Team';
import { Game } from './logic/Game';
import { Position } from './logic/Position';
import { ActionResult, AttackResult } from './logic/attackResult';
import { DamageType, DamageReaction } from './logic/Damage';
import { CombatantType } from './logic/Combatants/CombatantType';
import { Militia} from './logic/Combatants/Militia';
import { Defender } from './logic/Combatants/Defender';
import { Hunter } from './logic/Combatants/Hunter';
import { Healer } from './logic/Combatants/Healer';
import { Wizard } from './logic/Combatants/Wizard'; 
import { SpecialMove, SpecialMoveTriggerType } from './logic/SpecialMove';
import { StatusEffect, StatusEffectType, StatusEffectAlignment } from './logic/StatusEffect';

export default defineComponent({
  setup() {
    const board = ref(new Board(10, 10));
    const whiteTeam = ref(new Team('White Team', 0));
    const blackTeam = ref(new Team('Black Team', 1));
    /// add to white team
    //  whiteTeam.value.addCombatant(new Defender('Boris', { x: 4, y: 1 }, whiteTeam.value));
    // whiteTeam.value.addCombatant(new Defender('Igor', { x: 5, y: 1 }, whiteTeam.value));
    // whiteTeam.value.addCombatant(new Hunter('Zarina', { x: 4, y: 0 }, whiteTeam.value));
    whiteTeam.value.addCombatant(new Wizard('Ivan', { x: 5, y: 0 }, whiteTeam.value));
    // whiteTeam.value.addCombatant(new Healer('Annika', { x: 3, y: 0 }, whiteTeam.value));
    /// add to black team
    // blackTeam.value.addCombatant(new Defender('Michael', { x: 5, y: 8 }, blackTeam.value));
    // blackTeam.value.addCombatant(new Defender('Jake', { x: 6, y: 8 }, blackTeam.value));
    // blackTeam.value.addCombatant(new Hunter('Cecile', { x: 5, y: 9 }, blackTeam.value));
    // blackTeam.value.addCombatant(new Wizard('Bran', { x: 6, y: 9 }, blackTeam.value));
    //blackTeam.value.addCombatant(new Healer('Marianne', { x: 7, y: 9 }, blackTeam.value));
    
    whiteTeam.value.addCombatant(new Militia('q', { x: 0, y: 0 }, whiteTeam.value));
    blackTeam.value.addCombatant(new Militia('n', { x: 5, y: 3 }, blackTeam.value));
    blackTeam.value.addCombatant(new Militia('b', { x: 4, y: 3 }, blackTeam.value));
    blackTeam.value.addCombatant(new Militia('c', { x: 3, y: 3 }, blackTeam.value));
    blackTeam.value.addCombatant(new Militia('d', { x: 4, y: 2 }, blackTeam.value));
    

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
    const skillMode = ref(false);
    const validAttacks = ref<Position[]>([]);
    const validTargetsForSkill = ref<Position[]>([]);

    const damageEffects = ref<{ [key: string]: any[] }>({});

    const showSkillsMenu = ref(false);
    const selectedSkillDescription = ref<string | null>(null);
    const currentSkill = ref<SpecialMove | null>(null);
    const aoePositions = ref<Position[]>([]);

    const getCombatantEffects = (position: Position) => {
      const key = `${position.x},${position.y}`;
      return damageEffects.value[key] || [];
    };

    onMounted(() => {
      updateTurnMessage();

      actionsRemaining.value = currentTeam.value.combatants.length;
      emitter.on('trigger-method', (actionResultData:any) => {
        applyAttackEffects(actionResultData, actionResultData.position);
      });
      
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
      } else if (skillMode.value) {
        performSkill(position);
      }
    }

    const defend = () => {
      game.value.executeDefend();
      game.value.nextTurn();
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
      skillMode.value = false;
      validMoves.value = [];
      validAttacks.value = [];
      showSkillsMenu.value = false;
      validTargetsForSkill.value = [];
      currentSkill.value = null;
      aoePositions.value = [];
    };

    const isMoveValid = (position: Position): boolean => {
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
        const result: ActionResult = game.value.executeBasicAttack(currentCombatant.value, position, board.value as Board); 
        game.value.nextTurn();
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
            type: actionResult.damage.type
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

    const canDefendAndMove = () => {
      const currentCombatant = game.value.getCurrentCombatant();
      return currentCombatant?.getSpecialMoves().some((move) => move.name === "Marching Defense");
    }
    
    const skip = () => {
      game.value.executeSkipTurn();
      game.value.nextTurn();
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


    const getCombatantSprite = (combatant: Combatant) => {
      return typeToSprite(combatant.getCombatantType());
    }

    const typeToSprite = (type: CombatantType) => {
      switch (type) {
        case CombatantType.Militia:
          return require('./assets/Militia.svg');
        case CombatantType.Defender:
          return require('./assets/Defender.svg');
        case CombatantType.Hunter:
          return require('./assets/Hunter.svg');
        case CombatantType.Healer:
          return require('./assets/Healer.svg');
        case CombatantType.Wizard:
          return require('./assets/Wizard.svg');
      }
    }

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
        case DamageType.Healing:
          return 'lightgreen';
        default:
          return 'white';
      }
    };

    const getDamageSvg = (type: DamageType): string => {
        switch (type) {
          case DamageType.Slash:
            return require('./assets/Slash.svg');
          case DamageType.Crush:
            return require('./assets/Crush.svg');
          case DamageType.Pierce:
            return require('./assets/Pierce.svg');
          case DamageType.Fire:
            return require('./assets/Flame.svg');
          case DamageType.Ice:
            return require('./assets/Ice.svg');
          case DamageType.Lightning:
            return require('./assets/Thunder.svg');
          case DamageType.Blight:
            return require('./assets/Skull.svg');
          case DamageType.Holy:
            return require('./assets/Sun.svg');
          case DamageType.Dark:
            return require('./assets/Pentagram.svg');
          case DamageType.Healing:
            return require('./assets/Healing.svg');
          // ... other cases
          default:
            return require('./assets/Empty.svg'); // Or a default SVG path
        }
    };

    const showSpecialSkills = () => {
      showSkillsMenu.value = true;
    };

    const getCombatantSpecialMoves = (combatant: Combatant) => {
      return combatant.getSpecialMoves().filter((move) => move.triggerType === SpecialMoveTriggerType.Active);
    }

    const hasActiveSpecialMoves = () => {
      return currentCombatant.value?.getSpecialMoves()
      .filter((move) => move.triggerType === SpecialMoveTriggerType.Active).length > 0;
    }

    const showSkillDescription = (skillName: string) => {
      if (currentCombatant.value) {
        const skill = currentCombatant.value.specialMoves.find(
          (skill) => skill.name === skillName
        );
        if (skill) {
          selectedSkillDescription.value = skill.description || 'No description available.';
        }
      }
    };

    const hideSkillDescription = () => {
      selectedSkillDescription.value = null;
    };

    const isSkillEnabled = (skillName: string) => {
      const skill = currentCombatant.value?.specialMoves.find(
        (skill) => skill.name === skillName
      );
      return !!skill && !!currentCombatant.value && currentCombatant.value.canUseSkill(skill);
    }

    const showSkillTargets = (skillName: string) => {
      if(!currentCombatant.value) {
        return;
      }
      const skill = currentCombatant.value.specialMoves.find(
        (skill) => skill.name === skillName
      );
      if(!skill) {
        return;
      }
      showSkillsMenu.value = false;
      skillMode.value = true;
      currentSkill.value = skill;
      const range = skill.range;
      validTargetsForSkill.value = board.value.getValidTargetsForSkill(currentCombatant.value, range);      
    };

    const isSkillTargetValid = (position: Position): boolean => {
      return validTargetsForSkill.value.some(
        (target) => target.x === position.x && target.y === position.y
      );
    };

    const isEnemy = (position: Position): boolean => {
      const combatant = getCombatant(position);
      return combatant?.team !== currentTeam.value;
    }

    const isFriendly = (position: Position): boolean => {
      const combatant = getCombatant(position);
      return combatant?.team === currentTeam.value;
    }

    const isNeutral = (position: Position): boolean => {  
      const combatant = getCombatant(position);
      return !combatant;
    }

    const performSkill = (position: Position) => {
      if (isSkillTargetValid(position) && currentCombatant.value 
      && currentSkill.value && currentSkill.value.effect) {
        const actionResults = game.value.executeSkill(currentSkill.value, currentCombatant.value, position, board.value as Board);
        actionResults.forEach((actionResult) => {
          if(actionResult.attackResult !== AttackResult.NotFound) {
            const applyPosition = actionResult.position || position;
            applyAttackEffects(actionResult, applyPosition);
          }
        });
        skillMode.value = false;
        validTargetsForSkill.value = [];
        aoePositions.value = [];
        game.value.nextTurn();
        prepareNextTurn();
      }
    }

    const statusEffectLetters: { [key in StatusEffectType]?: string } = {
      [StatusEffectType.BLOCKING_STANCE]: "B",
      [StatusEffectType.ARCANE_CHANNELING]: "H",
      [StatusEffectType.FOCUS_AIM]: "A",
      [StatusEffectType.IMMOBILIZED]: "Z",
      [StatusEffectType.FORTIFIED]: "O",
      [StatusEffectType.FROZEN]: "F",
      [StatusEffectType.REGENERATING]: "R",
      // ... add mappings for other status effect types
    };

    const getStatusEffectLetter = (effectType: StatusEffectType): string => {
      return statusEffectLetters[effectType] || "?"; // Default to "?" if not found
    };

     const getStatusEffectColor = (alignment: StatusEffectAlignment): string => {
      switch (alignment) {
        case StatusEffectAlignment.Positive:
          return 'blue';
        case StatusEffectAlignment.Negative:
          return 'red';
        case StatusEffectAlignment.Neutral:
          return 'yellow';
        default:
          return 'white'; // Default color
      }
    };

    const showAoe = (position: Position) => {
        if(currentSkill.value && currentCombatant.value && isSkillTargetValid(position)) {
          aoePositions.value = board.value.getAreaOfEffectPositions(
            currentCombatant.value,
            position,
            currentSkill.value.range.areaOfEffect,
            currentSkill.value.range.range
          );
        }
    }

    const hideAoe = () => {
        aoePositions.value = [];
    }

    const isAoeHighlighted = (position: Position): boolean => {
      return aoePositions.value.some(
        (aoePosition) => aoePosition.x === position.x && aoePosition.y === position.y
      );
    }

    const getCombatantStatusEffects = (position: Position): StatusEffect[] => {
      const combatant = board.value.getCombatantAtPosition(position);
      return combatant ? combatant.getStatusEffects() : [];
    };

    const isGameOver = () => {
      return game.value.isGameOver();
    }

    return {
      board,
      teams,
      teamColors,
      getCombatant,
      isCurrentCombatant,
      actionsRemaining,
      turnMessage,
      defend,
      skip,
      currentCombatant,
      canDefendAndMove,
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
      showSpecialSkills,
      showSkillsMenu,
      getCombatantSprite,
      getCombatantSpecialMoves,
      hasActiveSpecialMoves,
      showSkillDescription,
      hideSkillDescription,
      selectedSkillDescription,
      isSkillEnabled,
      showSkillTargets,
      isSkillTargetValid,
      skillMode,
      isEnemy,
      isFriendly,
      isNeutral,
      isGameOver,
      getCombatantStatusEffects,
      getStatusEffectColor,
      getStatusEffectLetter,
      isAoeHighlighted,
      showAoe,
      hideAoe,
      getDamageSvg
    };
  },
});
</script>

<style scoped>

@font-face {
  font-family: "EnchantedLand";
  src: url("@/assets/EnchantedLand-jnX9.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

div {
  font-family: "EnchantedLand", Arial, sans-serif;
  color: white;
}

button {
  font-family: "EnchantedLand", Arial, sans-serif;
} 

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.message {
  font-size: 32px;
}

.actions-remaining-label {
  font-size: 24px;
  display: inline-block;
  margin-right: 10px;
  vertical-align: super;
}

.combatant-sprite {
  width: 15px;
  height: 15px;
}

.sprite-container.white {
  filter: invert(1);
}

.turn-icon {
  width: 25px;
  height: 25px;
  background-image: url('./assets/flaming_sword.jpg');
  background-size: cover;
  background-position: center;
  display: inline-block;
}

.half-turn-icon {
  width: 25px;
  height: 25px;
  background-image: url('./assets/flaming_sword.jpg');
  background-size: cover;
  background-position: center;
  display: inline-block;
  filter: brightness(0.5);
}

.round-count {
  font-size: 24px;
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
  background-size: cover;
}

.validMove {
  background-color: #e8ef8d;
  cursor: pointer;
}

.validAttack {
  background-color:rgb(226, 83, 83);
  cursor: pointer;
}

.validSkillHostile {
  background-color: rgb(226, 83, 83);
  cursor: pointer;
}

.validSkillFriendly {
  background-color: blue;
  cursor: pointer;
}

.validSkillNeutral {
  background-color: #e8ef8d;
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
    background-color: darkblue;
    margin-bottom: 2px;
}

.health-fill{
    background-color: red;
    height: 100%;
}

.stamina-fill{
  background-color: blue;
  height: 100%;
}

.defend-icon{
  position: absolute;
  top: 6px;
}

.actions {
  margin-top: 20px;
  font-size: 24px;
}

.action-menu {
  position: absolute;
  left: 15%;
  bottom: 7%;
}

.action-menu-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.action-menu-button-container button {
  font-size: 20px;
  color: white;
  width: 100%;
  background-image: url(https://img.goodfon.com/original/3024x1964/8/46/tekstura-ametist-kamen.jpg);
  border-radius: 20px;
}

.action-menu-button-container button:hover {
  color: red;
}

.action-menu-button-container button:disabled {
  color: gray;
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

.damage-icon {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  background-image: url('./assets/Healing.svg');
  background-size: cover;
  background-position: center;
  width: 15px;
  height: 15px;
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

.skill-menu {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 450px;
  background-color: #333;
  border: 1px solid white;
  display: flex;
  flex-direction: column;
  color: white;
}

.skill-menu-header {
  padding: 10px;
  border-bottom: 1px solid white;
}

.skill-menu-header-name {
  font-size: 22px;
  font-weight: bold;
  display: inline-block;
}

.skill-menu-header-sp-remaining {
  font-size: 20px;
  display: inline-block;
  float: right;
}

.skill-menu-body {
  flex: 1;
  overflow-y: auto;
}

.skill-item {
  font-size: 20px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #555;
  cursor: pointer;
}

.skill-item:last-child {
  border-bottom: none;
}

.skill-item:hover {
  background-color: #444;
}

.skill-name {
  flex: 1;
}

.skill-cost {
  width: 40px;
  text-align: right;
}

.disabled {
  color: #888;
  cursor: not-allowed;
}

.skill-description {
  font-size: 20px;
  padding: 10px;
  border-top: 1px solid white;
  text-align: center;
}

.dragon-left {
  position: absolute;
  top: 10%;
  left: 0;
  transform: scale(0.6);
}

.dragon-right {
  position: absolute;
  top: 10%;
  right: 0;
  transform: scale(0.6) scaleX(-1);
}

.status-effect-indicator {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  font-weight: bold;
  display: flex;
  gap: 1px;
  /* Add more styling as needed */
}

.aoe-highlight {
  background-color: rgba(255, 0, 0, 0.5); /* Default red */
}

.aoe-highlight[data-alignment='Positive'] {
  background-color: rgba(0, 0, 255, 0.5); /* Light blue */
}

.damage-svg-enter-active,
.damage-svg-leave-active {
  transition: opacity 1s ease;
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
}

.damage-svg-enter-from,
.damage-svg-leave-to {
  opacity: 0;
}

.damage-svg-icon {
  width: 20px;
  height: 20px;
  color: red;
}
</style>