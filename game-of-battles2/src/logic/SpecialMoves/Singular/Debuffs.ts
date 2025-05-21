import { DamageReaction, DamageType } from "@/logic/Damage";

import { AttackResult, getStandardActionResult } from "@/logic/attackResult";
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
        const staminaToSiphon = targetCombatant.stats.stamina < 10 ? targetCombatant.stats.stamina : 10;
        targetCombatant.stats.stamina = Math.max(0, targetCombatant.stats.stamina - staminaToSiphon);
        invoker.stats.stamina = Math.min(invoker.stats.stamina + staminaToSiphon, invoker.baseStats.stamina);
        invoker.applyStatusEffect({
            name: StatusEffectType.ENERGY_ABSORB,
            duration: 2,
        });  
        return getStandardActionResult();
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasStatusEffect(StatusEffectType.ENERGY_ABSORB);
    };
    description = `Leech upon an enemy's stamina, draining a small amount of theirs to replenish your own`
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
        if(targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_PAIN)) {
            targetCombatant.removeStatusEffect(StatusEffectType.MARKED_FOR_PAIN);
            targetCombatant.applyStatusEffect({
                name: StatusEffectType.MARKED_FOR_EXECUTION,
                duration: 5,
            });
        } else if (targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_EXECUTION)) {
            targetCombatant.removeStatusEffect(StatusEffectType.MARKED_FOR_EXECUTION);
            targetCombatant.applyStatusEffect({
                name: StatusEffectType.MARKED_FOR_OBLIVION,
                duration: 5,
            });
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
                amount: 0,
                type: DamageType.Unstoppable
            },
            cost: 0.5,
            reaction: DamageReaction.NONE,
            position: target
        };
    };
    checkRequirements = undefined;
    description = `cast the mark of the assassin on an enemy. the mark can get stronger with every cast.
    the mark will be detonated when the marked target is struck by a rogue. the stornger the mark is upon detonation,
    the more damage the target will suffer from the detonating attack.`
}