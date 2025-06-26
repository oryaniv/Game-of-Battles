<template>
      <div class="turn-order-combatant-icon" 
      :class="{ white: isWhiteTeam, black: isBlackTeam }"
      :style="{ boxShadow: isCurrentCombatant ? '0 0 10px 5px rgba(0, 255, 0, 0.7)' : '' }">
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
      </div>
      <div class="dead-x" v-if="combatant.stats.hp <= 0">
        <img  src="../assets/X.svg" alt="Dead" />
      </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Combatant } from '../logic/Combatant';
import CombatantSprite from './CombatantSprite.vue';    

export default defineComponent({
  components: {
    CombatantSprite
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

    return {
      thisCombatant: props.combatant,
      isCurrentCombatant: props.currentCombatant?.name === props.combatant.name,
      isWhiteTeam: props.combatant.team.index === 0,
      isBlackTeam: props.combatant.team.index === 1,
      calcHealthFill,
      calcStaminaFill
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
  flex-direction: column;
}

.turn-order-combatant-icon.black {
  display: flex;
  flex-direction: column-reverse;
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

.dead-x {
  position: absolute;
  top: 0;
  left: -2px;
}


</style>