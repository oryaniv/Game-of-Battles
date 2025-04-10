import { DamageType } from "@/logic/Damage";

import { getStandardActionResult } from "@/logic/attackResult";
import { SpecialMoveAreaOfEffect } from "@/logic/SpecialMove";
import { SpecialMoveAlignment } from "@/logic/SpecialMove";
import { SpecialMoveRangeType } from "@/logic/SpecialMove";
import { SpecialMoveRange, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { Damage } from "@/logic/Damage";
import { SpecialMove } from "@/logic/SpecialMove";
import { Position } from "@/logic/Position";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { StatusEffectType } from "@/logic/StatusEffect";
import { CombatMaster } from "@/logic/CombatMaster";

export class Weaken implements SpecialMove {
    name: string = "Weaken";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 5
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult();
        }
        targetCombatant.applyStatusEffect({
            name: StatusEffectType.STRENGTH_DOWNGRADE,
            duration: 3,
        }); 
        return getStandardActionResult();
    };
    checkRequirements = undefined;
    description = `Instill weakness in an enemy, reducing their attack power for 3 turns`
}

export class Slow implements SpecialMove {
    name: string = "Slow";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 6;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 5
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult();
        }
        targetCombatant.applyStatusEffect({
            name: StatusEffectType.SLOW,
            duration: 3,
        }); 
        return getStandardActionResult();
    };
    checkRequirements = undefined;
    description = `curse an enemy's body with a crushing burden, reducing their movement speed and agility for 3 turns`
}

export class EvilEye implements SpecialMove {
    name: string = "Evil Eye";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 7;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Cross,
        range: 4
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.range);
        getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(!targetCombatant) {
                return getStandardActionResult();
            }
            targetCombatant.applyStatusEffect({
                name: StatusEffectType.LUCK_DOWNGRADE,
                duration: 3,
            }); 
            return getStandardActionResult();
        });

        return getStandardActionResult();
    };
    checkRequirements = undefined;
    description = `Cast a malevolent gaze upon the enemy, cursing them and reducing their luck for 3 turns`
}

export class SiphonEnergy implements SpecialMove {
    name: string = "Siphon Energy";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 0;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 5
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {   
            return getStandardActionResult();
        }
        targetCombatant.stats.stamina = Math.max(0, targetCombatant.stats.stamina - 10);
        invoker.stats.stamina = Math.min(invoker.stats.stamina + 10, invoker.baseStats.stamina);
        invoker.applyStatusEffect({
            name: StatusEffectType.ENERGY_ABOSORB,
            duration: 2,
        });  
        return getStandardActionResult();
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasStatusEffect(StatusEffectType.ENERGY_ABOSORB);
    };
    description = `Leech upon an enemy's stamina, draining a small amount of theirs to replenish your own`
}