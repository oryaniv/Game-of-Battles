import { AttackResult } from "@/logic/attackResult";
import { getEmptyActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { CombatMaster } from "@/logic/CombatMaster";
import { DamageReaction, DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { SpecialMoveAreaOfEffect } from "@/logic/SpecialMove";
import { SpecialMoveAlignment, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { SpecialMove } from "@/logic/SpecialMove";
import { StatusEffect, StatusEffectAlignment, StatusEffectType } from "@/logic/StatusEffect";


export class Heal implements SpecialMove {
    name: string = "Heal";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 4;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 3
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Healing
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getEmptyActionResult();  
        }
        targetCombatant.stats.hp = Math.min(targetCombatant.stats.hp + this.damage.amount, targetCombatant.baseStats.hp);
        return {
            attackResult: AttackResult.Hit,
            damage: {
                amount: this.damage.amount,
                type: this.damage.type
            },
            cost: 1,
            reaction: DamageReaction.NONE
        };
    };
    checkRequirements = undefined
    description = `engulf an ally in a wave of healing energy, healing them for a medium amount of health`   
}

export class Regenerate implements SpecialMove {
    name: string = "Regenerate";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 6;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 3
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Healing
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getEmptyActionResult();  
        }
        targetCombatant.applyStatusEffect({
            name: StatusEffectType.REGENERATING,
            duration: 5,
        }); 
        return getEmptyActionResult();
    };
    checkRequirements = undefined
    description = `Greatly empower an ally's natural healing abilities, 
    allowing them to heal for a small amount of health each turn`   
}

export class Purify implements SpecialMove {
    name: string = "Purify";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 4;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Ally,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Pierce
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getEmptyActionResult();
        }
        const negativeStatusEffects: StatusEffect[] = targetCombatant.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative);
        for(const statusEffect of negativeStatusEffects) {
            targetCombatant?.removeStatusEffect(statusEffect.name);
        }
        return getEmptyActionResult();
    };
    checkRequirements = undefined
    description = `Cure an ally of all Negative status effects`   
}