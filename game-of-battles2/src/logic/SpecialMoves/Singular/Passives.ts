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
    description = 'allows to use the defend action after moving.'
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

export class DivineMircale implements SpecialMove {
    name: string = "Divine Mircale";
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
        type: DamageType.Holy
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.applyStatusEffect({
            name: StatusEffectType.DIVINE_MIRACLE,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStandardActionResult();
    };
    requirements = undefined;
    description = `Once per combat, when this combatant is killed, it is immediately getting greatly healed and is purified from all negative status effects.`
}

export class LifeDrinker implements SpecialMove {
    name: string = "Life Drinker";
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
        type: DamageType.Healing
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.applyStatusEffect({
            name: StatusEffectType.LIFE_DRINKER,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStandardActionResult();
    };
    requirements = undefined;
    description = `When this combatant kills an enemy, it gains part of their max health as both healing and addition to their max health`
}

export class GoOff implements SpecialMove {
    name: string = "Go Off";
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
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.applyStatusEffect({
            name: StatusEffectType.GOING_OFF,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStandardActionResult();
    };
    requirements = undefined;
    description = `When this combatant is killed, it explodes, dealing damage to all enemies in a 3x3 area.`
}

export class SurpriseBoom implements SpecialMove {
    name: string = "Surprise Boom";
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
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.applyStatusEffect({
            name: StatusEffectType.SURPRISE_BOOM,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStandardActionResult();
    };
    requirements = undefined;
    description = `When this combatant is killed, it explodes, dealing blight damage to all enemies in a cross area`
}

export class Decoy implements SpecialMove {
    name: string = "Decoy";
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
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.applyStatusEffect({
            name: StatusEffectType.DECOY,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStandardActionResult();
    };
    requirements = undefined;
    description = `this combatant is a decoy for another. when it is destroyed, the original combatant is revealed, and vice versa.`
}

export class ElemDuplicate implements SpecialMove {
    name: string = "Elem Duplicate";
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
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        return getStandardActionResult();
    };
    requirements = undefined;
    description = `Upon being hit with elemental damage, this combatant duplicates itself to both side tiles if possible.`
}

export class PhysDuplicate implements SpecialMove {
    name: string = "Phys Duplicate";
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
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        return getStandardActionResult();
    };
    requirements = undefined;
    description = `Upon being hit with elemental damage, this combatant duplicates itself to both side tiles if possible.`
}



    


