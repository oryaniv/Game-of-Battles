import { ActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { CombatantType } from "@/logic/Combatants/CombatantType";
import { Damage, DamageType } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";

export abstract class CoopMove implements SpecialMove {
    // taken from SpecialMove
    name: string = "Coop Move";
    triggerType: SpecialMoveTriggerType = SpecialMoveTriggerType.Cooperative;
    cost: number = 0;
    turnCost: number = 0;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    description: string = "Coop Move";
    checkRequirements = (self: Combatant) => {
        return true;
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        return [];
    };

    // these are new, and belong to COOP alone
    abstract coopRequiredPartners: CombatantType[];
    abstract meterCost: number;
}