import { Combatant } from "./Combatant";
import { Damage } from "./Damage";
import { Position } from "./Position";
import { StatusEffectType } from "./StatusEffect";

export interface SpecialMove {
    name: string;
    triggerType: SpecialMoveTriggerType;
    cost: number;
    turnCost: number;
    range: SpecialMoveRange;
    damage: Damage;
    effect?: (targets: Combatant[]) => void;
    requirements?: (self: Combatant) => boolean;
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
}

export enum SpecialMoveAlignment {
    "Self" = "Self",
    "Ally" = "Ally",
    "Enemy" = "Enemy",
    "All" = "All"
}