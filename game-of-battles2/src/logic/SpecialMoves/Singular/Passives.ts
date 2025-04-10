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
    effect = undefined;
    requirements = undefined;
    description = 'allows you to use the defend action after moving.'
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
            duration: 3,
        });
        return getStandardActionResult();
    };
    requirements = undefined;
    description = 'Whenver this combatant kills an enemy, adjacent allies gain a random buff for 3 turns.'
}

