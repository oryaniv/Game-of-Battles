import { Damage, DamageReaction, DamageType } from "./Damage";

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
}


export function getEmptyActionResult(): ActionResult {
    return {
        attackResult: AttackResult.NotFound,
        damage: {
            amount: 0,
            type: DamageType.Unstoppable
        },
        cost: 1,
        reaction: DamageReaction.NONE
    };
}
