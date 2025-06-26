<template>
  <div v-if="!isNewSpriteType(combatant.getCombatantType())" :class="{'svg-sprite-container': true, 'white': combatant?.team.getIndex() === 0}">
    <img class="combatant-sprite" :src="spriteSource" alt="Combatant" />
  </div>

  <div v-else :class="{'sprite-container': true, 'black': combatant?.team.getIndex() === 1, 
  'witch': combatant.getCombatantType() === 'Witch',
  'ranger': combatant.getCombatantType() === 'Hunter',
  'vanguard': combatant.getCombatantType() === 'Vanguard',
  'defender': combatant.getCombatantType() === 'Defender',
  'wizard': combatant.getCombatantType() === 'Wizard',
  'rogue': combatant.getCombatantType() === 'Rogue',
  'fist-weaver': combatant.getCombatantType() === 'Fistweaver',
  'fool': combatant.getCombatantType() === 'Fool',
  'artificer': combatant.getCombatantType() === 'Artificer',
  'healer': combatant.getCombatantType() === 'Healer',
  'standard-bearer': combatant.getCombatantType() === 'Standard Bearer',
  'pikeman': combatant.getCombatantType() === 'Pikeman',
  }">

  </div>

</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { Combatant } from '../logic/Combatant';
import { CombatantType } from '../logic/Combatants/CombatantType';

export default defineComponent({
  name: 'CombatantSprite',
  props: {
    combatant: {
      type: Object as PropType<Combatant>,
      required: true
    }
  },
  setup(props) {
    const typeToSprite = (type: CombatantType) => {
      switch (type) {
        case CombatantType.Militia:
          return require('@/assets/Militia.svg');
        case CombatantType.Defender:
          return require('@/assets/Defender.svg');
        case CombatantType.Hunter:
          return require('@/assets/Hunter.svg');
        case CombatantType.Healer:
          return require('@/assets/Healer.svg');
        case CombatantType.Wizard:
          return require('@/assets/Wizard.svg');
        case CombatantType.StandardBearer:
          return require('@/assets/StandardBearer.svg');
        case CombatantType.Witch:
          return require('@/assets/Witch.svg');
        case CombatantType.Fool:
          return require('@/assets/Fool.svg');
        case CombatantType.Pikeman:
          return require('@/assets/Pikeman.svg');
        case CombatantType.Vanguard:
          return require('@/assets/Vanguard.svg');
        case CombatantType.FistWeaver:
          return require('@/assets/FistWeaver.svg');
        case CombatantType.Artificer:
          return require('@/assets/Artificer.svg');
        case CombatantType.Rogue:
          return require('@/assets/Rogue.svg');
        case CombatantType.Gorilla:
          return require('@/assets/Gorilla.svg');
        case CombatantType.Bomb:
          return require('@/assets/Bomb.svg');
        case CombatantType.Wall:
          return require('@/assets/Wall.svg');
        case CombatantType.Doll:
          return require('@/assets/Fool.svg');
        case CombatantType.BallistaTurret:
          return require('@/assets/Ballista.svg');
        case CombatantType.BabyBabel:
          return require('@/assets/Babel.svg');
      }
    };

    const spriteSource = computed(() => {
      return typeToSprite(props.combatant.getCombatantType());
    });

    const isNewSpriteType = (type: CombatantType) => {
      return [
        //CombatantType.Vanguard,
        CombatantType.Witch, CombatantType.Hunter, CombatantType.Vanguard, CombatantType.Defender, CombatantType.Healer,
        CombatantType.Wizard, CombatantType.Rogue, CombatantType.FistWeaver, CombatantType.Fool, CombatantType.Artificer,
        CombatantType.StandardBearer, CombatantType.Pikeman
      ].includes(type);
    };

    return {
      spriteSource,
      isNewSpriteType
    };
  }
});
</script>

<style scoped>

.svg-sprite-container {
    transform: scale(2);
}

.sprite-container {
    width: 50px;
    height: 60px;
    background-repeat: no-repeat;
    position: relative;
    overflow: visible;
    image-rendering: pixelated;
}

/*.sprite-container::after {
  content: '';
  position: absolute;
  bottom: 0px; 
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 8px;
  border-radius: 50%; 
  box-shadow: 0 0 8px 4px rgba(0, 0, 255, 0.7);
  z-index: 0;
  opacity: 0.8;
}

.sprite-container.white::after {
  box-shadow: 0 0 8px 4px rgba(255, 0, 0, 0.7);
}

.sprite-container.black::after {
  box-shadow: 0 0 8px 4px rgba(0, 0, 255, 0.7);
} */

.sprite-container.witch {
  background-position: -44px -39px;
  background-image: url('@/assets/CombatantModels/Witch_recolor.png');
  transform: scale(1.2);
}

.sprite-container.witch.black {
  background-position: -182px -39px;
}

.sprite-container.hunter {
  background-position: -24px -19px;
  transform: scale(1.7);
  background-image: url('@/assets/CombatantModels/Hunter1.png');
}

.sprite-container.ranger {
  background-position: -117px -72px;
  transform: scale(1.4);
  background-image: url('@/assets/CombatantModels/Hunter_recolor.png');
}

.sprite-container.ranger.black {
  background-position: -406px -72px;
  transform: scale(1.4);
  background-image: url('@/assets/CombatantModels/Hunter_recolor.png');
}



.sprite-container.vanguard {
  background-position: -41px -31px;
  background-image: url('@/assets/CombatantModels/Vanguard_recolor.png');
  transform: scale(1.4);
}

.sprite-container.vanguard.black {
  background-position: -170px -30px;
}

.sprite-container.defender {
  /* background-position: -40px -36px; */
  background-image: url('@/assets/CombatantModels/Defender_blue_p10.png');
  background-size: contain;
  background-position: 8px 4px;
  transform: scale(1.1);
  /* transform: scale(1.3); */
}

.sprite-container.defender.black {
  /* background-position: -40px -36px; */
  background-image: url('@/assets/CombatantModels/Defender_red_p10.png');
  background-size: contain;
  background-position: 8px 4px;
  transform: scale(1.1);
  /* transform: scale(1.3); */
}

.sprite-container.wizard.black {
  background-image: url('@/assets/CombatantModels/Wizard1.png');
  background-size: contain;
  transform: scale(1.2);
  background-position: 6px 3px;
}

.sprite-container.wizard {
  background-image: url('@/assets/CombatantModels/Wizard_resize_recolor.png');
  background-size: contain;
  background-position: 7px 1px;
  transform: scale(1.2);
}

.sprite-container.rogue {
  background-image: url('@/assets/CombatantModels/Rogue_recolor.png');
  background-position: -117px -74px;
  transform: scale(1.5);
}

.sprite-container.rogue.black {
  background-position: -407px -74px;
}

.sprite-container.fist-weaver {
  background-image: url('@/assets/CombatantModels/FistWeaver_recolor.png');
  background-position: -54px -24px;
  transform: scale(1.3);
}

.sprite-container.fist-weaver.black {
  background-position: -215px -24px;
}

.sprite-container.fool {
  background-image: url('@/assets/CombatantModels/Fool_blue_p10.png');
  background-size: contain;
  transform: scale(1.1) rotateY(180deg);
  background-position: 9px 3px;
}

.sprite-container.fool.black {
  background-image: url('@/assets/CombatantModels/Fool_red_p10.png');
  background-size: contain;
  transform: scale(1.1);
  background-position: 9px 3px;
}

.sprite-container.artificer {
  background-image: url('@/assets/CombatantModels/Artificer_blue.png');
  background-size: contain;
  transform: scale(1.2);
  background-position: 6px 3px;
}

.sprite-container.artificer.black {
  background-image: url('@/assets/CombatantModels/Artificer_red.png');
  background-size: contain;
  transform: scale(1.2);
  background-position: 6px 2px;
}

.sprite-container.healer {
  background-image: url('@/assets/CombatantModels/Healer_recolor.png');
  background-size: cover;
  transform: scale(1.1);
  background-position: -6px -2px;
}

.sprite-container.healer.black {
  background-position: -245px -2px;
}

.sprite-container.standard-bearer {
  background-image: url('@/assets/CombatantModels/captain_recolor.png');
  transform: scale(1.1);
  background-size: cover;
  background-position: -4px 0px;
}

.sprite-container.standard-bearer.black {
  background-image: url('@/assets/CombatantModels/captain_recolor.png');
  transform: scale(1.1);
  background-size: cover;
  background-position: -63px 0px;
}

.sprite-container.pikeman {
  background-image: url('@/assets/CombatantModels/Pikeman_blue_p10.png');
  background-size: contain;
  transform: scale(1.2) rotateY(180deg);
  background-position: 8px 2px;
}
.sprite-container.pikeman.black {
  background-image: url('@/assets/CombatantModels/Pikeman_red_p10.png');
  background-size: contain;
  transform: scale(1.2) rotateY(180deg);
  background-position: 8px 2px;
}



.svg-sprite-container .combatant-sprite {
  width: 15px;
  height: 15px;
}

.svg-sprite-container.white {
  filter: invert(1);
}
</style>
