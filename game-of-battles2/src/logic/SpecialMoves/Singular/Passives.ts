import { DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "../../SpecialMove";
import { Combatant } from "@/logic/Combatant";
import { RalliedStatusEffect } from "@/logic/StatusEffects.ts/PositiveEffects";
import { StatusEffectType } from "@/logic/StatusEffect";
import { Position } from "@/logic/Position";
import { Board } from "@/logic/Board";
import { getStandardActionResult } from "@/logic/attackResult";

export class MarchingDefense implements SpecialMove {
    name: string = "Marching Defense";
    triggerType = SpecialMoveTriggerType.Passive;
    cost: number = 0;
    turnCost: number = 0;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.None,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.applyStatusEffect({
            name: StatusEffectType.MARCHING_DEFENSE,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStandardActionResult();
    };
    requirements = undefined;
    description = 'allows you to use the defend action after moving.'
}

export class InspiringKiller implements SpecialMove {
    name: string = "Inspiring Killer";
    triggerType = SpecialMoveTriggerType.Passive;
    cost: number = 0;
    turnCost: number = 0;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.None,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.applyStatusEffect({
            name: StatusEffectType.INSPIRING_KILLER,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStandardActionResult();
    };
    requirements = undefined;
    description = 'Whenver this combatant kills an enemy, adjacent allies gain a random buff for 3 turns.'
}

export class FoolsLuck implements SpecialMove {
    name: string = "Fools Luck";
    triggerType = SpecialMoveTriggerType.Passive;
    cost: number = 0;
    turnCost: number = 0;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.None,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.applyStatusEffect({
            name: StatusEffectType.FOOLS_LUCK,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStandardActionResult();
    };
    requirements = undefined;
    description = `Whenever this combatant is attacked, there is a fixed small chance the hit will automatically miss.
    Whenever this combatant is inflicted with an ailment, there is a fixed small chance the ailment will not take effect.`
}

export class FirstStrike implements SpecialMove {
    name: string = "First Strike";
    triggerType = SpecialMoveTriggerType.Passive;
    cost: number = 0;
    turnCost: number = 0;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.None,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.applyStatusEffect({
            name: StatusEffectType.FIRST_STRIKE,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStandardActionResult();
    };
    requirements = undefined;
    description = `When an enemy comes to engage this combatant in close combat, his long weapon gives him the privielge of punishing them
    for trying to engage him, once a round`
}   

export class Riposte implements SpecialMove {
    name: string = "Riposte";
    triggerType = SpecialMoveTriggerType.Passive;
    cost: number = 0;
    turnCost: number = 0;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.None,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.applyStatusEffect({
            name: StatusEffectType.RIPOSTE,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStandardActionResult();
    };
    requirements = undefined;
    description = `When an enemy misses this combatant at close range, this combatant may counterattack.`
}

export class Sadist implements SpecialMove {
    name: string = "Sadist";
    triggerType = SpecialMoveTriggerType.Passive;
    cost: number = 0;
    turnCost: number = 0;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.None,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.applyStatusEffect({
            name: StatusEffectType.SADIST,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStandardActionResult();
    };  
    requirements = undefined;
    description = `When this combatant inflicts damage above 50 points, it gets a small health and stamina replenishment,
    as well as attack power buff for 3 turns.`
}   
