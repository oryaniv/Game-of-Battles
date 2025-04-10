import { StatusEffectAlignment } from "../StatusEffect";

import { Combatant } from "../Combatant";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";

import { StatusEffect } from "../StatusEffect";
import { AttackResult, getStandardActionResult } from "../attackResult";
import { DamageType, Damage } from "../Damage";
import { DamageReaction } from "../Damage";
import { CombatMaster } from "../CombatMaster";
import { Board } from "../Board";

export class ImmobilizedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.IMMOBILIZED;
    applicationHooks =  {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.stats.movementSpeed = Number.NEGATIVE_INFINITY;
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.stats.movementSpeed = self.baseStats.movementSpeed;
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class FrozenStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FROZEN;
    applicationHooks = {
        [StatusEffectHook.OnTurnStart]: (self: Combatant) => {
            return {
                attackResult: AttackResult.NotFound,
                damage: {
                    amount: 0,
                    type: DamageType.Unstoppable
                },
                cost: 1,
                reaction: DamageReaction.NONE
            };
        },
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.stats.agility = 0;
            self.stats.movementSpeed = Number.NEGATIVE_INFINITY;
            self.removeStatusEffect(StatusEffectType.DEFENDING);
            self.removeStatusEffect(StatusEffectType.BLOCKING_STANCE);
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.stats.agility = self.baseStats.agility;
            self.stats.movementSpeed = self.baseStats.movementSpeed;
        },
        [StatusEffectHook.OnAfterCalculateDamage]: (self: Combatant, attacker: Combatant, damage: Damage) => {
            self.removeStatusEffect(StatusEffectType.FROZEN);
            return {
                attackResult: AttackResult.NotFound,
                damage: {
                    amount: damage.type === DamageType.Crush ? damage.amount * 1.25 : damage.amount,
                    type: damage.type
                },
                cost: 1,
                reaction: DamageReaction.NONE
            };
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class StrengthDowngradeStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.STRENGTH_DOWNGRADE;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            target.stats.attackPower -= 20;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            target.stats.attackPower += 20;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class LuckDowngradeStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.LUCK_DOWNGRADE;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            target.stats.luck -= 5;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            target.stats.luck += 5;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class SlowStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.SLOW;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            target.stats.movementSpeed -= 2;
            target.stats.agility -= 3;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            target.stats.movementSpeed += 2;
            target.stats.agility += 3;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class PoisonedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.POISONED;
    applicationHooks = {
        [StatusEffectHook.OnTurnEnd]: (caster: Combatant, target: Combatant, board: Board) => {
            target.stats.hp -= 10;
            if(target.stats.hp <= 0) {
                target.stats.hp = 0;
                board.removeCombatant(target);
            }
            return {
                attackResult: AttackResult.Hit,
                damage: {
                    amount: 10,
                    type: DamageType.Blight
                },
                cost: 0,
                reaction: DamageReaction.NONE
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class BleedingStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.BLEEDING;
    applicationHooks = {
        [StatusEffectHook.OnTurnEnd]: (caster: Combatant, target: Combatant, board: Board) => {
            target.stats.hp -= 10;
            if(target.stats.hp <= 0) {
                target.stats.hp = 0;
                board.removeCombatant(target);
            }
            return {
                attackResult: AttackResult.Hit,
                damage: {
                    amount: 10,
                    type: DamageType.Pierce
                },
                cost: 0,
                reaction: DamageReaction.NONE
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}