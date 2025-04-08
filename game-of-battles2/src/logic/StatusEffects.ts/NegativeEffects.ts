import { StatusEffectAlignment } from "../StatusEffect";

import { Combatant } from "../Combatant";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";

import { StatusEffect } from "../StatusEffect";
import { AttackResult, getStandardActionResult } from "../attackResult";
import { DamageType, Damage } from "../Damage";
import { DamageReaction } from "../Damage";
import { CombatMaster } from "../CombatMaster";

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