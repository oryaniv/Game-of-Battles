import { DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { Board } from "@/logic/Board";
import { StatusEffectType, StatusEffectHook } from "@/logic/StatusEffect";


export class BlockingStance implements SpecialMove {
    name: string = "Blocking Stance";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 3;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Crush
    };
    effect = (target: Position, board: Board) => {
        alert('blocking stance');
        const combatant = board.getCombatantAtPosition(target);
        if(!combatant) {
            alert('no combatant at target');
            return;
        }
        combatant.applyStatusEffect({
            name: StatusEffectType.BLOCKING_STANCE,
            duration: Number.POSITIVE_INFINITY,
            hooks: {
                [StatusEffectHook.OnBeingAttacked]: (combatant, damage: number) => {
                    alert('on being attacked, doing blocking stance!');
                },
            },
        });    
    };
    requirements = undefined;
    description = `Go into Blocking stance. 
    Every attack against you of slash, pierce or crush damage types has a 50 percent chance of being blocked.
    Stance will end upon moving or attacking.`
}