<template>
      <div class="turn-order-combatant-icon" 
      :class="{ white: isWhiteTeam, black: isBlackTeam }"
      :style="{ boxShadow: isCurrentCombatant ? '0 0 10px 5px  #CDAD00' : '' }">
        <CombatantSprite :combatant="thisCombatant" />
        <div class="turn-order-combatant-name">{{ combatant.name }}</div>
        <div class="health-stamina-bars">
            <div class="health-bar">
              <div class="health-fill" :style="calcHealthFill(thisCombatant)"></div>
            </div>
            <div class="stamina-bar">
              <div class="stamina-fill" :style="calcStaminaFill(thisCombatant)"></div>
            </div>
        </div>
        <div class="status-effects-container">
          <div class="status-effect-none" v-if="filterPassiveStatusEffects(thisCombatant.getStatusEffects()).length === 0">
            None
          </div>
          <div class="status-effect-item" 
          :class="getIconSizeClass(filterPassiveStatusEffects(thisCombatant.getStatusEffects()).length)"
          v-for="(statusEffect, index) in filterPassiveStatusEffects(thisCombatant.getStatusEffects())" :key="statusEffect.name"
          @mouseover="showStatusEffectDescription(statusEffect, index)"
          @mouseleave="hideStatusEffectDescription"
          >
            <img :src="requireStatusEffectSvg(statusEffect.name)" alt="Status Effect" />
          </div>
          <StatusDescriptionBox v-if="statusDescriptionBox" :text="statusDescriptionBox" />
        </div>
      </div>
      <div class="dead-x" v-if="combatant.stats.hp <= 0">
        <img  src="../assets/X.svg" alt="Dead" />
      </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue';
import { Combatant } from '../logic/Combatant';
import { StatusEffectApplication, StatusEffectAlignment, StatusEffect } from '../logic/StatusEffect';
import CombatantSprite from './CombatantSprite.vue';   
import StatusDescriptionBox from './StatusDescriptionBox.vue';
import { requireStatusEffectSvg, statusNameToText } from '../UIUtils';

export default defineComponent({
  components: {
    CombatantSprite,
    StatusDescriptionBox
  },
  props: {
    combatant: {
      type: Object as PropType<Combatant>,
      required: true
    },
    currentCombatant: {
      type: Object as PropType<Combatant>,
      required: true
    }
  },
  setup(props) {

    const calcHealthFill = (combatant: Combatant) => {
      return { width: (combatant.stats.hp / combatant.baseStats.hp) * 100 + '%' };
    };

    const calcStaminaFill = (combatant: Combatant) => {
      return { width: (combatant.stats.stamina / combatant.baseStats.stamina) * 100 + '%' };
    };

    const statusDescriptionBox = ref<string | null>(null);
    const statusDescriptionBoxIndex = ref<number | null>(null);

    const showStatusEffectDescription = (effect: StatusEffectApplication, index: number) => {
      const statusEffectName = statusNameToText(effect.name);
      statusDescriptionBox.value = statusEffectName;
      statusDescriptionBoxIndex.value = index;
    }

    const hideStatusEffectDescription = () => {
      statusDescriptionBox.value = null;
      statusDescriptionBoxIndex.value = null;
    }

    const filterPassiveStatusEffects = (statusEffects: StatusEffect[]) => {
      return statusEffects.filter(statusEffect => statusEffect.alignment !== StatusEffectAlignment.Neutral && statusEffect.alignment !== StatusEffectAlignment.Permanent);
    }

    const getIconSizeClass = (statusEffectsLength: number) => {
      if(statusEffectsLength <= 4) {
        return 'item-m';
      } else {
        return 'item-s';
      }
    }

    const checkCurrentCombatant = computed(() => props.currentCombatant?.name === props.combatant.name);

    return {
      thisCombatant: props.combatant,
      isCurrentCombatant: checkCurrentCombatant,
      isWhiteTeam: props.combatant.team.index === 0,
      isBlackTeam: props.combatant.team.index === 1,
      calcHealthFill,
      calcStaminaFill,
      requireStatusEffectSvg,
      statusDescriptionBox,
      statusDescriptionBoxIndex,
      showStatusEffectDescription,
      hideStatusEffectDescription,
      filterPassiveStatusEffects,
      getIconSizeClass
    }
  } 
});
</script>

<style scoped>
.turn-order-combatant-icon .sprite-container{
  transform: scale(0.9) !important;
}

.turn-order-combatant-icon.white {
  display: flex;
  flex-direction: column-reverse;
}

.turn-order-combatant-icon.black {
  display: flex;
  flex-direction: column;
}

.turn-order-combatant-name {
  font-size: 10px;
  max-width: 45px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
  text-align: center;
}

.health-stamina-bars{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 3;
}

.combatant:hover .health-bar, 
.combatant:hover .stamina-bar, 
.combatant.active-combatant .health-bar, 
.combatant.active-combatant .stamina-bar{
  height: 5px;
}

.health-bar{
    width: 90%;
    height: 6px;
    background-color: darkred;
    transition: all 0.3s ease-in-out;
}

.stamina-bar{
    width: 90%;
    height: 6px;
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

.turn-order-combatant-icon .status-effect-none {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.turn-order-combatant-icon .status-effects-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-width: 52px;
  /* margin-bottom: 5px; */

    /* --- CRITICAL CHANGES HERE --- */
  height: 50px; /* Fixed height for the status effect display area */
  overflow-y: auto; /* Enable vertical scrolling if more than 2 rows of icons */
  overflow-x: hidden; /* Hide horizontal overflow */
  /*padding-right: 5px;  Add some padding for scrollbar if it appears */
}

.turn-order-combatant-icon .status-effects-container .status-effect-item {
  border-radius: 2px;
  background-color: rgba(0, 0, 0, 0.8);
  border: 1px solid #A17A50;
  box-shadow: 
    inset 0 0 10px 3px var(--icon-glow-color, rgba(255, 255, 255, 0.3)), /* Icon-colored inner glow */
    0 0 5px rgba(0, 0, 0, 0.3); /* Subtle outer shadow for depth */
  display: flex;
}

.turn-order-combatant-icon .status-effects-container .status-effect-item.item-s {
  width: 15px;
  height: 15px;
  transform: scale(0.75);
}

.turn-order-combatant-icon .status-effects-container .status-effect-item.item-m {
  width: 20px;
  height: 20px;
  transform: scale(1);
  margin-left: 1px;
  border: 2px solid #A17A50;
  margin-left: 1px;
}

.status-effect-item.item-l {
  width: 25px;
  height: 25px;
  transform: scale(1.25);
}


.dead-x {
  position: absolute;
  top: 0;
  left: -2px;
}

.black-team-turn-order-container .dead-x{
  bottom: 0;
  top: auto;
}

</style>