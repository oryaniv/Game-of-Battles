import { Combatant } from "./Combatant";
import { Damage } from "./Damage";
import { Position } from "./Position";
import { StatusEffectType } from "./StatusEffect";
import { Board } from "./Board";
import { ActionResult } from "./attackResult";
export interface SpecialMove {
    name: string;
    triggerType: SpecialMoveTriggerType;
    cost: number;
    turnCost: number;
    range: SpecialMoveRange;
    damage: Damage;
    effect?: (invoker: Combatant, target: Position, board: Board) => ActionResult;
    checkRequirements?: (self: Combatant) => boolean;
    description: string;
  }

export enum SpecialMoveTriggerType {
    Active = "Active",
    Passive = "Passive",
    Cooperative = "Cooperative"
}

export interface SpecialMoveRange {
    type: SpecialMoveRangeType;
    align: SpecialMoveAlignment;
    areaOfEffect: SpecialMoveAreaOfEffect;
    range: number;
}

export enum SpecialMoveRangeType {
    "Self" = "Self",
    "Melee" = "Melee",
    "Straight" = "Straight",
    "Curve" = "Curve",
    "None" = "None"
}

export enum SpecialMoveAreaOfEffect {
    Single = "Single",
    Cross = "Cross",
    Nova = "Nova",
    Line = "Line",
    Cone = "Cone",
    Chain = "Chain"
}

export enum SpecialMoveAlignment {
    "Self" = "Self",
    "Ally" = "Ally",
    "Enemy" = "Enemy",
    "All" = "All"
}

// special move template

/*
export class XXX implements SpecialMove {
    name: string = "XXX";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 20,
        type: DamageType.Slash
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board);
        invoker.defend();
        return result;
    };
    checkRequirements = undefined
    description = ``
    
}


*/