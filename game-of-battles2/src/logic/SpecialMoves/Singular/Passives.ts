import { DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "../../SpecialMove";
import { Combatant } from "@/logic/Combatant";

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
    effect = undefined;
    requirements = undefined;
    description = 'allows you to use the defend action after moving.'
}