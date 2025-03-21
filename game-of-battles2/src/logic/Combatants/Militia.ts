import { Combatant } from "../Combatant";
import { Damage, DamageType } from "../Damage";
import { Position } from "../Position";

export class Militia extends Combatant {
    constructor(name: string, position: Position) {
      super(
        name,
        {
          hp: 80,
          attackPower: 10,
          defensePower: 10,
          stamina: 20,
          initiative: 4,
          movementSpeed: 3,
          range: 1,
          agility: 8,
          luck: 3,
        },
        position,
        [], // No weaknesses
        [], // No resistances
        []  // No special moves
      );
    }
  
    basicAttack(target: Combatant): Damage {
      const damageAmount = Math.max(((this.stats.attackPower - target.stats.defensePower) * 0.01) + 20, 0); // Ensure damage is not negative
      return { amount: damageAmount, type: DamageType.Crush };
    }
  
    attackAndDamage(target: Combatant): void {
        if(this.calculateHitChance(target)){
            const damage = this.basicAttack(target);
            target.takeDamage(damage);
        }
  
        if(this.calculateFumble()){
            //apply negative effect to attacker.
        }
    }
  
    calculateHitChance(target: Combatant): boolean {
      const hitRoll = ((this.stats.agility - target.stats.agility) * 0.01) + Math.floor(Math.random() * 100) + 1;
  
      if (hitRoll < 20) {
        return false;
      } else if (hitRoll > 90) {
        return true;
      } else {
        return true;
      }
    }
  
    calculateFumble(): boolean {
        const fumbleRoll = Math.floor(Math.random() * 100) + 1;
        if (fumbleRoll < 5) {
            return true;
        }
        return false;
    }
  }