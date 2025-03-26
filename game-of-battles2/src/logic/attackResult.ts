import { Damage, DamageReaction } from "./Damage";

export enum AttackResult {
    Hit,
    Miss,
    CriticalHit,
    Fumble,
    // this should never happen
    NotFound
}


export interface ActionResult {
    attackResult: AttackResult;
    damage: Damage;
    cost: number;
    reaction: DamageReaction;
}
