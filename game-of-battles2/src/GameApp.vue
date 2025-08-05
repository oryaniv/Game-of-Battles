
<template>
  <div class="game-container" :class="{ 'game-over': startGameOverAnimation }">
    <button class="escape-menu-button" @click="showEscapeMenu">Menu</button>
    <EscMenu @esc-menu-dismissed="dismissEscapeMenu" @options-saved="onOptionsSaved" v-if="escapeMenuVisible" />
    <div class="board-frame" :class="getFrameClass()">
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
                    validForCheckStatus: isTargetValidForCheckStatus({ x: x - 1, y: y - 1 }),
                    'aoe-highlight': isAoeHighlighted({ x: x - 1, y: y - 1 }),
                    'strong-grid': !!showGridBars
           }"
          @click="performAction({ x: x - 1, y:  y - 1})"
          @mouseover="showAoe({ x: x - 1, y: y - 1 })"
          @mouseleave="hideAoe"
        >
          <!-- <div class="coordinates" style="font-size: 24px;">{{x -1}},{{y - 1}}</div> -->
          <div
            v-if="getCombatant({ x , y})"
            :class="{ dead: getCombatant({ x, y })?.stats.hp <= 0, 'active-combatant': isCurrentCombatant({ x, y }) }"
            class="combatant"
            :style="{ 
              color: teamColors[getCombatant({ x, y }).team.getIndex() === 0 ? 0 : 1],
              boxShadow: isCurrentCombatant({ x, y }) ? '0 0 10px 5px #CDAD00' : isCurrentSkillPartner(getCombatant({ x, y })) ? 'rgba(0, 255, 0, 0.7) 0px 0px 10px 5px' : '',
              
              animation: isCurrentCombatant({ x, y }) ? 'glow 2s infinite alternate' :  ''
              }"
            
          >
           <div class="health-stamina-bars">
            <div class="health-bar">
              <div class="health-fill" :style="calcHealthFill(getCombatant({ x, y }))"></div>
            </div>
            <div class="stamina-bar">
              <div class="stamina-fill" :style="calcStaminaFill(getCombatant({ x, y }))"></div>
            </div>
           </div>
            
            <CombatantSprite :combatant="getCombatant({ x, y })" />
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
                {{ getDamageEffectText(effect) }}
                <div v-if="effect.miss">Miss!</div>
                <div v-if="effect.fumble">Fumble!</div>
                <div v-if="effect.blocked">Blocked!</div>
                
              </div>
            </transition-group>
            <transition-group name="damage-svg" tag="div">
              <img
                v-if="getCombatantEffects({ x: x - 1, y: y - 1 }).length > 0 && getCombatantEffects({ x: x - 1, y: y - 1 })[0].damage !== ''"
                :key="getCombatantEffects({ x: x - 1, y: y - 1 })[0].id"
                :src="getActionEffectIcon(getCombatantEffects({ x: x - 1, y: y - 1 })[0])"
                class="damage-svg-icon"
              />
            </transition-group>
            <div class="status-effect-indicator-negative">
                <div
                  v-for="statusEffect in getCombatantStatusEffects({ x: x - 1, y: y - 1 }, 0)"
                  :key="statusEffect.name"
                  
                  :style="{ color: getStatusEffectColor(statusEffect.alignment) }"
                >
                  <!-- {{ getStatusEffectLetter(statusEffect.name) }} -->
                  <img class="status-effect-indicator-icon" :src="requireStatusEffectSvg(statusEffect.name)" alt="Status Effect" />
                </div>
            </div>
            <div class="status-effect-indicator-positive">
                <div
                  v-for="statusEffect in getCombatantStatusEffects({ x: x - 1, y: y - 1 }, 1)"
                  :key="statusEffect.name"
                  
                  :style="{ color: getStatusEffectColor(statusEffect.alignment) }"
                >
                  <!-- {{ getStatusEffectLetter(statusEffect.name) }} -->
                  <img class="status-effect-indicator-icon" :src="requireStatusEffectSvg(statusEffect.name)" alt="Status Effect" />
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
      <div  v-for="x in Math.floor(actionsRemaining)" class="turn-icon" :class="{ 'red': getCurrentTeamIndex() === 1 }" :key="x">
      </div>
      <div v-if="actionsRemaining !== Math.round(actionsRemaining)" class="half-turn-icon" :class="{ 'red': getCurrentTeamIndex() === 1 }" :key="x">
      </div>
    </div>

<div class="action-menu" v-if="showActionMenu() && !showHoveringMessage()">
  <div class="action-menu-button-container">
    <!-- Main central button (e.g., Attack or Use Skill) -->
    <button class="action-menu-main-button" @mouseover="actionButtonHover('examine')" @mouseleave="actionButtonHover('')" v-show="!actionSelected()" @click="showCombatantsForStatus">e<span class="action-menu-button-highlight">X</span>amine</button>

    <!-- Other action buttons, dynamically positioned -->

    <button :disabled="!canMove()" class="action-menu-sub-button" @mouseover="actionButtonHover('move')" @mouseleave="actionButtonHover('')" v-show="!actionSelected()" v-if="!hasMoved" @click="showMoveOptions"><span class="action-menu-button-highlight">M</span>ove</button>
    <button class="action-menu-sub-button" @mouseover="actionButtonHover('undo')" @mouseleave="actionButtonHover('')" v-show="!actionSelected()" v-if="hasMoved" @click="undoMove"><span class="action-menu-button-highlight">U</span>ndo</button>
    <button :disabled="!hasActiveSpecialMoves()" class="action-menu-sub-button" @mouseover="actionButtonHover('skill')" @mouseleave="actionButtonHover('')" v-show="!actionSelected()" @click="showSpecialSkills"><span class="action-menu-button-highlight">S</span>kill</button>
    <button :disabled="!hasAnyCoopMoves()" class="action-menu-sub-button" @mouseover="actionButtonHover('coop')" @mouseleave="actionButtonHover('')" v-show="!actionSelected()" @click="showCoopSkillMenu">Co <span class="action-menu-button-highlight">O</span>p</button>
    
    <button :disabled="!canDefend() || (hasMoved && !canDefendAndMove())" class="action-menu-sub-button" @mouseover="actionButtonHover('defend')" @mouseleave="actionButtonHover('')" v-show="!actionSelected()" @click="defend"><span class="action-menu-button-highlight">D</span>efend</button>
    <button class="action-menu-sub-button" @mouseover="actionButtonHover('skip')" @mouseleave="actionButtonHover('')" v-show="!actionSelected()" @click="skip">s<span class="action-menu-button-highlight">K</span>ip</button>
    
    <button class="action-menu-sub-button" @mouseover="actionButtonHover('cancel')" @mouseleave="actionButtonHover('')" v-show="actionSelected()" @click="cancel"><span class="action-menu-button-highlight">C</span>ancel</button>
    <button :disabled="!canAttack()" class="action-menu-sub-button" @mouseover="actionButtonHover('attack')" @mouseleave="actionButtonHover('')" v-show="!actionSelected()" @click="showAttackOptions"><span class="action-menu-button-highlight">A</span>ttack</button>
    <div class="action-menu-circle">
      <div class="action-menu-circle-inner"></div>
    </div>
  </div>
</div>

<button v-if="!isGameOver()" @click="playAiTurn(currentCombatant)">AI Play</button>
<!-- <button @click="showDialog = true">show dialog</button>
<button @click="changeDialog()">change dialog</button> -->

<div class="action-description-container" v-if="actionDescription">
  <div class="action-description-text">
    {{ actionDescription }}
  </div>
</div>
    


    <!-- Regular Skill Menu -->
    <div v-if="showSkillsMenu" class="skill-menu-frame">
       <div class="skill-menu">
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
              <span class="skill-icon">
                <div class="skill-icon-inner">
                 <img :src="getSkillEffectIcon(skill.name)" alt="Skill" /> 
                </div>
              </span>
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-cost">{{ skill.cost }} SP</span>
            </div>
          </div>
          <div v-if="selectedSkillDescription" class="skill-description">
            {{ selectedSkillDescription }}
          </div>
        </div>
    </div>

    <!-- Co-op Skill Menu -->
    <div v-if="showCoopSkill" class="skill-menu-frame">
      <div class="skill-menu coop-skill-menu">
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
            <span class="skill-icon">
                <div class="skill-icon-inner">
                 <img :src="getSkillEffectIcon(skill.move.name)" alt="Skill" /> 
                </div>
            </span>
            <span class="skill-name">{{ skill.move.name }}</span>
            <span class="skill-turn-cost">Actions: {{ skill.move.turnCost }}</span>
            <span class="skill-cost">{{ skill.move.cost }} SP</span>
          </div>
        </div>
        <div v-if="selectedCoopSkillDescription" class="skill-coop-description">
          <div class="partner-list">
            <div class="partner-list-header">Partners</div>
            <div class="partner-list-item-container">
              <div class="partner-list-item" v-for="partner in selectedCoopSkillPartners" :key="partner.name">
                <span class="partner-list-item-text">{{ partner.name }} - {{ partner.getCombatantType() }}</span>
              </div>
            </div>
          </div>
          <span class="skill-coop-description-text">{{ selectedCoopSkillDescription }}</span>
        </div>
        </div>
    </div>

  <!-- Turn Order: white team-->
  <div v-if="getWhiteTeamCombatants().length > 0" class="white-team-turn-order-container">
    <div v-for="combatant in getWhiteTeamCombatants()" :key="combatant.name" class="turn-order-item" :style="{ filter: getCurrentTeamIndex() === 3 ? 'blur(4px)' : '' }">
      <TurnOrderWidget :combatant="combatant" :currentCombatant="getCurrentCombatant()" />
    </div>
  </div>

  <!-- Turn Order: black team -->
  <div v-if="getBlackTeamCombatants().length > 0" class="black-team-turn-order-container" >
    <div v-for="combatant in getBlackTeamCombatants()" :key="combatant.name" class="turn-order-item" :style="{ filter: getCurrentTeamIndex() === 3 ? 'blur(4px)' : '' }">
      <TurnOrderWidget :combatant="combatant" :currentCombatant="getCurrentCombatant()" />
    </div>
  </div>

  <!-- Turn Event Message Box -->
  <div class="event-indicator-container" :class="{ 'show': getEvents().length > 0 }">
    <div class="event-indicator-text">
         <ActionEventMessage :message="getEvents().length > 0 ? getEvents()[getEvents().length - 1].messageBody : ''" 
         :actionPart="getEvents().length > 0 ? getEvents()[getEvents().length - 1].actionPart : ''" 
         :actionType="getEvents().length > 0 ? getEvents()[getEvents().length - 1].actionType : 5" />
    </div>
  </div>
  
  <div class="commentator-messages-container" v-if="!disableBattleComments">
    <CommentatorMessages :messages="commentatorMessages" />
  </div>

      <!-- Status Popup -->
    <div v-if="showStatusPopup" class="status-popup-frame">
     <div  class="status-popup">
      <div class="status-popup-header">
        {{ examinedCombatant?.name }} the {{ examinedCombatant?.getCombatantType() }}
      </div>
      <div class="status-popup-body">
        <div class="health-stamina-status-bars-container">
          <div class="health-status-bar-container">
             <div class="health-status-text">{{ Math.ceil(examinedCombatant?.stats.hp)}}/{{ Math.ceil(examinedCombatant?.baseStats.hp) }}</div>
             <div class="health-status-bar">
              <div class="bar-fill-health" :style="{ width: (examinedCombatant?.stats.hp / examinedCombatant?.baseStats.hp) * 100 + '%' }"></div>
             </div>
          </div>
          <div class="stamina-status-bar-container">
            <div class="stamina-status-text">{{ Math.ceil(examinedCombatant?.stats.stamina)}}/{{ Math.ceil(examinedCombatant?.baseStats.stamina) }}</div>
            <div class="stamina-status-bar">
              <div class="bar-fill-stamina" :style="{ width: (examinedCombatant?.stats.stamina / examinedCombatant?.baseStats.stamina) * 100 + '%' }"></div>
            </div>
          </div>
        </div>
        <div
          v-for="[statName, statValue] in filterNotRelevantStats(Object.entries(examinedCombatant?.stats))"
          :key="statName"
          class="stat-bar"
        >
          <span class="stat-name">{{ getStatUiName(statName) }}</span>
          <span
            class="stat-value"
            :style="{ color: 'white' }"
          >
            {{ statValue >= 0 ? Math.floor(statValue) : 0 }}
          </span>
          <div class="bar-container">
            <div v-if="statValue === examinedCombatant?.baseStats[statName]"
              class="bar-fill"
              :style="{ width: (statValue / getStatusScale(statName)) * 100 + '%' }"
            ></div>
            <div v-if="statValue < examinedCombatant?.baseStats[statName]"
              class="bar-fill-debuff"
              :style="{ width: (statValue / getStatusScale(statName)) * 100 + '%' }"
            ></div>
            <div v-if="statValue > examinedCombatant?.baseStats[statName]"
              class="bar-fill-buff"
              :style="{ width: (statValue / getStatusScale(statName)) * 100 + '%' }"
            ></div>
          </div>
        </div>
        <div class="damage-reactions-list">
          <div class="damage-reaction-header">Damage Reactions:</div>
          <div class="damage-reaction-item" v-for="(reaction, index) in examinedCombatant?.resistances" :key="index">
            <img class="damage-reaction-icon" :src="requireDamageSVG(reaction.type)" alt="Damage Reaction" />
            <span class="damage-reaction-text">{{ getShortDamageReactionText(reaction.reaction) }}</span>
          </div>
        </div>
        <div class="status-effects-header">Status Effects:</div>
        <div class="status-effects-list" :style="{ gap: getStatusEffectGap() }">
          <div
            v-for="(effect, index) in examinedCombatantStatuses"
            :key="effect.name"
            class="status-effect-item"
            :style="{ color: getStatusEffectColor(effect.type) }"
            @mouseover="showStatusEffectDescription(effect, index)"
            @mouseleave="hideStatusEffectDescription"
          >
            <StatusDescriptionBox v-if="statusDescriptionBox && statusDescriptionBoxIndex === index" :text="statusDescriptionBox" />
            <img class="status-effect-examine-icon" :src="requireStatusEffectSvg(effect.name)" alt="Status Effect" />
            <span class="status-effect-duration">
              <img v-if="effect.duration === Infinity" class="status-effect-duration-icon" src="@/assets/INFINITY.svg" alt="Infinity" />
              <span v-else>{{ Math.ceil(effect.duration) }}</span>
            </span>
          </div>
          <div v-if="examinedCombatant?.statusEffects.length === 0">
            None
          </div>
        </div>
      </div>
     </div>
    </div>

    <div class="hovering-message-container" :class="{ 'hovering-message-container-show': showHoveringMessage() }">
      <div class="hovering-message-text"
      :class="{
        'hovering-message-you-died': hoveringMessage === 'YOU DIED',
        'hovering-message-enemy-died': hoveringMessage === 'Enemy Died'
      }"
      >
        {{ hoveringMessage }}
      </div>
    </div>

    <GameMessagePopup v-if="showErrorPopup"
      :show="showErrorPopup"
      :title="popupTitle"
      :message="popupMessage"
      @dismissed="handlePopupDismissed"
    />

    <GameDialog v-if="showDialog"
      :dialog="currentDialog"
      @dialog-dismissed="handleDialogDismissed"
    />
  </div>

</template>

<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, onMounted, onUnmounted, computed, nextTick, getCurrentInstance } from 'vue';
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
import { StatusEffect, StatusEffectType, StatusEffectAlignment, StatusEffectApplication } from './logic/StatusEffect';
import { SimpleAIAgent } from './logic/AI/AIAgent';
import { DummyAIAgent, BunkerDummyAIAgent, ToddlerAIAgent, KidAIAgent, TeenagerAIAgent, RookieAIAgent } from './logic/AI/DeterministicAgents';
import { RandomAIAgent } from './logic/AI/HeuristicalAgents';
import { VeteranAIAgent } from './logic/AI/VeteranAIAgent';
import { Howl } from 'howler';
import { EventLogger } from './eventLogger';
import { AllOfThem, standardVsSetup, theATeam, theBTeam, allMilitiaSetup, theGorillaTeam,
 generateRandomTeam, generateCombatantIdenticalTeam, placeAllCombatants, debugSetupWhiteTeam,
  debugSetupBlackTeam, playGroundTeams} from './boardSetups';
 import { getGameResultMessage, getGameOverMessage, getTutorialCompleteMessage, getTutorialResultMessage } from './GameOverMessageProvider';
 import { getCommentatorMessage, CommentatorMessage } from './CommentatorMessageProvider';
 import { getActionEffectIcon, ActionEffect, requireDamageSVG, getSkillEffectIcon, getShortDamageReactionText,
  getActionDescription, getStatusEffectDescription, requireStatusEffectSvg, delay,
   statusNameToText, getGame, getRelevantDialogs, getStatusEffectIsVisible } from './UIUtils';
 import { Difficulty } from './GameOverMessageProvider';
 import { useRouter } from 'vue-router';
 import { RunManager, RunType } from './GameData/RunManager';
 import StatusDescriptionBox from './components/StatusDescriptionBox.vue';
 import ActionEventMessage from './components/ActionEventMessage.vue';
 import CommentatorMessages from './components/CommentatorMessages.vue';
 import CombatantSprite from './components/CombatantSprite.vue';
 import TurnOrderWidget from './components/TurnOrderWidget.vue';
 import GameMessagePopup from './components/GameMessagePopup.vue';
 import GameDialog from './components/GameDialog2.vue';
 import EscMenu from './components/EscMenu.vue';
 import {DialogMessage} from './UIUtils';
 import { getEmptyAsType } from './logic/LogicFlags';
 import { TutorialManager, DialogStep, StepMode, stepType } from './GameData/TutorialManager';
 import { OptionsManager } from './GameData/OptionsManager';

export default defineComponent({
  components: {
    StatusDescriptionBox,
    ActionEventMessage,
    CommentatorMessages,
    CombatantSprite,
    TurnOrderWidget,
    GameMessagePopup,
    GameDialog,
    EscMenu
  },
  setup() {
    const router = useRouter();
 
    const runManager = RunManager.getInstance();

    const gameObject = getGame();

    const board = ref(gameObject.board);
    const whiteTeam = ref(gameObject.teams[0]);
    const blackTeam = ref(gameObject.teams[1]);
    const teams = ref(gameObject.teams);
    const game = ref(gameObject);

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
    const statusMode = ref(false);
    const validAttacks = ref<Position[]>([]);
    const validTargetsForSkill = ref<Position[]>([]);
    const combatantsForStatus = ref<Combatant[]>([]);
    const examinedCombatant = ref<Combatant | null>(null);
    const statusDescriptionBox = ref<string | null>(null);
    const statusDescriptionBoxIndex = ref<number | null>(null);

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
    const actionDescription = ref<string | null>(null);
    const commentatorMessages = ref<CommentatorMessage[]>([]);

    const hoveringMessage = ref<string>('');

    const startGameOverAnimation = ref(false);

    const showErrorPopup = ref(false);
    const popupTitle = ref('');
    const popupMessage = ref('');

    const optionsManager = OptionsManager.getInstance();
    const soundOn = ref(optionsManager.getSoundOn());
    const showGridBars = ref(optionsManager.getShowGridBars());
    const disableBattleComments = ref(optionsManager.getDisableBattleComments());
    const disablePostBattleComments = ref(optionsManager.getDisablePostBattleComments());

    const getCombatantEffects = (position: Position) => {
      const key = `${position.x},${position.y}`;
      return damageEffects.value[key] || [];
    };

    const getDamageEffectText = (effect: ActionEffect) => {
      if(isNaN(effect.damage as number)) {
        return '';
      }
      return effect.damage;
    }

    onMounted(() => {
      updateTurnMessage();
      actionsRemaining.value = currentTeam.value.combatants.length;
      emitter.on('trigger-method', (actionResultData:any) => {
        applyAttackEffects(actionResultData, actionResultData.position);
      });

      emitter.on('play-move-sound', () => {
        playMoveSound();
      });

      emitter.on('change-team', () => {
        updateTurnMessage();
      });

      console.log('%c game app onMounted', 'color: blue; font-size: 16px; font-weight: bold;');
     

      document.addEventListener('keydown', (event) => {
        if(event.key === 'Escape') {
           escapeMenuVisible.value = !escapeMenuVisible.value;
           return;
        }

        if(!showActionMenu() || showHoveringMessage() || showErrorPopup.value) {
          return;
        }
        
        if(actionSelected()) {
          if(event.key.toLowerCase() === 'c' || event.key.toLowerCase() === 'ב') {
            cancel();
          }
        } else {
            switch (event.key.toLowerCase()) {
            case 's':
            case 'ד':
              if(hasActiveSpecialMoves()) {
                showSpecialSkills();
              }
              break;
            case 'a':
            case 'ש':
              if(canAttack()) {
                showAttackOptions();
              }
              break;
            case 'm':
            case 'צ':
              if (canMove()) {
                showMoveOptions();
              }
              break;
            case 'x':
            case 'ס':
              // showStatus();
              showCombatantsForStatus();
              break;
            case 'd':
            case 'ג':
              if(canDefend() && (!hasMoved.value || canDefendAndMove())) {
                defend();
              }
              break;
            case 'k':
            case 'ל':
              skip();
              break;
            case 'o':
            case 'ם':
              if(hasAnyCoopMoves()) {
                showCoopSkillMenu();
              }
              break;
            case 'u':
            case 'ן':
              undoMove();
              break;
          }
        }
      });

      setTimeout(() => {
        triggerDialog();
      }, 1000);
    });

    onUnmounted(() => {
      game.value.clear();
      game.value = getEmptyAsType<Game>();
    });

    const updateTurnMessage = () => {
      if(!game.value) {
        return;
      }

      if(isGameOver()) {
        updateHoveringMessage(getGameOverMessage(whiteTeam.value, blackTeam.value), false);
        endGame();
      } else {
        updateHoveringMessage(`${game.value.teams[(game.value as Game).getCurrentTeamIndex()].name}'s Turn`, true);
      }
    };

    

    const getWhiteTeamCombatants = () => {
      return whiteTeam.value.combatants.filter((combatant) => !combatant.isExpendable());
    }

    const getBlackTeamCombatants = () => {
      return blackTeam.value.combatants.filter((combatant) => !combatant.isExpendable());
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
      } else if (statusMode.value) {
        examineCombatant(position);
      }
      triggerDialog();
    }

    const showActionMenu = () => {
      if(!game.value) {
        return false;
      }

       if(isGameOver()) {
         return false;
       }
       const currentTeam = game.value.getCurrentTeam();
       if(!currentTeam.isHumanPlayerTeam()) {
         return false;
       }

       const currentCombatant = game.value.getCurrentCombatant();
       if(currentCombatant.getAiAgent() !== undefined) {
         return false;
       }
       return true;
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

      if(validMoves.value.length === 0) {
        showGameMessage('', 'No valid moves!');
        // alert("No valid moves");
        validMoves.value = [];
        moveMode.value = false;
        return;
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
      selectedCoopSkillPartners.value = null;
      validTargetsForSkill.value = [];
      currentSkill.value = null;
      aoePositions.value = [];
      statusMode.value = false;
      combatantsForStatus.value = [];
      showStatusPopup.value = false;
      examinedCombatant.value = null;
      statusDescriptionBox.value = null;
      statusDescriptionBoxIndex.value = null;
      examinedCombatantStatuses.value = [];
      selectedCoopSkillDescription.value = null;
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
      if(!currentCombatant.value) {
        return;
      }
      validAttacks.value = board.value.getValidAttacks(currentCombatant.value);
      attackMode.value = true;

      if(validAttacks.value.length === 0) {
        showGameMessage('', 'No valid targets in range!');
        // alert('No valid attacks');
        validAttacks.value = [];
        attackMode.value = false;
        return;
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
        applyCommentatorMessages([result], currentCombatant.value.team);
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
      const isNoneDamage = actionResult.damage.type === DamageType.None;
      const effect: ActionEffect = {
            id: Date.now(),
            damage: isMiss || isFumble  ? "" : Math.round(finalDamage),
            weak: isWeak,
            critical: isCritical,
            miss: isMiss,
            fumble: isFumble,
            blocked: isBlocked,
            color: getDamageColor(actionResult.damage.type),
            type: actionResult.damage.type,
            statusEffectType: actionResult.statusEffectType
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

    const applyCommentatorMessages = (actionResults: ActionResult[], team: Team) => {
      const messages = getCommentatorMessage(actionResults, team, board.value as Board);
      commentatorMessages.value = messages;
    }

    const playSound = (type: DamageType) => {
      const sound = actionSounds[type];
      if(sound) {
        sound.play();
      }
    }

    const actionSelected = (): boolean => {
      return moveMode.value || attackMode.value || skillMode.value || 
      coopSkillMode.value || showSkillsMenu.value || showCoopSkill.value || showStatusPopup.value || statusMode.value;
    }

    const actionButtonHover = (action: string) => {
      actionDescription.value = getActionDescription(action);
    }

    const canAttack = (): boolean => {
      const currentCombatant = game.value.getCurrentCombatant();
      return currentCombatant?.basicAttack().amount > 0;
    }

    const canMove = (): boolean => {  
      const currentCombatant = game.value.getCurrentCombatant();
      return currentCombatant?.stats.movementSpeed > 0 && !currentCombatant.hasMoved;
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
      if(eventLogBody) {
        eventLogBody.scrollTop = eventLogBody.scrollHeight;
      }
      if(isGameOver()) {
        updateTurnMessage();
        return;
      }

      // if the current combatant has an AI agent, let it play the turn
      const currentCombatant = game.value.getCurrentCombatant();
      const turnDelay = showHoveringMessage() ? 1500 : 1000;
      if(currentCombatant && currentCombatant.getAiAgent() !== undefined) {
        setTimeout(() => {
          playAiTurn(currentCombatant);
        }, turnDelay);
      }

      setTimeout(() => {
        triggerDialog();
      }, turnDelay);
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
      }, 1000);

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
        applyCommentatorMessages(aiActionResult, currentCombatant.team);
      } else {
        aiActionResult.position && applyAttackEffects(aiActionResult, aiActionResult.position);
        applyCommentatorMessages([aiActionResult], currentCombatant.team);
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
          return '#034703';
        case DamageType.Holy:
          return 'rgb(255, 255, 204)'; // Light yellow-white
        case DamageType.Dark:
          return '#C37FD7';
        case DamageType.Unstoppable:
          return 'black';
        case DamageType.Healing:
          return 'lightgreen';
        default:
          return 'white';
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

    const hasAnyCoopMoves = () => {
      return currentCombatant.value?.getSpecialMoves()
      .filter((move) => move.triggerType === SpecialMoveTriggerType.Cooperative).length > 0;
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

      if(!isSkillEnabled(skillName)) {
        showGameMessage('', 'You cannot use this skill!');
        selectedCoopSkillPartners.value = null;
        return;
      }

      showCoopSkill.value = false;
      coopSkillMode.value = true;
      currentSkill.value = skill;
      const range = skill.range;
      validTargetsForSkill.value = board.value.getValidTargetsForSkill(currentCombatant.value, range);
      if(validTargetsForSkill.value.length === 0) {
        showGameMessage('', 'No valid targets for this skill!');
        selectedCoopSkillPartners.value = null;
        validTargetsForSkill.value = [];
        coopSkillMode.value = false;
        return;
      }
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

      if(!isSkillEnabled(skillName)) {
        showGameMessage('', 'You cannot use this skill!');
        return;
      }

      showSkillsMenu.value = false;
      skillMode.value = true;
      currentSkill.value = skill;
      const range = skill.range;
      validTargetsForSkill.value = board.value.getValidTargetsForSkill(currentCombatant.value, range);      
      if(validTargetsForSkill.value.length === 0) {
        showGameMessage('', 'No valid targets for this skill!');
        validTargetsForSkill.value = [];
        skillMode.value = false;
        return;
      }
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
          if(actionResult.attackResult !== AttackResult.NotFound || actionResult.statusEffectType) {
            const applyPosition = actionResult.position || position;
            applyAttackEffects(actionResult, applyPosition);
          }
        });
        applyCommentatorMessages(actionResults, currentCombatant.value.team);
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
          if(actionResult.attackResult !== AttackResult.NotFound || actionResult.statusEffectType) {
            const applyPosition = actionResult.position || position;
            applyAttackEffects(actionResult, applyPosition);
          }
        });
        applyCommentatorMessages(actionResults, currentCombatant.value.team);
        coopSkillMode.value = false;
        validTargetsForSkill.value = [];
        aoePositions.value = [];
        selectedCoopSkillPartners.value = null;
        game.value.nextTurn();
        prepareNextTurn();
      }
    }

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

    const getStatusEffectGap = () => {
      if(examinedCombatantStatuses.value.length === 2) {
        return '20px';
      }
      if(examinedCombatantStatuses.value.length === 3) {
        return '15px';
      }
      if(examinedCombatantStatuses.value.length === 4) {
        return '10px';
      }
      if(examinedCombatantStatuses.value.length >= 5) {
        return '5px';
      }
      return '0px';
    }

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
      const combatant = board.value.getVisibleCombatantAtPosition({x: position.x -1, y: position.y - 1}, currentTeam.value.index);
      return combatant;
    };

    const getCombatantStatusEffects = (position: Position, alignment: StatusEffectAlignment): StatusEffect[] => {
      const combatant = board.value.getCombatantAtPosition(position);
      return combatant ? combatant.getStatusEffects().filter((statusEffect) => statusEffect.alignment === alignment) : [];
    };

    const isGameOver = () => {
      const isTutorial = runManager.getRunType() === RunType.TUTORIAL;
      return !isTutorial && game.value.isGameOver();
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
    const examinedCombatantStatuses = ref<StatusEffectApplication[]>([]);
    const hideStatusPopup = () => {
      showStatusPopup.value = false;
    };

    const examineCombatant = (position: Position) => {
      const combatant = board.value.getCombatantAtPosition(position);
      if(combatant) {
        combatantsForStatus.value = [];
        examinedCombatant.value = combatant;
        showStatusPopup.value = true;
        examinedCombatantStatuses.value = combatant.statusEffects.filter((effect) => getStatusEffectIsVisible(effect));
        statusMode.value = false;
      }
    }

    const filterNotRelevantStats = (stats: [string, number][]) => {
      return stats.filter(([statName]) => !['range','hp', 'stamina'].includes(statName));
    }

    const showCombatantsForStatus = () => {
      const allLivingNotEnemyCloakedCombatants = board.value.getAllCombatants()
                                            .filter((combatant) => !combatant.isKnockedOut())
                                            .filter((combatant) => !combatant.isCloaked() || 
                                            combatant.team.index === currentTeam.value.index);

      combatantsForStatus.value = allLivingNotEnemyCloakedCombatants;
      statusMode.value = true;
    }

    const isTargetValidForCheckStatus = (position: Position): boolean => {
      return combatantsForStatus.value.some(
        (target) => target.position.x === position.x && target.position.y === position.y
      );
    }

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
          return 150;
        case 'attackPower':
          return 120;
        case 'defensePower':
          return 120;
        case 'agility':
          return 20;
        case 'stamina':
          return 80;
        case 'movementSpeed':
          return 8;
        case 'initiative':
          return 10;
        case 'range':
          return 10;
        case 'luck':
          return 20;
      }
    }

    const getEvents = () => {
      return eventLogger.getEvents();
    }

    const showStatusEffectDescription = (effect: StatusEffectApplication, index: number) => {
      const statusEffectName = statusNameToText(effect.name);
      const statusEffectDescription = getStatusEffectDescription(effect);
      statusDescriptionBox.value = `${statusEffectName}: ${statusEffectDescription}`;
      statusDescriptionBoxIndex.value = index;
    }

    const hideStatusEffectDescription = () => {
      statusDescriptionBox.value = null;
      statusDescriptionBoxIndex.value = null;
    }

    const updateHoveringMessage = (message: string, shouldFadeOut: boolean = true) => {
      hoveringMessage.value = message;
      if(shouldFadeOut) {
        setTimeout(() => {
          hoveringMessage.value = '';
        }, 1000);
      }
      else {
        hoveringMessage.value = message;
      }
    }

    const showHoveringMessage = () => {
      return hoveringMessage.value !== '';
    }


    const getFrameClass = () => {
      const difficulty = runManager.getDifficulty();
      if(difficulty === Difficulty.EASY) {
        return 'forest';
      }
      else if(difficulty === Difficulty.MEDIUM) {
        return 'cave';
      }
      return 'temple';
    }

    const endTutorial = async (type: stepType) => {
      updateHoveringMessage(getTutorialCompleteMessage(type), false);
      const gameOverMessage = getTutorialResultMessage(type);
      await delay(1500);
      startGameOverAnimation.value = true;
      await delay(2500);
      router.push({
        name: 'PostMatch',
        state: {
          postMatchMessage: gameOverMessage,
          playerSurvived: type === stepType.COMPLETE
        }
      });
    }

    const endGame = async () => {
      const playerSurvived = !game.value.teams.find((team) => team.isHumanPlayerTeam())?.isDefeated();
      const gameOverMessage = getGameResultMessage(whiteTeam.value, blackTeam.value);
      await delay(1500);
      startGameOverAnimation.value = true;
      await delay(2500);
      router.push({
        name: 'PostMatch',
        state: {
          postMatchMessage: gameOverMessage,
          playerSurvived: playerSurvived
        }
      });
    }

     // --- Function to show the popup ---
    const showGameMessage = (title: string, message: string) => {
      popupTitle.value = title;
      popupMessage.value = message;
      showErrorPopup.value = true;
    };

    const handlePopupDismissed = () => {
      showErrorPopup.value = false;
    };

    const showDialog = ref(false);
    const currentDialog = ref<DialogStep>({ id: 0, text: [], trigger: () => false, mode: StepMode.CENTER, done: false, stepType: stepType.REGULAR });
    const relevantDialogs: DialogStep[] = getRelevantDialogs();
    
    const handleDialogDismissed = async () => {
      if(!currentDialog.value.done) {
        currentDialog.value.done = true;
        const shouldPrepeareNextTurn = currentDialog.value.after?.(game.value as Game, board.value as Board);
        if(shouldPrepeareNextTurn) {
          prepareNextTurn();
        }
      }
      currentDialog.value.done = true;
      showDialog.value = false;
      if(currentDialog.value.stepType === stepType.COMPLETE || currentDialog.value.stepType === stepType.FAIL) {
        endTutorial(currentDialog.value.stepType);
      }
      await nextTick();
      triggerDialog();
    };


    const triggerDialog = () => {
      
      const applicableDialogs = relevantDialogs.filter((dialog: DialogStep) => !dialog.done && 
      dialog.trigger(game.value as Game, board.value as Board, currentDialog.value));

      const dialog: DialogStep | undefined = applicableDialogs[applicableDialogs.length - 1];
      if(dialog && dialog.id !== currentDialog.value.id) {
        showDialog.value = false;
        currentDialog.value.done = true;
      }
      setTimeout(() => {
        if (dialog) {
          const before = dialog.before;
          if(before) {
            const shouldPrepeareNextTurn = before(game.value as Game, board.value as Board);
            if(shouldPrepeareNextTurn) {
              prepareNextTurn();
            }
          }
          currentDialog.value = dialog;
          showDialog.value = true;
       }
      }, 0);
    };
    

    const escapeMenuVisible = ref(false);

    const showEscapeMenu = () => {
      escapeMenuVisible.value = true;
    }

    const dismissEscapeMenu = () => {
      escapeMenuVisible.value = false;
    }

    const onOptionsSaved = () => {
      soundOn.value = optionsManager.getSoundOn();
      showGridBars.value = optionsManager.getShowGridBars();
      disableBattleComments.value = optionsManager.getDisableBattleComments();
      disablePostBattleComments.value = optionsManager.getDisablePostBattleComments();
    }

    return {
      board,
      teams,
      teamColors,
      getCombatant,
      isCurrentCombatant,
      actionsRemaining,
      turnMessage,
      showActionMenu,
      defend,
      skip,
      currentCombatant,
      canDefendAndMove,
      canDefend,
      canAttack,
      canMove,
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
      statusMode,
      showAttackOptions,
      isAttackValid,
      attackTarget,
      performAction,
      calcHealthFill,
      calcStaminaFill,
      getCombatantEffects,
      showSpecialSkills,
      showSkillsMenu,
      getCombatantSpecialMoves,
      getCombatantCoopMoves,
      hasActiveSpecialMoves,
      hasAnyCoopMoves,
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
      isAoeHighlighted,
      showAoe,
      hideAoe,
      requireDamageSVG,
      playAiTurn,
      getWhiteTeamCombatants,
      getBlackTeamCombatants,
      getCurrentCombatant,
      getCurrentTeamIndex,
      showStatusPopup,
      hideStatusPopup,
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
      isCurrentSkillPartner,
      actionSelected,
      actionButtonHover,
      actionDescription,
      isTargetValidForCheckStatus,
      showCombatantsForStatus,
      examinedCombatant,
      filterNotRelevantStats,
      showStatusEffectDescription,
      hideStatusEffectDescription,
      statusDescriptionBox,
      statusDescriptionBoxIndex,
      commentatorMessages,
      showHoveringMessage,
      hoveringMessage,
      getFrameClass,
      startGameOverAnimation,
      requireStatusEffectSvg,
      getShortDamageReactionText,
      getSkillEffectIcon,
      showErrorPopup,
      popupTitle,
      popupMessage,
      handlePopupDismissed,
      showDialog,
      currentDialog,
      handleDialogDismissed,
      getActionEffectIcon,
      getDamageEffectText,
      escapeMenuVisible,
      showEscapeMenu,
      dismissEscapeMenu,
      showGridBars,
      disableBattleComments,
      disablePostBattleComments,
      onOptionsSaved,
      getStatusEffectIsVisible,
      examinedCombatantStatuses,
      getStatusEffectGap
    };
  },
});
</script>

<style scoped>

@font-face {
  font-family: "CinzelDecorative-Regular";
  src: url("@/assets/fonts/CinzelDecorative-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "Lora-Regular";
  src: url("@/assets/fonts/Lora-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "Nosifer-Regular";
  src: url("@/assets/fonts/Nosifer-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "Creepster-Regular";
  src: url("@/assets/fonts/Creepster-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "MetalMania-Regular";
  src: url("@/assets/fonts/MetalMania-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}


@font-face {
  font-family: "Exo2-Regular";
  src: url("@/assets/fonts/Exo2-Regular.ttf") format("truetype");
  font-weight: bold;
  font-style: normal;
}



div {
  /* font-family: "EnchantedLand", Arial, sans-serif; */
  /* font-family: "Faustina-Regular"; */
  /*font-family: "Lora-Regular"; */
  font-family: "Exo2-Regular";
  /*font-family: "eurostile"; */
  color: white;
}

button {
  /* font-family: "Lora-Regular"; */
  /* font-family: "eurostile"; */
} 

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: opacity 2s ease-in-out;
}

.game-container.game-over {
  opacity: 0;
}

.team-turn-message {
  font-size: 28px;
  font-family: "CinzelDecorative-Regular";
}

.actions-remaining-label {
  font-size: 20px;
  display: inline-block;
  margin-right: 10px;
  vertical-align: super;
}

.combatant-sprite {
  width: 15px;
  height: 15px;
}

.sprite-container.white {
  /*filter: invert(1);*/
}

.turn-icon {
  width: 25px;
  height: 25px;
  background-image: url('./assets/ACHILLES.svg');
  background-size: cover;
  background-position: center;
  display: inline-block;
  margin-right: 3px;
}

.half-turn-icon {
  width: 25px;
  height: 25px;
  background-image: url('./assets/ACHILLES.svg');
  background-size: cover;
  background-position: center;
  display: inline-block;
  opacity: 0.5;
  margin-right: 3px;
}

.half-turn-icon.red, .turn-icon.red {
  filter: brightness(0) saturate(100%) invert(12%) sepia(78%) saturate(7500%) hue-rotate(9deg) brightness(93%) contrast(115%);
}

.round-count {
  font-size: 20px;
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
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 20px;
    z-index: 0;
    background-size: auto;
    background-position: center;
    background-repeat: no-repeat;
}

.board-frame.forest { 
  background-image: url('./assets/Frames/testFrame4.png');
}

.board-frame.cave {
  background-image: url('./assets/Frames/darkFrame4.png');
}

.board-frame.temple {
  background-image: url('./assets/Frames/templeFrame4.png');
}


.board-background {
  display: flex;
  width: 100%;
  height: 100%;
  background-size: contain;
  position: absolute;
  z-index: -1;
}

.forest .board-background {
  background-image: url('./assets/Backgrounds/simpleLand5.png');
}

.cave .board-background {
  background-image: url('./assets/Backgrounds/cave3.png');
}

.temple .board-background {
  background-image: url('./assets/Backgrounds/temple10.png');
  filter: brightness(1.3);
}

.panel {
  width: 70px;
  height: 70px;
  /*background-color: gray; */
  display: flex;
  justify-content: center;
  align-items: center;
  /* border: 1px solid black; */
  background-size: cover;
}

.forest .board .panel {
  border: 1px solid #9a7e35b8;
}

.cave .board .panel {
  border: 1px solid #00000059;
}

.temple .board .panel {
  border: 1px solid #641616a8;
}

.temple .board .panel.strong-grid, .cave .board .panel.strong-grid, .forest .board .panel.strong-grid {
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

.validForCheckStatus {
  background-color: #2f4f4f;
  cursor: help;
}


.combatant {
  /*transform: scale(2); */
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.3s ease-in-out, opacity 1.5s ease-out;
  position: relative;
}

.combatant.dead {
  opacity: 0;
}

.health-stamina-bars{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    z-index: 3;
    top: -5px;
}

.combatant:hover .health-bar, 
.combatant:hover .stamina-bar, 
.combatant.active-combatant .health-bar, 
.combatant.active-combatant .stamina-bar{
  height: 5px;
}

.health-bar{
    width: 65%;
    height: 2px;
    background-color: darkred;
    transition: all 0.3s ease-in-out;
}

.stamina-bar{
    width: 65%;
    height: 2px;
    background-color: darkblue;
    margin-bottom: 2px;
    transition: all 0.3s ease-in-out;
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
  top: 20px;
  transform: scale(2.5);
}

.actions {
  margin-top: 20px;
  font-size: 20px;
}

.action-menu {
  position: absolute;
  left: 11%;
  top: 30%;
}

.action-menu-button-container {
  /* Use flexbox to easily center the whole menu container */
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; /* Crucial for absolute positioning of sub-buttons */
  width: 200px; /* Adjust as needed for your menu's overall size */
  height: 200px; /* Make it a square to simplify radial calculations */
  margin: 20px auto; /* Center the container on the page */
  /* Remove gap, as we're positioning absolutely */
}

.action-menu-circle {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-image: url('./assets/Menus/plumMarble4.png');
    position: absolute;
    top: 33px;
    right: 68px;
    z-index: -1;

    box-shadow: 0 0 15px 3px rgba(255, 215, 0, 0.4); 
}

.action-menu-circle-inner {
  background-color: black;
  width: 90%; 
  height: 90%;
  border-radius: 50%;
}

.action-menu-main-button {
  /* Style for your central button */
  position: absolute; /* Ensures it's correctly positioned within the container */
  z-index: 2; /* Make sure it's above other buttons */
  /* Inherit general button styles from your existing CSS */
  /* Example size: */
  width: 110px;
  height: 40px;
  transform: translate(-66%, 98%);
  font-family: "Exo2-Regular";
  font-style: italic;
}

.action-menu-main-button .action-menu-button-highlight, .action-menu-sub-button .action-menu-button-highlight {
  /*color:#c79bf2;*/
  color: #C37FD7;
  font-size:24px;
  font-family: "Exo2-Regular";
  font-style: italic;
}

.action-menu-sub-button {
  /* Inherit general button styles from your existing CSS */
  position: absolute; /* Crucial for radial positioning */
  top: 50%; /* Start at the center vertically */
  left: 50%; /* Start at the center horizontally */
  transform-origin: 0 0; /* Set the rotation origin to the button's top-left corner */
  z-index: 1; /* Below the main button */
  
  /* Example size - adjust to fit your text */
  width: 110px;
  height: 35px; 
  font-family: "Exo2-Regular";
  font-style: italic;
}

/* Example for 8 buttons arranged in a circle */
/* Assuming all sub-buttons are present and visible */
.action-menu-sub-button:nth-child(2) { /* First sub-button (Defend) */
  transform: translate(-99%, -107%) rotate(0deg) translateX(80px) rotate(0deg); /* Adjust translateX for radius */
}
.action-menu-sub-button:nth-child(3) { /* Second sub-button (Move) */
  transform: translate(-76%, 59%) rotate(45deg) translateX(80px) rotate(-45deg);
}
.action-menu-sub-button:nth-child(4) { /* Third sub-button (Undo Move) */
  transform: translate(-114%, 140%) rotate(90deg) translateX(80px) rotate(-90deg);
}
.action-menu-sub-button:nth-child(5) { /* Fourth sub-button (Use Skill) */
  transform: translate(-151%, 59%) rotate(135deg) translateX(80px) rotate(-135deg);
}
.action-menu-sub-button:nth-child(6) { /* Fifth sub-button (Use Co-op Skill) */
  transform: translate(-132%, -105%) rotate(180deg) translateX(80px) rotate(-180deg);
}
.action-menu-sub-button:nth-child(7) { /* Sixth sub-button (Skip) */
  transform: translate(-66%, 190%) rotate(225deg) translateX(80px) rotate(-225deg);
  height: 40px;
}
.action-menu-sub-button:nth-child(8) { /* Seventh sub-button (Cancel) */
  transform: translate(-116%, -19%) rotate(270deg) translateX(80px) rotate(-270deg);
}
.action-menu-sub-button:nth-child(9) { /* Eighth sub-button (Status) */
  transform: translate(-100%, -50%) rotate(315deg) translateX(80px) rotate(-315deg);
}

.action-menu-button-container button {
  font-size: 20px;
  color: white;
  border-radius: 20px;

  background-color: #2F4F4F;

  border: none;

  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2),
    inset -1px -1px 2px rgba(0, 0, 0, 0.4),

    /* The "Golden" Border - this is the key change */
    0 0 0 2px #A17A50,
    0 0 0 3px #8B7355,

    /* Outer shadow for depth (from original) */
    3px 3px 6px rgba(0, 0, 0, 0.4);

  /* Optional: Add hover/active states for interactivity */
  transition: all 0.15s ease-in-out; /* Smooth transitions */
}



.action-menu-button-container button:hover {
  background-color: #3A5F5F;
  cursor: pointer;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.3),
    inset -1px -1px 2px rgba(0, 0, 0, 0.5),
    0 0 0 2px #FFD700,
    0 0 0 3px #CDAD00,
    5px 5px 10px rgba(0, 0, 0, 0.6);
}

.action-menu-button-container button:active {
  background-color: #2A4545;
  box-shadow:
    inset 0px 0px 5px rgba(0, 0, 0, 0.8),
    0 0 0 2px #A17A50,
    1px 1px 3px rgba(0, 0, 0, 0.3);
}


.action-description-container {
   left: 4.5%;
   position: absolute;
   top: 72%;
   text-align: center;
   width: 250px;
   border: none;
   transition: all 0.3s ease;

   background-image: radial-gradient(circle at center,
                       rgba(30, 0, 40, 0.9) 0%,
                       rgba(30, 0, 40, 0.7) 60%,
                       rgba(30, 0, 40, 0) 100%
                     );
   background-color: transparent;

   padding: 15px 20px;
   border-radius: 20px;

   box-shadow:
     0 0 15px 5px rgba(245, 232, 210, 0.6),
     0 0 25px 8px rgba(245, 232, 210, 0.4) inset;

   z-index: 10;
}

.action-description-text {
  font-size: 15px;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  transition: all 0.3s ease;
}

.action-menu-button-container button:disabled {
  background-color: gray;
  color: #a7a0a0;
}

.action-menu-button-container button:disabled:hover {
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2),
    inset -1px -1px 2px rgba(0, 0, 0, 0.4),

    /* The "Golden" Border - this is the key change */
    0 0 0 2px #A17A50,
    0 0 0 3px #8B7355,

    /* Outer shadow for depth (from original) */
    3px 3px 6px rgba(0, 0, 0, 0.4);
  cursor: not-allowed;
}

.action-menu-button-container button:disabled .action-menu-button-highlight {
  color: #a7a0a0;
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
  font-size: 20px;
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

.skill-menu-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-image: url('./assets/Frames/menuFrame3.png');
  padding: 15px;
  background-size: cover;
  background-position: center;
}

.skill-menu {
  border-radius: 15px;
  width: 400px;
  height: 450px;
  /* background: linear-gradient(to bottom, #000000, #5E3B68); */
  background-image: url('./assets/Menus/plumMarble4.png');
  background-size: contain;
  /* background-repeat: round; */
  /* border: 1px solid white; */
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
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.skill-menu-header-name {
  font-size: 18px;
  font-weight: bold;
  display: inline-block;
}

.skill-menu-header-sp-remaining {
  font-size: 16px;
  display: inline-block;
  float: right;
}

.skill-menu-body {
  flex: 1;
  overflow-y: auto;
}

.skill-icon {
  width: 20px; /* Increased size slightly for better icon visibility and glow */
  height: 20px; /* Keep it square */
  
  /* Change background to very dark, near-black */
  background-color: rgba(0, 0, 0, 0.8); /* Very dark, 80% opaque black */
  /* You could also use a very dark solid color like #1A1A1A if you prefer no transparency */

  border-radius: 8px; /* Slightly more rounded corners for the plaque */
  
  /* Keep the existing gold border */
  border: 2px solid #A17A50; /* Gold/bronze accent border */
  
  padding: 5px; /* Padding inside the box around the icon */
  display: flex;
  justify-content: center; /* Center the icon horizontally */
  align-items: center; /* Center the icon vertically */
  align-self: center; /* Center the box itself if flex-direction: column on parent */

  /* Add the dynamic inner glow */
  /* The --icon-glow-color will be set via Vue's :style binding */
  box-shadow: 
    inset 0 0 10px 3px var(--icon-glow-color, rgba(255, 255, 255, 0.3)), /* Icon-colored inner glow */
    0 0 5px rgba(0, 0, 0, 0.3); /* Subtle outer shadow for depth */
  
  transition: box-shadow 0.2s ease-out, background-color 0.2s ease-out; /* Smooth transitions */
}

.skill-icon-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.skill-icon-inner img {
  width: 100%;
  height: 100%;
}

.skill-item {
  font-size: 16px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #555;
  cursor: pointer;
  gap: 1em;
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
  
}

.skill-cost {
  width: 40px;
  text-align: right;
}

.disabled {
  color: #888;
  cursor: not-allowed;
}

.skill-description, .skill-coop-description {
  font-size: 14px;
  padding: 10px;
  border-top: 2px solid white;
  text-align: center;
}

.skill-coop-description {
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 0px;
}

.skill-coop-description-text {
  margin-top: 10px;
  display: block;
  padding: 0 5px 0 5px;
}

.partner-list {
  border-bottom: 1px solid white;
}


.partner-list-header {
  font-size: 24px;
}   

.partner-list-item-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 10px;
    margin-top: 5px;
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
  top: -2%;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  gap: 0px;
  max-height: 68px;
  overflow-y: hidden;
  /* Add more styling as needed */
}

.status-effect-indicator-positive .status-effect-indicator-icon,
.status-effect-indicator-negative .status-effect-indicator-icon {
  transform: scale(1);
  width: 20px;
  height: 20px;
}

.status-effect-indicator-positive {
  left: -20%;
}

.status-effect-indicator-negative {
  right: -20%;
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
  transform: scale(2) translate(-5px, 10px);
}

.white-team-turn-order-container, .black-team-turn-order-container {
    display: flex;
    max-width: 335px;
    gap: 5px;
}

.white-team-turn-order-container {
  flex-wrap: wrap;
}

.black-team-turn-order-container {
  flex-wrap: wrap-reverse;
}

.turn-order-item {
  position: relative;
  margin: 5px;
  text-align: center;
  border: none;
  transition: all 0.3s ease;

   background-image: radial-gradient(circle at center,
                       rgba(30, 0, 40, 0.9) 0%,
                       rgba(30, 0, 40, 0.7) 60%,
                       rgba(30, 0, 40, 0) 100%
                     );
   background-color: transparent;

   border-radius: 0px;

   box-shadow: 
     0 0 15px 5px rgba(245, 232, 210, 0.6),
     0 0 25px 8px rgba(245, 232, 210, 0.4) inset;
}

.dead-x {
  position: absolute;
  top: 0;
  left: 0;
}

.white-team-turn-order-container .turn-order-item {
  background-image: radial-gradient(circle at center,
                       rgba(0, 0, 139, 0.9) 0%,
                       rgba(0, 0, 139, 0.7) 60%,
                       rgba(0, 0, 139, 0) 100%
                     );
}

.black-team-turn-order-container .turn-order-item {
   background-image: radial-gradient(circle at center,
                       rgba(139, 0, 0, 0.9) 0%,
                       rgba(139, 0, 0, 0.7) 60%,
                       rgba(139, 0, 0, 0) 100%
                     );
}


.black-team-turn-order-container {
  position: absolute;
  top: 0;
  right: 2%;
  
}

.white-team-turn-order-container {
  position: absolute;
  bottom: 0;
  right: 2%;
  
}



.turn-order-combatant-icon .sprite-container {
  text-align: center;
}

.status-popup-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-image: url('./assets/Frames/menuFrame3.png');
  padding: 15px;
  background-size: cover;
  background-position: center;
}

.status-popup {
  width: 300px;
  padding: 20px;
  background-image: url('./assets/Menus/plumMarble4.png');
  background-size: contain;
  color: white;
  z-index: 10;
  display: flex;
  flex-direction: column;
  border-radius: 15px;
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

.bar-fill-health {
  height: 100%;
  background-color: red;
  border-radius: 5px;
  position: absolute;
  z-index: 2;
}

.bar-fill-stamina {
  height: 100%;
  background-color: blue;
  border-radius: 5px;
  position: absolute;
  z-index: 2;
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
  background-color: #42A5F5;
  border-radius: 5px;
  position: absolute;
  z-index: 1;
}


.status-effects-header {
  font-weight: bold;
  margin: 20px 0 10px 0;
}

.status-effects-list {
  margin: 15px 0 0 0px;
  display: flex;
  flex-wrap: wrap;
  justify-content: normal;
}

.status-effect-item {
  margin-bottom: 5px;
  display: inline-flex;
  flex-direction: column;
  column-gap: 1.3em;
}

.status-effect-duration {
  font-size: 12px;
  text-align: center;
  margin-top: 5px;
  font-weight: bold;
}

.status-effect-examine-icon {
  width: 40px; /* Increased size slightly for better icon visibility and glow */
  height: 40px; /* Keep it square */
  
  /* Change background to very dark, near-black */
  background-color: rgba(0, 0, 0, 0.8); /* Very dark, 80% opaque black */
  /* You could also use a very dark solid color like #1A1A1A if you prefer no transparency */

  border-radius: 8px; /* Slightly more rounded corners for the plaque */
  
  /* Keep the existing gold border */
  border: 2px solid #A17A50; /* Gold/bronze accent border */
  
  padding: 5px; /* Padding inside the box around the icon */
  display: flex;
  justify-content: center; /* Center the icon horizontally */
  align-items: center; /* Center the icon vertically */
  align-self: center; /* Center the box itself if flex-direction: column on parent */

  /* Add the dynamic inner glow */
  /* The --icon-glow-color will be set via Vue's :style binding */
  box-shadow: 
    inset 0 0 10px 3px var(--icon-glow-color, rgba(255, 255, 255, 0.3)), /* Icon-colored inner glow */
    0 0 5px rgba(0, 0, 0, 0.3); /* Subtle outer shadow for depth */
  
  transition: box-shadow 0.2s ease-out, background-color 0.2s ease-out; /* Smooth transitions */
}

.status-effect-examine-icon:hover {
  background-color: rgba(26, 26, 26, 0.9); /* Slightly lighter on hover */
  box-shadow: 
    inset 0 0 15px 5px var(--icon-glow-color, rgba(255, 255, 255, 0.5)), /* Stronger glow on hover */
    0 0 8px rgba(0, 0, 0, 0.5); /* Stronger outer shadow on hover */
}

.status-popup-close {
  margin-top: 20px;
  text-align: center;
}

.health-stamina-status-bars-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
}

.health-status-bar-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow: hidden;
  position: relative;
}

.stamina-status-bar-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow: hidden;
  position: relative;
}

.health-status-text {
  font-size: 12px;
  text-align: center;
}

.health-status-bar {
  width: 100%;
  height: 10px;
  background-color: #555;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.stamina-status-text {
  font-size: 12px;
  text-align: center;
}

.stamina-status-bar {
  width: 100%;
  height: 10px;
  background-color: #555;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.damage-reactions-list {
  margin-top: 30px;
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
  transform: scale(1.5);
}

.damage-reaction-text {
  font-size: 10px;
}

.event-indicator-container {
  position: absolute;
  top: 22%;
  right: 3.5%;
  width: 240px;
  height: 30px;
  z-index: 10;
  border: none;
  transition: all 0.6s ease;

   background-image: radial-gradient(circle at center,
                       rgba(30, 0, 40, 0.9) 0%,
                       rgba(30, 0, 40, 0.7) 60%,
                       rgba(30, 0, 40, 0) 100%
                     );
   background-color: transparent;

   padding: 15px 20px;
   border-radius: 0px;

   box-shadow: 
     0 0 15px 5px rgba(245, 232, 210, 0.6),
     0 0 25px 8px rgba(245, 232, 210, 0.4) inset;

   opacity: 0;
   transform: translateX(20px);
}

.event-indicator-container.show {
   opacity: 1;
   transform: translateX(0px);
}

.event-indicator-text {
  font-size: 18px;
  text-align: center;
}

.commentator-messages-container {
  position: absolute;
  top: 35%;
  right: 3.5%;
  width: 250px;
  height: 30px;
}

.hovering-message-container {
  position: absolute;
  top: 40%;
  background-color: #00000082;
  width: 100vw;
  height: 100px;
  z-index: -1;
  border: 1px solid white;
  display: flex;
  /* display: none; */
  align-items: center;
  justify-content: center; 
  transition: all 1s ease;
  opacity: 0;
}

.hovering-message-container-show {
  opacity: 1;
  z-index: 20;
}

.hovering-message-text {
  font-size: 32px;
  text-align: center;
  font-family: "CinzelDecorative-Regular";
  color: white;
}

.hovering-message-text.hovering-message-you-died {
  font-size: 6em;
  font-family: "MetalMania-Regular";
  color: darkred;
}

.hovering-message-text.hovering-message-enemy-died {
  font-size: 4em;
  font-family: "CinzelDecorative-Regular";
  color: gold;
}

.escape-menu-button {
  position: absolute;
  top: 5px;
  left: 2px;
  z-index: 100;

  font-family: 'Exo 2', sans-serif;
  font-size: 1em; /* Slightly smaller font for arc placement */
  font-weight: bold;
  color: white;
  text-align: center;
  padding: 3px 10px; /* Adjusted padding */
  border-radius: 0px;
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

.escape-menu-button:hover {
  background-color: #3A5F5F;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.2),
    inset -1px -1px 2px rgba(0, 0, 0, 0.4),
    0 0 0 2px #FFD700,
    0 0 0 3px #CDAD00,
    5px 5px 10px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px); /* Maintain lift on hover */
}

</style>