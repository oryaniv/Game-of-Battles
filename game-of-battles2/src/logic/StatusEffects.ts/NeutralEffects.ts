import { StatusEffectAlignment } from "../StatusEffect";
import { Combatant } from "../Combatant";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";
import { StatusEffect } from "../StatusEffect";
import { Board } from "../Board";
import { SpecialMoveAreaOfEffect } from "../SpecialMove";


export class InspiringKillerStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.INSPIRING_KILLER;
    applicationHooks = {
        [StatusEffectHook.OnKilling]: (caster: Combatant, target: Combatant, board: Board) => {
            const getAllTargets = board.getAreaOfEffectPositions(caster, caster.position, SpecialMoveAreaOfEffect.Cross, 1);
            getAllTargets.forEach((target) => {
                const targetCombatant = board.getCombatantAtPosition(target);
                const buffIndex = Math.floor(Math.random() * 3);
                const randomizedBuff = [StatusEffectType.RALLIED, StatusEffectType.MOBILITY_BOOST, StatusEffectType.STRENGTH_BOOST][buffIndex];
                if (targetCombatant) {
                    targetCombatant.applyStatusEffect({
                        name: randomizedBuff,
                        duration: 3,
                    });
                }
            });
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class EnergyAbsorbStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ENERGY_ABOSORB;
    applicationHooks =  {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}