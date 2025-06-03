import { ActionResult, AttackResult, getStandardActionResult } from "./attackResult";
import { Board } from "./Board";
import { Combatant } from "./Combatant";
import { Damage, DamageReaction, DamageType } from "./Damage";
import { Position } from "./Position";
import { getResultsForStatusEffectHook, StatusEffect, StatusEffectHook, StatusEffectType } from "./StatusEffect";


export class CombatMaster {
    private static instance: CombatMaster;

    private constructor() {}

    public static getInstance(): CombatMaster {
        if (!CombatMaster.instance) {
            CombatMaster.instance = new CombatMaster();
        }
        return CombatMaster.instance;
    }

    executeAttack(attacker: Combatant, position: Position, board: Board, damage?: Damage, allowEmptyTarget: boolean = false, turnCost: number = 1): ActionResult {
        const result = this.executeAttackInner(attacker, position, board, damage, allowEmptyTarget, turnCost);
        getResultsForStatusEffectHook(attacker, StatusEffectHook.OnAfterAttacking);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
          getResultsForStatusEffectHook(attacker, StatusEffectHook.OnInflictingDamage, attacker,result.damage, 1);
        }
        return result;
    }

    private executeAttackInner(attacker: Combatant, position: Position, board: Board, damage?: Damage, allowEmptyTarget: boolean = false, turnCost: number = 1): ActionResult {
        const target = board.getCombatantAtPosition(position);

        if(!target) {
          if(allowEmptyTarget) {
            return getStandardActionResult(position, turnCost);
          } else {
            throw new Error("No target found");
          }
        }
      
        getResultsForStatusEffectHook(attacker, StatusEffectHook.OnAttacking);

        damage = damage || attacker.basicAttack();

        const onBeingAttackedHookResult = this.getOnBeingAttackedHookResults(target, attacker, damage, board);
        if(onBeingAttackedHookResult) {
            return onBeingAttackedHookResult;
        }

        if(target.isDefending()) {
          const resistances = target.resistances;
          const damageType = damage.type;
          let cost = turnCost;
          const baseDamage = this.calcaulateBaseDamage(attacker, target, damage);
          const finalDamage = {amount: baseDamage.amount / 2, type: baseDamage.type};
          const reaction: DamageReaction = resistances.find((r) => r.type === damageType)?.reaction || DamageReaction.NONE;
          if(reaction === DamageReaction.RESISTANCE) {
            finalDamage.amount = finalDamage.amount * 0.5;
          } else if(reaction === DamageReaction.IMMUNITY) {
              finalDamage.amount = 0;
              cost *= 2;
          } 
          this.handleInjuryAilmentAndDeath(target, finalDamage, attacker, board);
          return {
              attackResult: AttackResult.Hit,
              damage: {amount: finalDamage.amount, type: finalDamage.type},
              cost: cost,
              reaction: (reaction === DamageReaction.RESISTANCE || reaction === DamageReaction.IMMUNITY) ? reaction : DamageReaction.NONE,
              position: position
          };
        }

        const attackResult = this.calculateAttackRoll(attacker, target);
        if(attackResult === AttackResult.Hit || attackResult === AttackResult.CriticalHit){
            const baseDamage = this.calcaulateBaseDamage(attacker, target, damage);
            const actionResult = this.finalizeDamage(target, baseDamage, attackResult, position, turnCost);
            this.handleInjuryAilmentAndDeath(target, actionResult.damage, attacker, board);
            return actionResult;
        }  

        getResultsForStatusEffectHook(target, StatusEffectHook.OnBeingMissed, attacker, undefined, undefined, board);

        return attackResult === AttackResult.Miss ? {
            attackResult: AttackResult.Miss,
            damage: {amount: 0, type: DamageType.Unstoppable},
            cost: turnCost,
            reaction: DamageReaction.NONE,
            position: position
        } : {
            attackResult: AttackResult.Fumble,
            damage: {amount: 0, type: DamageType.Unstoppable},
            cost: turnCost * 2,
            reaction: DamageReaction.NONE,
            position: position
        };
    }


    public tryInflictStatusEffect(afflictor: Combatant, target: Position, board: Board,
       statusEffect: StatusEffectType, duration: number, chance: number): void {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return;
        }

        const onBeingAilmentInflictedHookResult = this.getOnBeingAilmentInflictedHookResults(targetCombatant, afflictor, statusEffect);
        if(onBeingAilmentInflictedHookResult) {
            return;
        }

        const chanceWithDelta = chance + ((afflictor.stats.luck - targetCombatant.stats.luck) * 0.02);
        if(Math.random() >= chanceWithDelta) {
            return;
        }
        if(targetCombatant.hasStatusEffect(statusEffect)) {
          targetCombatant.updateStatusEffect({name: statusEffect, duration: duration});
        } else {
          targetCombatant.applyStatusEffect({name: statusEffect, duration: duration}, afflictor);
        }
     }


    public defend(target: Combatant): void {
      target.defend();
    }


    calcaulateBaseDamage(attacker: Combatant, target: Combatant, damageToUse: Damage): Damage {
        const delta = attacker.stats.attackPower - target.stats.defensePower;
        return {amount: (Math.random() * (1.2 - 0.8) + 0.8) * damageToUse.amount * (delta * 0.01 + 1), type: damageToUse.type};
        // return {amount: damageToUse.amount * (delta * 0.01 + 1), type: damageToUse.type};
    }

    private finalizeDamage(target: Combatant, damage: Damage, attackResult: AttackResult, position: Position, turnCost: number = 1) : ActionResult {
        const resistances = target.resistances;
        const damageType = damage.type;
        let reaction: DamageReaction = resistances.find((r) => r.type === damageType)?.reaction || DamageReaction.NONE;
        reaction = this.getReactionFromStatusEffects(target, damageType, reaction);
        let finalDamage = damage.amount;
        let cost = turnCost;

        if(reaction === DamageReaction.RESISTANCE) {
            finalDamage = damage.amount * 0.5;
        } else if(reaction === DamageReaction.IMMUNITY) {
            finalDamage = 0;
            cost *= 2;
        } else if(reaction === DamageReaction.WEAKNESS) {
            finalDamage = damage.amount * 1.25;
            cost = Math.max(0.5, cost / 2);
        } 
        if(attackResult === AttackResult.CriticalHit && reaction !== DamageReaction.IMMUNITY) {
            finalDamage = damage.amount * 1.5;
            cost = Math.max(0.5, cost / 2);
        }

        finalDamage = Math.max(0, finalDamage);

        const onAfterCalculateDamageHookResults = 
        getResultsForStatusEffectHook(target, StatusEffectHook.OnAfterCalculateDamage, target,{amount: finalDamage, type: damage.type}, 1);
        if(onAfterCalculateDamageHookResults.length > 0) {
          const hookMaxDamage = onAfterCalculateDamageHookResults
          .map((r) => r.damage.amount)
          .sort((a, b) => b - a)[0];
          finalDamage = Math.max(hookMaxDamage, finalDamage);
        }
        
        return {
          attackResult: attackResult,
          damage: {
            amount: finalDamage,
             type: damage.type
          }, 
          cost: cost,
          reaction: reaction,
          position: position
        };
    }

      calculateAttackRoll(attacker: Combatant, target: Combatant): AttackResult {
        const attackRoll = ((attacker.stats.agility - target.stats.agility) * 2) + Math.floor(Math.random() * 100) + 1;
  
        if(attackRoll < 5) {
          return AttackResult.Fumble;
        }
        else if (attackRoll < 15) {
          return AttackResult.Miss;
        } else if (attackRoll > 90) {
          return AttackResult.CriticalHit;
        } else {
          return AttackResult.Hit;
        }
      }

      

      private handleInjuryAilmentAndDeath(target: Combatant, finalDamage: Damage, attacker: Combatant, board: Board) {
        target.takeDamage(finalDamage, board);
        if(target.stats.hp <= 0) {
          getResultsForStatusEffectHook(attacker, StatusEffectHook.OnKilling, target, undefined, 1, board);
        }
      }

      
      private getOnBeingAttackedHookResults(target: Combatant, attacker: Combatant, damage: Damage, board: Board): ActionResult | undefined {
        const onBeingAttackedHookResults = getResultsForStatusEffectHook(target, StatusEffectHook.OnBeingAttacked, attacker, damage, 1, board);

        if(onBeingAttackedHookResults.length > 0) {
            const mostRelevantResult = this.getMostRelevantResult(onBeingAttackedHookResults);
            return mostRelevantResult;
        }
      }

      private getOnBeingAilmentInflictedHookResults(target: Combatant, attacker: Combatant, statusEffect: StatusEffectType): ActionResult | undefined {
        const onBeingAilmentInflictedHookResults = getResultsForStatusEffectHook(target, StatusEffectHook.OnBeingAilmentInflicted, attacker, undefined, 1);
        if(onBeingAilmentInflictedHookResults.length > 0) {
            const mostRelevantResult = this.getMostRelevantResult(onBeingAilmentInflictedHookResults);
            return mostRelevantResult;
        }
      }

      private getMostRelevantResult(results: ActionResult[]): ActionResult {
        return results.reduce((mostRelevant, current) => {            
            return current.cost > mostRelevant.cost ? current : mostRelevant;
        }, results[0]);
      }

      private getReactionFromStatusEffects(self: Combatant, damageType: DamageType, currentReaction: DamageReaction): DamageReaction {
        if(self.hasStatusEffect(StatusEffectType.FULL_METAL_JACKET) && damageType === DamageType.Lightning) {
          return DamageReaction.WEAKNESS;
        }
        if(self.hasStatusEffect(StatusEffectType.FROZEN) && damageType === DamageType.Crush) {
          return DamageReaction.WEAKNESS;
        }

        return currentReaction;
      }
    
}