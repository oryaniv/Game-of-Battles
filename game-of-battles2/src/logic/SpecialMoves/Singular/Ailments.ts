import { ActionResult, getStandardActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { StatusEffectType } from "@/logic/StatusEffect";

export class YoMama implements SpecialMove {
    name: string = "Yo Mama!";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 5
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect: (invoker: Combatant, target: Position, board: Board) => ActionResult | ActionResult[] = (invoker, target, board) => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult();
        }
        targetCombatant.applyStatusEffect({
            name: StatusEffectType.TAUNTED,
            duration: 3,
        }); 
        return getStandardActionResult();
    };
     checkRequirements = undefined;
    description = `Barrage an enemy with a torrent of insults regarding their dear mama, leading to a medium probability of them
    losing their composure and becoming enraged, doomed to chase you for 3 rounds`
}