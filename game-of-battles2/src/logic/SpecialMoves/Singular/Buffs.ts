import { getStandardActionResult, getStatusEffectActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { DamageType } from "@/logic/Damage";

import { Damage } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { StatusEffectType } from "@/logic/StatusEffect";

export class Fortify implements SpecialMove {
    name: string = "Fortify";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Ally,
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
            name: StatusEffectType.FORTIFIED,
            duration: 3,
        }); 
        return getStatusEffectActionResult(StatusEffectType.FORTIFIED, target, 1);
    };
    checkRequirements = undefined;
    description = `Increase ally's defense power for 3 rounds.`
}

export class CallOfStrength implements SpecialMove {
    name: string = "Call of Strength";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 4;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
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
            name: StatusEffectType.STRENGTH_BOOST,
            duration: 3,
        }); 
        return getStatusEffectActionResult(StatusEffectType.STRENGTH_BOOST, target, 1);
    };
    checkRequirements = undefined;
    description = `Increase ally's attack power for 3 rounds.`
}

export class CallOfVigor implements SpecialMove {
    name: string = "Call of Vigor";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
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
            name: StatusEffectType.MOBILITY_BOOST,
            duration: 3,
        }); 
        return getStatusEffectActionResult(StatusEffectType.MOBILITY_BOOST, target, 1);
    };
    checkRequirements = undefined;
    description = `Increase ally's agility and movement speed for 3 rounds.`
}

export class Encourage implements SpecialMove {
    name: string = "Encourage";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 7;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Ally,
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
            name: StatusEffectType.ENCOURAGED,
            duration: 5,
        }); 
        return getStatusEffectActionResult(StatusEffectType.ENCOURAGED, target, 1);
    };
    checkRequirements = undefined;
    description = `Ally gains the Encouraged status for 5 rounds. Upon ending their turn, they have a small chance to gain an additional action point.`
}

export class FullMetalJacket implements SpecialMove {
    name: string = "Full Metal Jacket";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Ally,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
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
            name: StatusEffectType.FULL_METAL_JACKET,
            duration: 3,
        }); 
        return getStatusEffectActionResult(StatusEffectType.FULL_METAL_JACKET, target, 1);
    };
    checkRequirements = undefined;
    description = `For 3 rounds, ally becomes a construct, gains defense boost, attack boost if their attacks are physical based,
    becomes weak to lightning damage, and may unlock an additional skill.`       
}

