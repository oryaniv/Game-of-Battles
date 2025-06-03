import { Damage, DamageReaction, DamageType } from "./Damage";
import { Position } from "./Position";

export enum AttackResult {
    Hit,
    Miss,
    CriticalHit,
    Fumble,
    Blocked,
    // this should never happen
    NotFound
}


export interface ActionResult {
    attackResult: AttackResult;
    damage: Damage;
    cost: number;
    reaction: DamageReaction;
    position?: Position;
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
