import { getEmptyActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { CombatMaster } from "@/logic/CombatMaster";
import { DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { SpecialMoveAreaOfEffect } from "@/logic/SpecialMove";
import { SpecialMoveAlignment, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { SpecialMove } from "@/logic/SpecialMove";
import { StatusEffect, StatusEffectAlignment, StatusEffectType } from "@/logic/StatusEffect";


export class Purify implements SpecialMove {
    name: string = "Purify";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 4;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Ally,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Pierce
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getEmptyActionResult();
        }
        const negativeStatusEffects: StatusEffect[] = targetCombatant.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative);
        for(const statusEffect of negativeStatusEffects) {
            targetCombatant?.removeStatusEffect(statusEffect.name);
        }
        return getEmptyActionResult();
    };
    checkRequirements = undefined
    description = `Cure an ally of all Negative status effects`   
}