import { StatusEffectAlignment } from "../StatusEffect";
import { Combatant } from "../Combatant";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";
import { StatusEffect } from "../StatusEffect";
import { Board } from "../Board";
import { SpecialMoveAlignment, SpecialMoveAreaOfEffect } from "../SpecialMove";
import { ActionResult, AttackResult, getStandardActionResult } from "../attackResult";
import { Damage, DamageType } from "../Damage";
import { DamageReaction } from "../Damage";
import { RangeCalculator } from "../RangeCalculator";
import { CombatMaster } from "../CombatMaster";
import { emitter } from "@/eventBus";


export class InspiringKillerStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.INSPIRING_KILLER;
    applicationHooks = {
        [StatusEffectHook.OnKilling]: (caster: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            const getAllTargets = board.getAreaOfEffectPositions(caster, target.position, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.Ally);
            getAllTargets.forEach((targetPosition) => {
                const targetAlly = board.getCombatantAtPosition(targetPosition);
                if(!targetAlly || targetAlly.team.getName() !== caster.team.getName()) {
                    return;
                }
                const buffIndex = Math.floor(Math.random() * 4);
                const randomizedBuff = [StatusEffectType.RALLIED, StatusEffectType.MOBILITY_BOOST,
                     StatusEffectType.STRENGTH_BOOST, StatusEffectType.ENCOURAGED][buffIndex];
                if (targetAlly) {
                    targetAlly.applyStatusEffect({
                        name: randomizedBuff,
                        duration: 3,
                    });
                }
            });
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
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
        [StatusEffectHook.OnBeingAttacked]: (attacked: Combatant, attacker: Combatant, damage: Damage, attackCost: number) => {
            const chanceToMiss = attacked.stats.luck * 0.02;
            const chanceToFumble = attacked.stats.luck * 0.01;
            const random = Math.random();
            
            if (random <= chanceToFumble) {
                attacked.baseStats.luck += 1;
                attacked.stats.luck += 1;
                return {attackResult: AttackResult.Fumble, damage: {amount: 0, type: DamageType.Unstoppable}, cost: attackCost, reaction: DamageReaction.NONE, position: attacked.position};
            }
            if (random <= chanceToMiss) {
                attacked.baseStats.luck += 2;
                attacked.stats.luck += 2;
                return {attackResult: AttackResult.Miss, damage: {amount: 0, type: DamageType.Unstoppable}, cost: attackCost, reaction: DamageReaction.NONE, position: attacked.position};
            }
            return;
        },
        [StatusEffectHook.OnBeingAilmentInflicted]: (attacked: Combatant, attacker: Combatant, damage: Damage, attackCost: number) => {
            const chancToFail = attacked.stats.luck * 0.02;
            const random = Math.random();
            if (random <= chancToFail) {
                return {attackResult: AttackResult.Miss, damage: {amount: 0, type: DamageType.Unstoppable}, cost: attackCost, reaction: DamageReaction.NONE, position: attacked.position};
            }
            return;
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class FirstStrikeStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FIRST_STRIKE;
    applicationHooks = {
        [StatusEffectHook.OnBeingAttacked]: (self: Combatant, attacker: Combatant, damage: Damage, amount: number, board: Board) => {
            let isAttackerHookedToSelf = false;
            const isDiamondHookHolder = self.hasStatusEffect(StatusEffectType.DIAMOND_HOOKED_HOLDING);
            if(isDiamondHookHolder) {
                const heldCombatant = self.getRelatedCombatants()["DIAMOND_HOOKED_HOLDING"];
                isAttackerHookedToSelf = !!heldCombatant && heldCombatant.name === attacker.name;
            }
            
            if(
                !board.isInMeleeRange(self, attacker) ||
                attacker.hasStatusEffect(StatusEffectType.CLOAKED)
            ) {
                return;
            }

            if(!isAttackerHookedToSelf &&
                (self.hasStatusEffect(StatusEffectType.STRUCK_FIRST) || 
                attacker.hasStatusEffect(StatusEffectType.FIRST_STRIKE))) {
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
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
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
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class MarchingDefenseStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MARCHING_DEFENSE;
    applicationHooks = {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class SadistStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.SADIST;
    applicationHooks = {
        [StatusEffectHook.OnInflictingDamage]: (self: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            if(damage.amount >= 50) {
                self.stats.hp = Math.min(self.stats.hp + 15, self.baseStats.hp);
                self.stats.stamina = Math.min(self.stats.stamina + 15, self.baseStats.stamina);
                self.applyStatusEffect({
                    name: StatusEffectType.STRENGTH_BOOST,
                    duration: 3,
                });
            }
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class GoingOffStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.GOING_OFF;
    applicationHooks = {
        [StatusEffectHook.OnDeath]: (caster: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            const combatMaster = CombatMaster.getInstance();
            // eslint-disable-next-line
            debugger;
            const getAllTargets = board.getAreaOfEffectPositions(caster, caster.position, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.All);
            getAllTargets.forEach((targetPosition) => {
                const targetEnemy = board.getCombatantAtPosition(targetPosition);
                if(targetEnemy && targetEnemy.name !== caster.name) {
                    const result = combatMaster.executeAttack(caster, targetEnemy.position, board, {amount: 30, type: DamageType.Fire});
                    emitter.emit('trigger-method', result);
                }
            });
        },
        [StatusEffectHook.OnDamageTaken]: (self: Combatant, target: Combatant, damage: Damage) => {
            if(damage.amount >= 1 && (damage.type  === DamageType.Ice)) {
                self.removeStatusEffect(StatusEffectType.GOING_OFF);
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class DivineMiracleStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DIVINE_MIRACLE;
    applicationHooks = {
        [StatusEffectHook.OnDeath]: (caster: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            caster.stats.hp = Math.min(40, caster.baseStats.hp);
            const negativeStatusEffects: StatusEffect[] = caster.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative);
            for(const statusEffect of negativeStatusEffects) {
                caster?.removeStatusEffect(statusEffect.name);
            }
            caster.removeStatusEffect(StatusEffectType.DIVINE_MIRACLE);
            return {
                attackResult: AttackResult.Hit,
                damage: {
                    amount: 40,
                    type: DamageType.Healing
                },
                cost: 0,
                reaction: DamageReaction.NONE,
                position: target
            };
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}   

export class LifeDrinkerStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.LIFE_DRINKER;
    applicationHooks = {
        [StatusEffectHook.OnKilling]: (caster: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            if(!caster.isOrganic()) {
                return;
            }
            const victimMaxHp = target.baseStats.hp;
            const victimNegativeEffectCount = target.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative).length;
            const lifeDrinkAmount = Math.floor((victimMaxHp * 0.3) + 
            (victimNegativeEffectCount > 0 ? victimNegativeEffectCount * (victimMaxHp * 0.1) : 0));
            caster.baseStats.hp += lifeDrinkAmount;
            caster.stats.hp = Math.min(caster.stats.hp + lifeDrinkAmount, caster.baseStats.hp);
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class LastStandUsedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.LAST_STAND_USED;
    applicationHooks = {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class DecoyStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DECOY;
    applicationHooks = {
        [StatusEffectHook.OnDeath]: (caster: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            const team = caster.team;
            const realTarget = caster.getRelatedCombatants()["doll_owner"];
            if(realTarget) {
                realTarget.removeStatusEffect(StatusEffectType.CLOAKED);
            }
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class SurpriseBoomStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.SURPRISE_BOOM;
    applicationHooks = {
        [StatusEffectHook.OnDeath]: (caster: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            const combatMaster = CombatMaster.getInstance();
            const getAllTargets = board.getAreaOfEffectPositions(caster, target.position, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.All);
            const results: ActionResult[] = getAllTargets.map((targetPosition) => {
                const targetEnemy = board.getCombatantAtPosition(targetPosition);
                if(!targetEnemy || targetEnemy.name === caster.name) {
                    return getStandardActionResult();
                }
                const result = combatMaster.executeAttack(caster, targetEnemy.position, board, {amount: 20, type: DamageType.Blight});
                if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
                    combatMaster.tryInflictStatusEffect(caster, targetEnemy.position, board, StatusEffectType.POISONED, 3, 0.3);
                }
                return result;
            });
            // caster.takeDamage({amount: caster.stats.hp, type: DamageType.Unstoppable});
            return results;
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class TrollRegenerationStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.TROLL_REGENERATION;
    applicationHooks = {
        [StatusEffectHook.OnTurnStart]: (self: Combatant) => {
            const newHp = Math.min(self.stats.hp + 12, self.baseStats.hp);
            const deltaHp = newHp - self.stats.hp;
            self.stats.hp = newHp;
            return {
                attackResult: AttackResult.Hit,
                damage: {amount: deltaHp, type: DamageType.Healing},
                cost: 0,
                reaction: DamageReaction.NONE,
                position: self.position
            };
        },
        [StatusEffectHook.OnDamageTaken]: (self: Combatant, target: Combatant, damage: Damage) => {
            if(damage.amount >= 1 && (damage.type  === DamageType.Fire || damage.type === DamageType.Blight)) {
                self.removeStatusEffect(StatusEffectType.TROLL_REGENERATION);
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class ReloadStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.RELOAD;
    applicationHooks = {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}
