import { DamageReaction, DamageType } from "@/logic/Damage";

import { AttackResult, getStandardActionResult, getStatusEffectActionResult, getDamageActionResult } from "@/logic/attackResult";
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
import { emitter } from "@/eventBus";

export class Weaken implements SpecialMove {
    name: string = "Weaken";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 7
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
        return getStatusEffectActionResult(StatusEffectType.STRENGTH_DOWNGRADE, target, 1);
    };
    checkRequirements = undefined;
    description = `Reduce Enemy's attack power for 3 rounds.`
}

export class Slow implements SpecialMove {
    name: string = "Slow";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 6;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 7
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
        return getStatusEffectActionResult(StatusEffectType.SLOW, target, 1);
    };
    checkRequirements = undefined;
    description = `Reduce Enemy's movement speed and agility for 3 rounds.`
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
        range: 6
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(!targetCombatant) {
                return getStandardActionResult();
            }
            targetCombatant.applyStatusEffect({
                name: StatusEffectType.LUCK_DOWNGRADE,
                duration: 3,
            }); 
            emitter.emit('trigger-method', getStatusEffectActionResult(StatusEffectType.LUCK_DOWNGRADE, AOETarget, 1));
        });

        return getStandardActionResult();
    };
    checkRequirements = undefined;
    description = `Reduce luck of all enemies in a 1-tile cross-shaped area for 3 rounds.`
}

export class SiphonEnergy implements SpecialMove {
    name: string = "Siphon Energy";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 0;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 7
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
        const staminaToSiphon = targetCombatant.stats.stamina < 10 ? targetCombatant.stats.stamina : 10;
        targetCombatant.stats.stamina = Math.max(0, targetCombatant.stats.stamina - staminaToSiphon);
        invoker.stats.stamina = Math.min(invoker.stats.stamina + staminaToSiphon, invoker.baseStats.stamina);
        invoker.applyStatusEffect({
            name: StatusEffectType.ENERGY_ABSORB,
            duration: 2,
        });  
        return getDamageActionResult({amount: staminaToSiphon, type: DamageType.Stamina}, invoker.position);
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasStatusEffect(StatusEffectType.ENERGY_ABSORB);
    };
    description = `Steal 10 stamina points from the target. 2 rounds cooldown.`
}

export class AssassinsMark implements SpecialMove {
    name: string = "Assassin's Mark";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 2;
    turnCost: number = 0.5;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 2
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
        let statusEffectType = StatusEffectType.MARKED_FOR_PAIN;
        if(targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_PAIN)) {
            targetCombatant.removeStatusEffect(StatusEffectType.MARKED_FOR_PAIN);
            targetCombatant.applyStatusEffect({
                name: StatusEffectType.MARKED_FOR_EXECUTION,
                duration: 5,
            });
            statusEffectType = StatusEffectType.MARKED_FOR_EXECUTION;
        } else if (targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_EXECUTION)) {
            targetCombatant.removeStatusEffect(StatusEffectType.MARKED_FOR_EXECUTION);
            targetCombatant.applyStatusEffect({
                name: StatusEffectType.MARKED_FOR_OBLIVION,
                duration: 5,
            });
            statusEffectType = StatusEffectType.MARKED_FOR_OBLIVION;
        } else if(targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_OBLIVION)) {
            return getStandardActionResult();
        } else {
            targetCombatant.applyStatusEffect({
                name: StatusEffectType.MARKED_FOR_PAIN,
                duration: 5,
            });
        }
        return  {
            attackResult: AttackResult.NotFound,
            damage: {
                amount: Number.NaN,
                type: DamageType.None
            },
            cost: 0.5,
            reaction: DamageReaction.NONE,
            position: target,
            statusEffectType: statusEffectType
        };
    };
    checkRequirements = undefined;
    description = `Apply mark on the target, stacks up to 3 times. Each mark results in a bigger damage
    multiplier when the mark is detonated by a rogue's attack. Can be used without breaking cloaking, and costs
    only half an action point.`;
    breaksCloaking = false;
}

export class ArakansBane implements SpecialMove {
    name: string = "Arakan's Bane";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 0;
    turnCost: number = 0.5;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 3
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
        targetCombatant.applyStatusEffect({
            name: StatusEffectType.DEFENSE_DOWNGRADE,
            duration: 3,
        });
        return getStatusEffectActionResult(StatusEffectType.SLOW, target, 1);
    };
    checkRequirements = undefined;
    breaksCloaking = false;
    description = `Decrease target's movement speed, agility and defense for 3 rounds.`
}