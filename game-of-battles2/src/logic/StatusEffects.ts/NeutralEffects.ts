import { StatusEffectAlignment } from "../StatusEffect";
import { Combatant } from "../Combatant";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";
import { StatusEffect } from "../StatusEffect";
import { Board } from "../Board";
import { SpecialMoveAlignment, SpecialMoveAreaOfEffect } from "../SpecialMove";
import { AttackResult, getStandardActionResult } from "../attackResult";
import { Damage, DamageType } from "../Damage";
import { DamageReaction } from "../Damage";
import { RangeCalculator } from "../RangeCalculator";
import { CombatMaster } from "../CombatMaster";


export class InspiringKillerStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.INSPIRING_KILLER;
    applicationHooks = {
        [StatusEffectHook.OnKilling]: (caster: Combatant, target: Combatant, board: Board) => {
            const getAllTargets = board.getAreaOfEffectPositions(caster, caster.position, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.SelfAndAlly);
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
        [StatusEffectHook.OnBeingAttacked]: (self: Combatant, attacker: Combatant, damage: Damage, amount: number, board: Board) => {
            const rangeCalculator = new RangeCalculator();
            if(self.hasStatusEffect(StatusEffectType.STRUCK_FIRST) || !rangeCalculator.areInMeleeRange(self, attacker)) {
                return;
            }

            self.applyStatusEffect({
                name: StatusEffectType.STRUCK_FIRST,
                duration: Number.POSITIVE_INFINITY,
            });

            const combatMaster = CombatMaster.getInstance();
            combatMaster.executeAttack(self, attacker.position, board, damage);
            if(attacker.isKnockedOut()) {
               return getStandardActionResult(attacker.position);
            }
            
        },
        [StatusEffectHook.OnTurnStart]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.STRUCK_FIRST);
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class StruckFirstStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.STRUCK_FIRST;
    applicationHooks =  {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class RiposteStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.RIPOSTE;
    applicationHooks = {
        [StatusEffectHook.OnBeingMissed]: (self: Combatant, attacker: Combatant, damage: Damage, amount: number, board: Board) => {
            const rangeCalculator = new RangeCalculator();
            if(rangeCalculator.areInMeleeRange(self, attacker)) {
                const combatMaster = CombatMaster.getInstance();
                combatMaster.executeAttack(self, attacker.position, board, damage);
            }
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class MarchingDefenseStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MARCHING_DEFENSE;
    applicationHooks = {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class SadistStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.SADIST;
    applicationHooks = {
        [StatusEffectHook.OnInflictingDamage]: (self: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            if(amount > 50) {
                self.stats.hp = Math.min(self.stats.hp + 10, self.baseStats.hp);
                self.stats.stamina = Math.min(self.stats.stamina + 10, self.baseStats.stamina);
                self.applyStatusEffect({
                    name: StatusEffectType.STRENGTH_BOOST,
                    duration: 3,
                });
            }
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}
