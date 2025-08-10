<template>
  <div v-if="enemyPlaque" class="enemy-plaque" 
  :class="{'defeated': isDefeatdEnemy(enemyPlaque), 'enemy-plaque-easy': difficulty === 'Easy',
   'enemy-plaque-normal': difficulty === 'Normal',
    'enemy-plaque-hard': difficulty === 'Hard'
    }">
    <div class="enemy-icon">
        <div v-if="!enemyPlaque.combatant" class="enemy-letter">{{ getDifficultyLetter(difficulty, enemyPlaque) }}</div>
        <div v-else class="enemy-combatant-icon">
          <CombatantSprite :combatant="enemyPlaque.combatant" />
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Difficulty } from "../logic/Difficulty";
import CombatantSprite from './CombatantSprite.vue';
import { RunManager } from '../GameData/RunManager';

export default defineComponent({
  name: 'PyramidBlock',
  components: {
    CombatantSprite
  },
  props: {
    enemyPlaque: {
      type: Object as any,
      required: true
    },
    playerPlaqueCurrentLevel: {
      type: Number,
      required: true
    },
    difficulty: {
      type: String,
      required: true
    }
  },
  setup(props) {

    const getDifficultyLetter = (difficulty: Difficulty, enemy: any) => {
      if(enemy.isBoss) {
        return 'B';
      }

      if(enemy.isSecret) {
        return '?';
      }

      if(difficulty === 'Easy') {
        return 'E';
      }
      if(difficulty === 'Normal') {
        return 'N';
      }
      if(difficulty === 'Hard') {
        return 'H';
      }
    }

    const isDefeatdEnemy = (enemy: any) => {
      const runManager = RunManager.getInstance();
      const hasPerferctStreak = runManager.getHasPerferctStreak();
      return (!enemy.isSecret || hasPerferctStreak) && props.playerPlaqueCurrentLevel > enemy.level;
    }
    
    return {
      getDifficultyLetter,
      isDefeatdEnemy
    }
  }
});


</script>

<style scoped>

.enemy-plaque {
  position: absolute;
  width: 60px; /* Size of enemy plaque */
  height: 60px;
  background-color: rgba(0, 0, 0, 0.7); /* Dark, semi-transparent background */
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 25; /* Below player plaque, above pyramid */
  opacity: 1; /* Hidden by default */
  transition: opacity 0.3s ease-out;
  transform: translateY(-5px);
}

.enemy-plaque.defeated {
  background-image: url('../assets/Menus/plumMarble3.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.enemy-plaque.defeated .enemy-icon {
  background-image: url('../assets/Skull_and_crossbones.svg');
}

.enemy-plaque.defeated .enemy-combatant-icon {
  display: none;
}

.enemy-plaque.defeated .enemy-plaque-normal {
  border: 5px solid #5E3B68;
}

.enemy-plaque.defeated .enemy-letter {
  display: none;
}

.enemy-plaque.enemy-plaque-easy {
  border: 5px solid #2F4F4F;
}

.enemy-plaque.enemy-plaque-normal {
  border: 5px solid #5E3B68;
}

.enemy-plaque.enemy-plaque-hard {
  border: 5px solid darkred;
}

.enemy-plaque .enemy-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.enemy-plaque .enemy-icon .enemy-combatant-icon {
  width: 80%;
  height: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  transform: scale(0.85);
}

.enemy-plaque.enemy-plaque-easy:not(.defeated) .enemy-icon {
  background-image: url('../assets/Backgrounds/simpleLand5.png');
}

.enemy-plaque.enemy-plaque-normal:not(.defeated) .enemy-icon {
  background-image: url('../assets/Backgrounds/cave3.png');
}

.enemy-plaque.enemy-plaque-hard:not(.defeated) .enemy-icon {
  background-image: url('../assets/Backgrounds/temple10.png');
}

.enemy-plaque .enemy-letter {
  font-family: 'Metal Mania', sans-serif;
  font-size: 4em;
  text-align: center;
}

.enemy-plaque.enemy-plaque-easy .enemy-letter {
  color: #2F4F4F;
}

.enemy-plaque.enemy-plaque-normal .enemy-letter {
  color: #5E3B68;
}

.enemy-plaque.enemy-plaque-hard .enemy-letter {
  color: darkred;
}

</style>