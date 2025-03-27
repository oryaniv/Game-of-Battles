import { ActionResult, AttackResult } from "./attackResult";
import { Board } from "./Board";
import { Combatant } from "./Combatant";
import { Damage, DamageReaction, DamageType } from "./Damage";
import { Position } from "./Position";


export class CombatMaster {

    executeAttack(attacker: Combatant, position: Position, board: Board): ActionResult {
        const target = board.getCombatantAtPosition(position);
        if(!target) {
            throw new Error("No target found");
        }

        if(target.isDefending()) {
            const baseDamage = this.calcaulateBaseDamage(attacker, target);
            const finalDamage = {amount: baseDamage.amount / 2, type: baseDamage.type};
            this.handleInjuryAilmentAndDeath(target, finalDamage.amount, board);
            return {
                attackResult: AttackResult.Hit,
                damage: {amount: baseDamage.amount / 2, type: baseDamage.type},
                cost: 1,
                reaction: DamageReaction.NONE
            };
        }

        const attackResult = this.calculateAttackRoll(attacker, target);
        if(attackResult === AttackResult.Hit || attackResult === AttackResult.CriticalHit){
            const baseDamage = this.calcaulateBaseDamage(attacker, target);
            const actionResult = this.finalizeDamage(target, baseDamage, attackResult);
            this.handleInjuryAilmentAndDeath(target, actionResult.damage.amount, board);
            return actionResult;
        }  

        return attackResult === AttackResult.Miss ? {
            attackResult: AttackResult.Miss,
            damage: {amount: 0, type: DamageType.Unstoppable},
            cost: 1,
            reaction: DamageReaction.NONE
        } : {
            attackResult: AttackResult.Fumble,
            damage: {amount: 0, type: DamageType.Unstoppable},
            cost: 2,
            reaction: DamageReaction.NONE
        };
    }

    calcaulateBaseDamage(attacker: Combatant, target: Combatant): Damage {
        const delta = attacker.stats.attackPower - target.stats.defensePower;
        const damage = attacker.basicAttack();
        return {amount: damage.amount * (delta * 0.01 + 1), type: damage.type};
    }

    finalizeDamage(target: Combatant, damage: Damage, attackResult: AttackResult) : ActionResult {
        const resistances = target.resistances;
        const damageType = damage.type;
        const reaction = resistances.find((r) => r.type === damageType)?.reaction || DamageReaction.NONE;
        let finalDamage = damage.amount;
        let cost = 1;

        if(reaction === DamageReaction.RESISTANCE) {
            finalDamage = damage.amount * 0.5;
        } else if(reaction === DamageReaction.IMMUNITY) {
            finalDamage = 0;
            cost = 2;
        } else if(reaction === DamageReaction.WEAKNESS) {
            finalDamage = damage.amount * 1.25;
            cost = 0.5;
        } 
        if(attackResult === AttackResult.CriticalHit && reaction !== DamageReaction.IMMUNITY) {
            finalDamage = damage.amount * 1.5;
            cost = Math.max(0.5, cost / 2);
        }

        finalDamage = Math.max(0, finalDamage);
        return {attackResult: attackResult, damage: {amount: finalDamage, type: damage.type}, cost: cost, reaction: reaction};
    }

    calculateAttackRoll(attacker: Combatant, target: Combatant): AttackResult {
        const hitRoll = ((attacker.stats.agility - target.stats.agility) * 0.01) + Math.floor(Math.random() * 100) + 1;
  
        if(hitRoll < 5) {
          return AttackResult.Fumble;
        }
        else if (hitRoll < 20) {
          return AttackResult.Miss;
        } else if (hitRoll > 90) {
          return AttackResult.CriticalHit;
        } else {
          return AttackResult.Hit;
        }
      }

      handleInjuryAilmentAndDeath(target: Combatant, finalDamage: number, board: Board) {
        target.stats.hp -= finalDamage;
        if(target.stats.hp <= 0) {
          target.stats.hp = 0;
        }
      }
    

}