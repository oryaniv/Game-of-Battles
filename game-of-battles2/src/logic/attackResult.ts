import { Damage, DamageReaction, DamageType } from "./Damage";
import { Position } from "./Position";
import { StatusEffectType } from "./StatusEffect";

export enum AttackResult {
    Hit,
    Miss,
    CriticalHit,
    Fumble,
    Blocked,
    // this should never happen
    NotFound,
    // Buff,
    // Debuff,
    // Ailment,
}


export interface ActionResult {
    attackResult: AttackResult;
    damage: Damage;
    cost: number;
    reaction: DamageReaction;
    position?: Position;
    statusEffectType?: StatusEffectType;
}


export function getStandardActionResult(position?: Position, cost: number = 1): ActionResult {
    return {
        attackResult: AttackResult.NotFound,
        damage: {
            amount: 0,
            type: DamageType.Unstoppable
        },
        cost: cost,
        reaction: DamageReaction.NONE,
        position: position
    };
}

export function getDamageActionResult(resultDamage: Damage, position?: Position, cost: number = 1): ActionResult {
    return {
        attackResult: AttackResult.Hit,
        damage: resultDamage,
        cost: cost,
        reaction: DamageReaction.NONE,
        position: position
    };
}

export function getStatusEffectActionResult(statusEffectType: StatusEffectType, position?: Position, cost: number = 1): ActionResult {
    return {
        attackResult: AttackResult.NotFound,
        damage: {
            amount: Number.NaN,
            type: DamageType.None
        },
        cost: cost,
        reaction: DamageReaction.NONE,
        position: position,
        statusEffectType: statusEffectType
    };
}

export function getMissActionResult(position?: Position, cost: number = 1): ActionResult {
    return {
        attackResult: AttackResult.Miss,
        damage: {
            amount: 0,
            type: DamageType.Unstoppable
        },
        cost: cost,
        reaction: DamageReaction.NONE,
        position: position
    };
}
