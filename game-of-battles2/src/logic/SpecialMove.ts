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
    effect?: (invoker: Combatant, target: Position, board: Board) => ActionResult | ActionResult[];
    checkRequirements?: (self: Combatant) => boolean;
    breaksCloaking?: boolean;
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
    "TeleportAssault" = "TeleportAssault",
    "None" = "None"
}

export enum SpecialMoveAreaOfEffect {
    Single = "Single",
    Cross = "Cross",
    Nova = "Nova",
    Great_Nova = "GreatNova",
    Line = "Line",
    Cone = "Cone",
    Chain = "Chain",
    Four_Spread = "FourSpread",
    Nova_No_Empty_Space = "NovaNoEmptySpace"
}

export enum SpecialMoveAlignment {
    "Self" = "Self",
    "SelfAndAlly" = "SelfAndAlly",
    "Ally" = "Ally",
    "Enemy" = "Enemy",
    "All" = "All",
    "Empty_Space" = "Empty_Space"
}





