import { StatusEffectAlignment } from "../StatusEffect";
import { Combatant } from "../Combatant";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";
import { StatusEffect } from "../StatusEffect";
import { Board } from "../Board";
import { SpecialMoveAreaOfEffect } from "../SpecialMove";
import { AttackResult, getStandardActionResult } from "../attackResult";
import { Damage, DamageType } from "../Damage";
import { DamageReaction } from "../Damage";
import { RangeCalculator } from "../RangeCalculator";
import { CombatMaster } from "../CombatMaster";


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
    name: StatusEffectType = StatusEffectType.ENERGY_ABSORB;
    applicationHooks =  {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class FoolsLuckStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FOOLS_LUCK;
    applicationHooks = {
        [StatusEffectHook.OnBeingAttacked]: (attacker: Combatant, defender: Combatant, damage: Damage, attackCost: number) => {
            const chance = 0.1;
            const random = Math.random();
            if (random < chance) {
                return {attackResult: AttackResult.Miss, damage: {amount: 0, type: DamageType.Unstoppable}, cost: attackCost, reaction: DamageReaction.NONE};
            }
            return;
        },
        [StatusEffectHook.OnBeingAilmentInflicted]: (attacker: Combatant, defender: Combatant, damage: Damage, attackCost: number) => {
            const chance = 0.1;
            const random = Math.random();
            if (random < chance) {
                return {attackResult: AttackResult.Miss, damage: {amount: 0, type: DamageType.Unstoppable}, cost: attackCost, reaction: DamageReaction.NONE};
            }
            return;
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class FirstStrikeStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FIRST_STRIKE;
    applicationHooks = {
        [StatusEffectHook.OnBeingAttacked]: (attacker: Combatant, defender: Combatant, damage: Damage, attackCost: number) => {
            const rangeCalculator = new RangeCalculator();
            if(rangeCalculator.areInMeleeRange(attacker, defender)) {
                const combatMaster = CombatMaster.getInstance();
                // combatMaster.executeAttack(attacker, defender.position, board, damage);
            }
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}