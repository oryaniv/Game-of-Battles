
<template>
  <div class="game-container">
    <div class="message">{{ turnMessage }}</div>
    <div class="round-count">Round: {{ roundCount }}</div>
    <div class="board-frame">
    <div class="board">
      <div class="board-background">
      </div>
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
            :class="{ dead: getCombatant({ x, y })?.stats.hp <= 0 }"
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
            <div class="status-effect-indicator-negative">
                <div
                  v-for="statusEffect in getCombatantStatusEffects({ x: x - 1, y: y - 1 }, 0)"
                  :key="statusEffect.name"
                  
                  :style="{ color: getStatusEffectColor(statusEffect.alignment) }"
                >
                  {{ getStatusEffectLetter(statusEffect.name) }}
                </div>
            </div>
            <div class="status-effect-indicator-positive">
                <div
                  v-for="statusEffect in getCombatantStatusEffects({ x: x - 1, y: y - 1 }, 1)"
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
 </div>
    

    <!-- Actions Remaining indicator -->
    <div v-if="actionsRemaining > 0" class="actions">
      <span class="actions-remaining-label">Actions Remaining</span>
      <div  v-for="x in Math.floor(actionsRemaining)" class="turn-icon" :key="x">
      </div>
      <div v-if="actionsRemaining !== Math.round(actionsRemaining)" class="half-turn-icon" :key="x">
      </div>
    </div>

    <!-- Turn Play Menu -->
    <div class="action-menu" v-if="!isGameOver()">
      <div class="action-menu-button-container" v-if="currentCombatant">
        <button :disabled="!canAttack() || attackMode || moveMode || showSkillsMenu || skillMode" @click="showAttackOptions">Attack</button>
        <button :disabled="hasMoved && !canDefendAndMove() || !canDefend() || attackMode || moveMode || showSkillsMenu || skillMode" @click="defend">Defend</button>
        <button :disabled="attackMode || moveMode || showSkillsMenu || skillMode" v-if="!hasMoved" @click="showMoveOptions">Move</button>
        <button v-if="hasMoved" @click="undoMove">Undo Move</button>
        <button :disabled="showSkillsMenu || !hasActiveSpecialMoves() || skillMode" @click="showSpecialSkills">Use Skill</button>
        <button :disabled="showSkillsMenu || skillMode || showCoopSkill" @click="showCoopSkillMenu">Use Co-op Skill</button>
        <button :disabled="attackMode || moveMode || showSkillsMenu || skillMode" @click="skip">Skip</button>
        <button :disabled="!moveMode && !attackMode && !showSkillsMenu && !skillMode && !showCoopSkill && !coopSkillMode" @click="cancel">Cancel</button>
        <button v-if="!isGameOver()" @click="playAiTurn(currentCombatant)">AI Play</button>
        <button @click="showStatus">Status</button>
      </div>
    </div>
    


    <!-- Regular Skill Menu -->
    <div v-if="showSkillsMenu" class="skill-menu">
      <div class="skill-menu-header">
        <div class="skill-menu-header-title">Use Skill</div>
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

    <!-- Co-op Skill Menu -->
    <div v-if="showCoopSkill" class="skill-menu coop-skill-menu">
      <div class="skill-menu-header">
        <div class="skill-menu-header-title">Use Co op Skill</div>
        <div class="skill-menu-header-name">{{ currentCombatant?.name }} The {{ currentCombatant?.getCombatantType() }}</div>
        <div class="skill-menu-header-sp-remaining">Remaining SP : {{ currentCombatant?.stats.stamina }}</div>
      </div>
      <div class="skill-menu-body">
        <div
          v-for="skill in getCombatantCoopMoves(currentCombatant)"
          :key="skill.move.name"
          class="skill-item"
          :class="{ disabled: !isSkillEnabled(skill.move.name, skill.partners) }"
          :disabled="!isSkillEnabled(skill.move.name, skill.partners)"
          @click="showCoopSkillTargets(skill.move.name)"
          @mouseover="showCoopSkillDescription(skill.move.name, skill.partners)"
          @mouseleave="hideCoopSkillDescription"
        >
          <span class="skill-name">{{ skill.move.name }}</span>
          <span class="skill-meter-cost">Meter: {{ skill.move.meterCost }}</span>
          <span class="skill-turn-cost">Turns: {{ skill.move.turnCost }}</span>
          <span class="skill-cost">{{ skill.move.cost }} SP</span>
        </div>
      </div>
      <div v-if="selectedCoopSkillDescription" class="skill-description">
        <div class="partner-list">
          <div class="partner-list-header">Partners</div>
          <div class="partner-list-item" v-for="partner in selectedCoopSkillPartners" :key="partner.name">
            {{ partner.name }} - {{ partner.getCombatantType() }}
          </div>
        </div>
        {{ selectedCoopSkillDescription }}
      </div>
    </div>

  <!-- Turn Order: white team-->
  <div v-if="getWhiteTeamCombatants().length > 0" class="white-team-turn-order-container">
    <div v-for="combatant in getWhiteTeamCombatants()" :key="combatant.name" class="turn-order-item" :style="{ filter: getCurrentTeamIndex() === 1 ? 'blur(4px)' : '' }">
      <div class="turn-order-combatant-icon" :style="{ boxShadow: getCurrentCombatant()?.name === combatant.name ? '0 0 10px 5px rgba(0, 255, 0, 0.7)' : '' }">
        <div class="sprite-container white">
              <img class="combatant-sprite" :src="getCombatantSprite(combatant)" alt="Combatant" />  
        </div>
        {{ combatant.name }}
      </div>
      <div class="dead-x" v-if="combatant.stats.hp <= 0">
        <img  src="./assets/X.svg" alt="Dead" />
      </div>
    </div>
  </div>

  <!-- Turn Order: black team -->
  <div v-if="getBlackTeamCombatants().length > 0" class="black-team-turn-order-container" >
    <div v-for="combatant in getBlackTeamCombatants()" :key="combatant.name" class="turn-order-item" :style="{ filter: getCurrentTeamIndex() === 0 ? 'blur(4px)' : '' }">
      <div class="turn-order-combatant-icon" :style="{ boxShadow: getCurrentCombatant()?.name === combatant.name ? '0 0 10px 5px rgba(0, 255, 0, 0.7)' : '' }">
        <div class="sprite-container black" >
            <img class="combatant-sprite" :src="getCombatantSprite(combatant)" alt="Combatant" />  
        </div>
        {{ combatant.name }}
      </div>
      <div class="dead-x" v-if="combatant.stats.hp <= 0">
        <img  src="./assets/X.svg" alt="Dead" />
      </div>
    </div>
  </div>

  <!-- Turn Event Message Box -->
  <div class="event-indicator-container">
    <div class="event-indicator-text">
         {{getEvents()[getEvents().length - 1]}}
    </div>
  </div>


  <!-- <div class="event-log">
    <div class="event-log-header">
      Event Log
    </div>
    <div id="event-log-body" class="event-log-body">
      <div class="event-log-item" v-for="event in getEvents()" :key="event.id">
        {{ event }}
      </div>
    </div>
  </div> -->

      <!-- <img class="dragon-left" src="./assets/white_dragon_black_back.png" alt="left dragon" />
      <img class="dragon-right" src="./assets/white_dragon_black_back.png" alt="right dragon" />
      -->

      <!-- Status Popup -->
     <div v-if="showStatusPopup" class="status-popup">
      <div class="status-popup-header">
        {{ currentCombatant?.name }} the {{ currentCombatant?.getCombatantType() }}'s Status
      </div>
      <div class="status-popup-body">
        <div
          v-for="[statName, statValue] in Object.entries(getCurrentCombatant()?.stats)"
          :key="statName"
          class="stat-bar"
        >
          <span class="stat-name">{{ getStatUiName(statName) }}:</span>
          <span
            class="stat-value"
            :style="{ color: 'white' }"
          >
            {{ Math.floor(statValue) }}
          </span>
          <div class="bar-container">
            <div v-if="statValue === getCurrentCombatant()?.baseStats[statName]"
              class="bar-fill"
              :style="{ width: (statValue / getStatusScale(statName)) * 100 + '%' }"
            ></div>
            <div v-if="statValue < getCurrentCombatant()?.baseStats[statName]"
              class="bar-fill-debuff"
              :style="{ width: (statValue / getStatusScale(statName)) * 100 + '%' }"
            ></div>
            <div v-if="statValue > getCurrentCombatant()?.baseStats[statName]"
              class="bar-fill-buff"
              :style="{ width: (statValue / getStatusScale(statName)) * 100 + '%' }"
            ></div>
          </div>
        </div>
        <div class="status-effects-list">
          <div class="status-effects-header">Status Effects:</div>
          <div
            v-for="effect in currentCombatant?.statusEffects"
            :key="effect.name"
            class="status-effect-item"
            :style="{ color: getStatusEffectColor(effect.type) }"
          >
            {{ statusNameToText(effect.name) }}
          </div>
        </div>
      </div>
      <div class="status-popup-close">
        <button @click="hideStatusPopup">Close</button>
      </div>
    </div>
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
import { Witch } from './logic/Combatants/Witch';
import { Fool } from './logic/Combatants/Fool';
import { Pikeman } from './logic/Combatants/Pikeman';
import { Vanguard } from './logic/Combatants/Vanguard';
import { FistWeaver } from './logic/Combatants/FistWeaver';
import { StandardBearer } from './logic/Combatants/StandardBearer';
import { Artificer } from './logic/Combatants/Artificer';
import { Wall, Bomb, BabyBabel, BallistaTurret } from './logic/Combatants/ArtificerConstructs';
import { Rogue } from './logic/Combatants/Rogue';
import { Gorilla } from './logic/Combatants/Gorilla';
import { SpecialMove, SpecialMoveTriggerType } from './logic/SpecialMove';
import { CoopMove, CoopMoveWithPartners } from './logic/SpecialMoves/Coop/CoopMove'
import { StatusEffect, StatusEffectType, StatusEffectAlignment } from './logic/StatusEffect';
import { SimpleAIAgent } from './logic/AI/AIAgent';
import { DummyAIAgent, BunkerDummyAIAgent, ToddlerAIAgent, KidAIAgent, TeenagerAIAgent, RookieAIAgent } from './logic/AI/DeterministicAgents';
import { RandomAIAgent } from './logic/AI/HeuristicalAgents';
import { VeteranAIAgent } from './logic/AI/VeteranAIAgent';
import { Howl } from 'howler';
import { EventLogger } from './eventLogger';
import { AllOfThem, standardVsSetup, theATeam, theBTeam, allMilitiaSetup, theGorillaTeam,
 generateRandomTeam, generateCombatantIdenticalTeam, placeAllCombatants, debugSetupWhiteTeam, debugSetupBlackTeam} from './boardSetups';
 import { getGameOverMessage } from './GameOverMessageProvider';

export default defineComponent({
  setup() {
    
    const board = ref(new Board(10, 10));
    const veternAIAgentWithCoop = new VeteranAIAgent();
    veternAIAgentWithCoop.setCollectCoop(true);
    const veternAIAgentNoCoop = new VeteranAIAgent();
    veternAIAgentNoCoop.setCollectCoop(false);
    const rookieAIAgent = new RookieAIAgent();
    const whiteTeam = ref(new Team('White Team', 0));
    const blackTeam = ref(new Team('Black Team', 1, veternAIAgentWithCoop));

    // whiteTeam.value.addCombatant(new Defender('aobo', { x: 3, y: 5}, whiteTeam.value));
    whiteTeam.value.addCombatant(new Wizard('bobo', { x: 7, y: 0}, whiteTeam.value));
    whiteTeam.value.addCombatant(new Wizard('cobo', { x: 6, y: 0}, whiteTeam.value));
    whiteTeam.value.addCombatant(new Wizard('dobo', { x: 5, y: 1}, whiteTeam.value));
    whiteTeam.value.addCombatant(new Wizard('eobo', { x: 4, y: 0}, whiteTeam.value));
    whiteTeam.value.addCombatant(new StandardBearer('tnguobo', { x: 6, y: 0}, whiteTeam.value));
    // whiteTeam.value.addCombatant(new BabyBabel('Gobo', { x: 5, y: 1}, whiteTeam.value));
    // whiteTeam.value.addCombatant(new BallistaTurret('Gobo', { x: 6, y: 1}, whiteTeam.value));
    // whiteTeam.value.addCombatant(new Wall('Gobo', { x: 5, y: 3}, whiteTeam.value));
    // whiteTeam.value.addCombatant(new Wall('Gobo', { x: 6, y: 3}, whiteTeam.value));

    // whiteTeam.value.addCombatant(new Vanguard('Gobo', { x: 1, y: 8 }, whiteTeam.value));
    // whiteTeam.value.addCombatant(new Witch('eobo', { x: 4, y: 4 }, whiteTeam.value));

    blackTeam.value.addCombatant(new Vanguard('tobo', { x: 7, y: 1 }, blackTeam.value));
    blackTeam.value.addCombatant(new Hunter('dog', { x: 6, y: 3 }, blackTeam.value));
    blackTeam.value.addCombatant(new Pikeman('rob', { x: 6, y: 7 }, blackTeam.value));
    blackTeam.value.addCombatant(new FistWeaver('nana', { x: 5, y: 7 }, blackTeam.value));
    blackTeam.value.addCombatant(new StandardBearer('fefw', { x: 9, y: 9 }, blackTeam.value));
    // blackTeam.value.addCombatant(new Witch('nana', { x: 7, y: 9 }, blackTeam.value));
    // blackTeam.value.addCombatant(new Hunter('reqe', { x: 6, y: 9 }, blackTeam.value));
    // blackTeam.value.addCombatant(new Gorilla('feifne', { x: 5, y: 8 }, blackTeam.value));

  //blackTeam.value.addCombatant(new Artificer('Gobo', { x: 9, y: 6 }, blackTeam.value));

    // whiteTeam.value.combatants[0].stats.hp = 10;
    // whiteTeam.value.combatants[1].stats.hp = 10;
    // whiteTeam.value.combatants[2].stats.hp = 10;

    // whiteTeam.value.combatants[1].stats.stamina = 0;
    // whiteTeam.value.combatants[2].stats.stamina = 0;
    // whiteTeam.value.combatants[3].stats.stamina = 0;
    // blackTeam.value.combatants[0].applyStatusEffect({
    //         name: StatusEffectType.SLEEPING,
    //         duration: 5,
    // }); 

      // theATeam(whiteTeam.value);
      // theBTeam(blackTeam.value);

   placeAllCombatants(whiteTeam.value, blackTeam.value, board.value as Board);
    

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
    const coopSkillMode = ref(false);
    const validAttacks = ref<Position[]>([]);
    const validTargetsForSkill = ref<Position[]>([]);

    const damageEffects = ref<{ [key: string]: any[] }>({});

    const showSkillsMenu = ref(false);
    const showCoopSkill = ref(false);
    const selectedSkillDescription = ref<string | null>(null);
    const selectedCoopSkillDescription = ref<string | null>(null);
    const selectedCoopSkillPartners = ref<Combatant[] | null>(null);
    const currentSkill = ref<SpecialMove | null>(null);
    const aoePositions = ref<Position[]>([]);
    const eventLogger = EventLogger.getInstance();
    let eventLogBody: HTMLElement | null = null;

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

      emitter.on('play-move-sound', () => {
        playMoveSound();
      });

      eventLogBody = document.getElementById('event-log-body');
    });

    const updateTurnMessage = () => {
      if(game.value.isGameOver()) {
        // turnMessage.value = `Game Over`;
        turnMessage.value = getGameOverMessage(whiteTeam.value, blackTeam.value);
      } else {
        turnMessage.value = `${game.value.teams[(game.value as Game).getCurrentTeamIndex()].name}'s Turn`;
      }
    };

    

    const getWhiteTeamCombatants = () => {
      return whiteTeam.value.combatants;
    }

    const getBlackTeamCombatants = () => {
      return blackTeam.value.combatants;
    }

    const isCurrentCombatant = (position: Position): boolean => {
      if (currentCombatant.value && currentCombatant.value.position) {
        return (
          currentCombatant.value.position.x === position.x -1 &&
          currentCombatant.value.position.y === position.y -1
        );
      }
      return false;
    };

    const getCurrentCombatant = () => {
      return currentCombatant.value;
    }

    const getCurrentTeamIndex = () => {
      return game.value.getCurrentTeamIndex();
    }

    const performAction = (position: Position) => {
      if (moveMode.value) {
        moveCombatant(position);
      } else if (attackMode.value) {
        attackTarget(position);
      } else if (skillMode.value) {
        performSkill(position);
      } else if (coopSkillMode.value) {
        performCoopSkill(position);
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
        const shouldStop = currentCombatant.value.move(position, board.value as Board);
        if(shouldStop) {
          game.value.spendActionPoints(1);
          validMoves.value = [];
          hasMoved.value = true;
          moveMode.value = false;
          game.value.nextTurn();
          prepareNextTurn();
          hasMoved.value = false;
        }
        validMoves.value = [];
        hasMoved.value = true;
        moveMode.value = false;
        // playMoveSound();
        if (actionsRemaining.value <= 0) {
          game.value.nextTurn();
          prepareNextTurn();
          hasMoved.value = false;
        }
      }
    };

    const playMoveSound = () => {
      const currentMoveSound = moveSounds[Math.floor(Math.random() * moveSounds.length)];
      currentMoveSound && currentMoveSound.play();
    }

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
      coopSkillMode.value = false;
      validMoves.value = [];
      validAttacks.value = [];
      showSkillsMenu.value = false;
      showCoopSkill.value = false;
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
        // currentCombatant.value.hasMoved = false;
        currentCombatant.value.move(previousPosition.value, board.value as Board);
        // currentCombatant.value.hasMoved = false;
        previousPosition.value = null;
        hasMoved.value = false;
        currentCombatant.value.hasMoved = false;
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

          playSound(actionResult.damage.type);
    };

    const playSound = (type: DamageType) => {
      const sound = actionSounds[type];
      if(sound) {
        sound.play();
      }
    }

    const canAttack = (): boolean => {
      const currentCombatant = game.value.getCurrentCombatant();
      return currentCombatant?.basicAttack().amount > 0;
    }

    const canDefend = (): boolean => {
      const currentCombatant = game.value.getCurrentCombatant();
      return !currentCombatant?.isExpendable();
    }

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
      removeTheDead();
      updateTurnMessage();
      if(eventLogBody) {
        eventLogBody.scrollTop = eventLogBody.scrollHeight;
      }
      if(game.value.isGameOver()) {
        return;
      }

      // if the current combatant has an AI agent, let it play the turn
      const currentCombatant = game.value.getCurrentCombatant();
      if(currentCombatant && currentCombatant.getAiAgent() !== undefined) {
        setTimeout(() => {
          playAiTurn(currentCombatant);
        }, 1000);
      }
    };

    const removeTheDead = () => { 
      setTimeout(() => {
        const deadCombatants = board.value.getAllCombatants().filter((combatant) => combatant.stats.hp <= 0);
        deadCombatants.forEach((combatant) => {
          // board.value.removeCombatant(combatant);
          removeCombatantEffect(combatant);
          const combatantIndex = combatant.team.combatants.indexOf(combatant);
          if(combatant.isExpendable() && combatantIndex > -1) {
            combatant.team.combatants.splice(combatantIndex, 1);
          }
        });
      }, 500);

      function removeCombatantEffect(combatant: Combatant) {
        board.value.removeCombatant(combatant);
      }
    }

    const playAiTurn = (currentCombatant: Combatant) => {
      const aiActionResult: ActionResult | ActionResult[] = 
      currentCombatant.getAiAgent()!.playTurn(game.value.getCurrentCombatant(), game.value as Game, board.value as Board);
      if(Array.isArray(aiActionResult)) {
        aiActionResult.forEach((actionResult) => {
          actionResult.position && applyAttackEffects(actionResult, actionResult.position);
        });
      } else {
        aiActionResult.position && applyAttackEffects(aiActionResult, aiActionResult.position);
      }
      setTimeout(() => {
        game.value.nextTurn();
        prepareNextTurn();
      }, 1000);
    }

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
        case CombatantType.StandardBearer:
          return require('./assets/StandardBearer.svg');
        case CombatantType.Witch:
          return require('./assets/Witch.svg');
        case CombatantType.Fool:
          return require('./assets/Fool.svg');
        case CombatantType.Pikeman:
          return require('./assets/Pikeman.svg');
        case CombatantType.Vanguard:
          return require('./assets/Vanguard.svg');
        case CombatantType.FistWeaver:
          return require('./assets/FistWeaver.svg');
        case CombatantType.Artificer:
          return require('./assets/Artificer.svg');
        case CombatantType.Rogue:
          return require('./assets/Rogue.svg');
        case CombatantType.Gorilla:
          return require('./assets/Gorilla.svg');
        case CombatantType.Bomb:
          return require('./assets/Bomb.svg');
        case CombatantType.Wall:
          return require('./assets/Wall.svg');
        case CombatantType.Doll:
          return require('./assets/Fool.svg');
        case CombatantType.BallistaTurret:
          return require('./assets/Ballista.svg');
        case CombatantType.BabyBabel:
          return require('./assets/Babel.svg');
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
          case DamageType.Unstoppable:
            return require('./assets/Unstoppable.svg');
          // ... other cases
          default:
            return require('./assets/Empty.svg'); // Or a default SVG path
        }
    };

    const showSpecialSkills = () => {
      showSkillsMenu.value = true;
    };

    const showCoopSkillMenu = () => {
      showCoopSkill.value = true;
    }

    const getCombatantSpecialMoves = (combatant: Combatant) => {
      return combatant.getSpecialMoves().filter((move) => move.triggerType === SpecialMoveTriggerType.Active);
    }

    const getCombatantCoopMoves = (combatant: Combatant) => {
      const coopMoves = combatant.getSpecialMoves()
      .filter((move) => move.triggerType === SpecialMoveTriggerType.Cooperative) as CoopMove[];
      // .filter((move) => enoughActionPointsForCoop(move)) as CoopMove[];
      const possibleSupporters = combatant.team.getAliveCombatants().filter((ally) => combatant.name !== ally.name);
      const expandedCoopMoves: CoopMoveWithPartners[] = [];

      for (const move of coopMoves) {
        if (!('coopRequiredPartners' in move)) continue;

        // Get all possible combinations of supporters for each partner requirement
        const partnerCombinations: Combatant[][] = [];
        
        for (const requirement of (move as CoopMove).coopRequiredPartners) {
          // Find all supporters that match any of the required types for this slot
          const validSupporters = possibleSupporters.filter(supporter => 
            requirement.combatantTypeOptions.includes(supporter.getCombatantType())
          );
          partnerCombinations.push(validSupporters);
        }

        // Generate all possible combinations
        const generateCombinations = (current: Combatant[], depth: number) => {
          if (depth === partnerCombinations.length) {
            // Create a new instance of the move for this combination
            expandedCoopMoves.push({
              move,
              partners: [...current]
            });
            return;
          }

          for (const supporter of partnerCombinations[depth]) {
            // Skip if supporter is already used in current combination
            if (!current.includes(supporter)) {
              generateCombinations([...current, supporter], depth + 1);
            }
          }
        };

        generateCombinations([], 0);
      }

      return expandedCoopMoves;
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

    const showCoopSkillDescription = (skillName: string, partners: Combatant[]) => {
      if (currentCombatant.value) {
        const skill = currentCombatant.value.specialMoves.find(
          (skill) => skill.name === skillName
        );
        if (skill) {
          selectedCoopSkillDescription.value = skill.description || 'No description available.';
          selectedCoopSkillPartners.value = partners;
        }
      }
    }

    const hideCoopSkillDescription = () => {
      selectedCoopSkillDescription.value = null;
      selectedCoopSkillPartners.value = null;
    };

    const isCurrentSkillPartner = (combatant: Combatant) => {
      return selectedCoopSkillPartners.value?.some((partner) => partner.name === combatant.name);
    }

    const isSkillEnabled = (skillName: string, partners?: Combatant[]) => {
      const skill = currentCombatant.value?.specialMoves.find(
        (skill) => skill.name === skillName
      );

      if(!skill || !currentCombatant.value) {
        return false;
      }

      if(partners && partners.some(partner => !partner.canSupportSkill(skill))) {
         return false;
      }
      return currentCombatant.value.canUseSkill(skill) && enoughActionPointsForCoop(skill);

      function enoughActionPointsForCoop(move: SpecialMove): boolean {
        return move.turnCost <= (actionsRemaining.value + 0.5);
      }
    }

    const isCoopSkillEnabled = (skillName: string) => {
      const coopSkill = currentCombatant.value?.specialMoves.find(
        (skill) => skill.name === skillName
      );
      return !!coopSkill && coopSkill.turnCost <= (actionsRemaining.value + 0.5) && isSkillEnabled(coopSkill.name);
    }

    const showCoopSkillTargets = (skillName: string) => {
      if(!currentCombatant.value) {
        return;
      }
      
      selectedCoopSkillDescription.value = null;
      const skill = currentCombatant.value.specialMoves.find(
        (skill) => skill.name === skillName
      );
      if(!skill) {
        return;
      }
      showCoopSkill.value = false;
      coopSkillMode.value = true;
      currentSkill.value = skill;
      const range = skill.range;
      validTargetsForSkill.value = board.value.getValidTargetsForSkill(currentCombatant.value, range);
    }

    const showSkillTargets = (skillName: string) => {
      if(!currentCombatant.value) {
        return;
      }
      hideSkillDescription();
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

    const performCoopSkill = (position: Position) => {
      if (isSkillTargetValid(position) && currentCombatant.value 
      && currentSkill.value && currentSkill.value.effect && selectedCoopSkillPartners.value) {
        const coopMove = currentSkill.value as CoopMove;
        const actionResults = game.value.executeCoopSkill(coopMove, currentCombatant.value, selectedCoopSkillPartners.value, position, board.value as Board);
        actionResults.forEach((actionResult) => {
          if(actionResult.attackResult !== AttackResult.NotFound) {
            const applyPosition = actionResult.position || position;
            applyAttackEffects(actionResult, applyPosition);
          }
        });
        coopSkillMode.value = false;
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
      [StatusEffectType.STRENGTH_BOOST]: "S",
      [StatusEffectType.MOBILITY_BOOST]: "M",
      [StatusEffectType.ENCOURAGED]: "E",
      [StatusEffectType.RALLIED]: "L",
      [StatusEffectType.STRENGTH_DOWNGRADE]: "SD",
      [StatusEffectType.LUCK_DOWNGRADE]: "LD",
      [StatusEffectType.SLOW]: "SW",
      [StatusEffectType.POISONED]: "P",
      [StatusEffectType.BLEEDING]: "BL",
      [StatusEffectType.TAUNTED]: "TA",
      [StatusEffectType.STUPEFIED]: "ST",
      [StatusEffectType.NAUSEATED]: "NA",
      [StatusEffectType.MESMERIZED]: "ME",
      [StatusEffectType.MESMERIZING]: "ME",
      [StatusEffectType.STAGGERED]: "SG",
      [StatusEffectType.DEFENSE_DOWNGRADE]: "DD",
      [StatusEffectType.CLOAKED]: "CL",
      [StatusEffectType.MARKED_FOR_PAIN]: "MR1",
      [StatusEffectType.MARKED_FOR_EXECUTION]: "MR2",
      [StatusEffectType.MARKED_FOR_OBLIVION]: "MR3",
      [StatusEffectType.FULL_METAL_JACKET]: "FMJ",
      [StatusEffectType.PANICKED]: "PN",
      [StatusEffectType.CHARMED]: "CHM",
      [StatusEffectType.CIRCUS_DIABOLIQUE]: "CQ",
      [StatusEffectType.NIGHTMARE_LOCKED]: "NQ",
      [StatusEffectType.FORBIDDEN_AFFLICTION]: "FA",
      [StatusEffectType.DIVINE_RETRIBUTION]: "DR",
      [StatusEffectType.SANCTUARY]: "SC",
      [StatusEffectType.IDAI_NO_HADOU]: "INH",
      [StatusEffectType.PLAGUED]: "PLG",
      [StatusEffectType.BURNING]: "BRN",
      [StatusEffectType.FRENZY]: "FZ",
      [StatusEffectType.ARCANE_OVERCHARGE]: "AO",
      [StatusEffectType.ARCANE_BARRIER]: "AB",
      [StatusEffectType.ARCANE_CONDUIT]: "ACO",
      [StatusEffectType.GUARDIAN_PROTECTED]: "GP",
      [StatusEffectType.GUARDIAN]: "G",
      [StatusEffectType.SHIELD_WALL_PROTECTED]: "SWP",
      [StatusEffectType.SHIELD_WALL]: "SW",
      [StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED]: "ASP",
      [StatusEffectType.ARCANE_SHIELD_WALL]: "ASW",
      [StatusEffectType.DIAMOND_HOOKED]: "DH",
      [StatusEffectType.DIAMOND_HOOKED_HOLDING]: "DHH",
      [StatusEffectType.INGENIOUS_UPGRADE]: "IU",
      [StatusEffectType.SLEEPING]: "SL",
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
            currentSkill.value.range.align
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

    const getCombatant = (position: Position): Combatant | null => {
      // return board.value.getCombatantAtPosition({x: position.x -1, y: position.y - 1});
      const combatant = board.value.getVisibleCombatantAtPosition({x: position.x -1, y: position.y - 1}, currentTeam.value.index);
      return combatant;
      // return board.value.getVisibleCombatantAtPosition({x: position.x -1, y: position.y - 1}, currentTeam.value.index);
    };

    const getCombatantStatusEffects = (position: Position, alignment: StatusEffectAlignment): StatusEffect[] => {
      const combatant = board.value.getCombatantAtPosition(position);
      return combatant ? combatant.getStatusEffects().filter((statusEffect) => statusEffect.alignment === alignment) : [];
    };

    const isGameOver = () => {
      return game.value.isGameOver();
    }

    const actionSounds: { [key: string]: Howl } = {};
    // const moveSounds = [];
    let moveSound1: Howl | null = null;
    let moveSound2: Howl | null = null;
    let moveSound3: Howl | null = null;
    let moveSounds: Howl[] = [];
    const loadSounds = () => {
      const allSounds = [
        {name:'Blight', path:require('./sound/acid_splash_sound.mp3')},
        {name:'Crush', path:require('./sound/fist_sound.mp3')},
        {name:'Dark', path:require('./sound/dark_attack_sound.mp3')},
        {name:'Fire', path:require('./sound/flame_sound.mp3')},
        {name:'Healing', path:require('./sound/healing_sound.mp3')},
        {name:'Holy', path:require('./sound/holy_attack_sound.mp3')},
        {name:'Ice', path:require('./sound/Ice_sound.mp3')},
        {name:'Pierce', path:require('./sound/pierce_attack_sound.mp3')},
        {name:'Slash', path:require('./sound/sword_slash_sound.mp3')},
        {name:'Lightning', path:require('./sound/thunder_sound.mp3')},
      ];

      allSounds.forEach((sound) => {
         const newSound = new Howl({
          src: [sound.path],
          preload: true,
          onload: () => {
            console.log(sound +' sound preloaded!');
          },
        });
        actionSounds[sound.name] = newSound;
      })

      moveSound1 = new Howl({
        src: [require('./sound/move_sound_1.mp3')],
        preload: true,
      });

      moveSound2 = new Howl({
        src: [require('./sound/move_sound_2.mp3')],
        preload: true,
      });

      moveSound3 = new Howl({
        src: [require('./sound/move_sound_3.mp3')],
        preload: true,
      });

      moveSounds = [moveSound1, moveSound2, moveSound3]
    }

    loadSounds();

    const showStatusPopup = ref(false);
    const hideStatusPopup = () => {
      showStatusPopup.value = false;
    };

    const showStatus = () => {
      const stats = getCurrentCombatant()?.stats;
      for(const [statName, statValue] of Object.entries(stats)) {
        console.log(statName, statValue);
      }
      showStatusPopup.value = true;
    };

    const getStatUiName = (statName: string) => {
      switch (statName) {
        case 'hp':
          return 'HP';
        case 'attackPower':
          return 'Attack';
        case 'defensePower':
          return 'Defense';
        case 'agility':
          return 'Agility';
        case 'stamina':
          return 'Stamina';
        case 'movementSpeed':
          return 'Movement';
        case 'initiative':
          return 'Initiative';
        case 'range':
          return 'Range';
        case 'luck':
          return 'Luck';
      }
    }

    const getStatusScale = (statName: string) => {
      switch (statName) {
        case 'hp':
          return 100;
        case 'attackPower':
          return 50;
        case 'defensePower':
          return 50;
        case 'agility':
          return 15;
        case 'stamina':
          return 60;
        case 'movementSpeed':
          return 6;
        case 'initiative':
          return 10;
        case 'range':
          return 10;
        case 'luck':
          return 15;
      }
    }

    const statusNameToText = (statusName: StatusEffectType) => {
      switch (statusName) {
        case 0:
          return "Blocking Stance";
        case 1:
          return "Arcane Channeling";
        case 2:
          return "Focus Aim";
        case 3:
          return "Fortified";
        case 4:
          return "Immobilized";
        case 5:
          return "Regenerating";
        case 6:
          return "Frozen";
        case 7:
          return "Poisoned";
        case 8:
          return "Strength Boost";
        case 9:
          return "Mobility Boost";
        case 10:
          return "Encouraged";
        case 11:
          return "Rallied";
        case 12:
          return "Strength Downgrade";
        case 13:
          return "Inspiring Killer";
        case 14:
          return "Luck Downgrade";
        case 15:
          return "Slow";
        case 16:
          return "Energy Absorb";
        case 17:
          return "Bleeding";
        case 18:
          return "Taunted";
        case 19:
          return "Fools Luck";
        case 20:
          return "Mesmerizing";
        case 21:
          return "Mesmerized";
        case 22:
          return "Nauseated";
        case 23:
          return "Stupefied";
        case 24:
          return "Staggered";
        case 25:
          return "First Strike";
        case 26:
          return "Defense Downgrade";
        case 27:
          return "Idai No Hadou";
        case 28:
          return "Riposte";
        case 29:
          return "Struck First";
        case 30:
          return "Marching Defense";
        case 31:
          return "Cloaked";
        case 32:
          return "Sadist";
        case 33:
          return "Marked for Pain";
        case 34:
          return "Marked for Execution";
        case 35:
          return "Marked for Oblivion";
        case 36:
          return "Mark detonate";
        case 37:
          return "Full Metal Jacket";
          
      }
    }
    const getEvents = () => {
      return eventLogger.getEvents();
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
      canDefend,
      canAttack,
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
      getCombatantCoopMoves,
      hasActiveSpecialMoves,
      showSkillDescription,
      hideSkillDescription,
      selectedSkillDescription,
      isSkillEnabled,
      showSkillTargets,
      isSkillTargetValid,
      skillMode,
      coopSkillMode,
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
      getDamageSvg,
      playAiTurn,
      getWhiteTeamCombatants,
      getBlackTeamCombatants,
      getCurrentCombatant,
      getCurrentTeamIndex,
      showStatusPopup,
      hideStatusPopup,
      showStatus,
      getStatUiName,
      getStatusScale,
      statusNameToText,
      getEvents,
      showCoopSkill,
      showCoopSkillMenu,
      showCoopSkillDescription,
      hideCoopSkillDescription,
      selectedCoopSkillDescription,
      selectedCoopSkillPartners,
      showCoopSkillTargets,
      isCurrentSkillPartner
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
  /* background-color: black; */
  position: relative;
}

.row {
  display: flex;
}

.board-frame {
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 20px;
    z-index: 0;
    background-image: url('./assets/Frames/testFrame.png');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
}

.board-background {
  display: flex;
  width: 100%;
  height: 100%;
  /* background-image: url('./assets/Backgrounds/simpleLand6.png'); */
  background-image: url('./assets/Backgrounds/simpleLand5.png');
  /* background-image: url('./assets/Backgrounds/cave3.png'); */
  background-size: contain;
  /* background-color: red; */
  position: absolute;
  z-index: -1;
}

.panel {
  width: 70px;
  height: 70px;
  /*background-color: gray; */
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
  transition: box-shadow 0.3s ease-in-out, opacity 1s ease-out;
}

.combatant.dead {
  opacity: 0;
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
  left: 12%;
  top: 30%;
}

.action-menu-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.action-menu-button-container button {
  font-size: 28px;
  color: white;
  width: 100%;
  /*background-image: url(https://img.goodfon.com/original/3024x1964/8/46/tekstura-ametist-kamen.jpg);*/
  background: linear-gradient(to bottom, #000000,rgb(61, 8, 85));
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

.skill-menu.coop-skill-menu {
  width: 600px;
  height: 600px;
}

.skill-menu-header {
  padding: 10px;
  border-bottom: 1px solid white;
}

.skill-menu-header-title {
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
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

.coop-skill-menu .skill-name {
  flex: 0.7;
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

.partner-list {
  border-bottom: 1px solid white;
}

.partner-list-header {
  font-size: 24px;
}   

.partner-list-item {
  font-size: 20px;
}

.dragon-left {
  position: absolute;
  top: 7%;
  left: 0;
  transform: scale(0.6);
}

.dragon-right {
  position: absolute;
  top: 7%;
  right: 0;
  transform: scale(0.6) scaleX(-1);
}

.status-effect-indicator-positive, .status-effect-indicator-negative {
  position: absolute;
  top: -15%;
  font-size: 8px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  gap: 0px;
  /* Add more styling as needed */
}

.status-effect-indicator-positive {
  left: -50%;
}

.status-effect-indicator-negative {
  right: -50%;
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

.white-team-turn-order-container, .black-team-turn-order-container {
    display: flex;
    max-width: 335px;
}

.white-team-turn-order-container {
  flex-wrap: wrap;
}

.black-team-turn-order-container {
  flex-wrap: wrap-reverse;
}

.turn-order-item {
  border-radius: 5px;
  position: relative;
}

.dead-x {
  position: absolute;
  top: 0;
  left: 0;
}

.white-team-turn-order-container .turn-order-item {
  background-color: black;
  color: white;
}

.black-team-turn-order-container .turn-order-item {
  background-color: white;
  color: black;
}

.black-team-turn-order-container .turn-order-combatant-icon {
  color: black;
}

.black-team-turn-order-container {
  position: absolute;
  bottom: 0;
  right: 2%;
}

.white-team-turn-order-container {
  position: absolute;
  top: 0;
  right: 2%;
}

.turn-order-item {
  background-color: #333;
  border: 1px solid white;
  padding: 10px;
  margin: 5px;
  min-width: 35px;
  max-width: 35px;
  text-align: center;
}

.turn-order-combatant-icon .sprite-container {
  text-align: center;
}

.status-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  padding: 20px;
  background-color: #222;
  border: 1px solid white;
  color: white;
  z-index: 10;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
}

.status-popup-header {
  text-align: center;
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid #555;
  padding-bottom: 5px;
}

.status-popup-body {
  flex: 1;
  overflow-y: auto;
}

.stat-bar {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
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

.bar-fill-debuff {
  height: 100%;
  background-color: red;
  border-radius: 5px;
  position: absolute;
  z-index: 3;
}

.bar-fill-buff {
  height: 100%;
  background-color: blue;
  border-radius: 5px;
  position: absolute;
  z-index: 1;
}


.status-effects-list {
  margin-top: 15px;
}

.status-effects-header {
  font-weight: bold;
  margin-bottom: 5px;
}

.status-effect-item {
  margin-bottom: 3px;
}

.status-popup-close {
  margin-top: 20px;
  text-align: center;
}

.event-indicator-container {
  position: absolute;
  top: 30%;
  right: 3.5%;
  width: 280px;
  height: 30px;
  z-index: 10;
  border: 1px solid white;
}

.event-indicator-text {
  font-size: 20px;
  text-align: center;
}

.event-log {
  position: absolute;
  top: 30%;
  right: 3.5%;
  width: 280px;
  height: 300px;
  /* color: white; */
  z-index: 10;
}

.event-log-header {
  background-color: #333;
  color: white;
  padding: 10px;
  font-size: 24px;
  border: 1px solid white;
}

.event-log-body {
  padding: 10px;
  background-color: #333;
  border: 1px solid white;
  min-height: 300px;
  max-height: 300px;
  overflow-y: scroll;
}

.event-log-item {
  font-size: 20px;
}

</style>