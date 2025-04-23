import { StatusEffect, StatusEffectType, StatusEffectHook, StatusEffectAlignment } from "../StatusEffect";
import { Combatant } from "../Combatant";
import { ActionResult, AttackResult, getStandardActionResult } from "../attackResult";
import { Damage, DamageReaction, DamageType } from "../Damage";

export class BlockingStanceStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.BLOCKING_STANCE;
    applicationHooks =  {
        [StatusEffectHook.OnBeingAttacked]: (attacker: Combatant, defender: Combatant, damage: Damage, attackCost: number) => {
            if(damage.type !== DamageType.Crush && damage.type !== DamageType.Pierce && damage.type !== DamageType.Slash) {
                return;
            }

            const roll = Math.random();
            if (roll < 0.5) {
                return {attackResult: AttackResult.Blocked, damage: {amount: 0, type: DamageType.Unstoppable}, cost: attackCost * 2, reaction: DamageReaction.IMMUNITY};
            }
            return;
        },
        [StatusEffectHook.OnAttacking]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.BLOCKING_STANCE);
        },
        [StatusEffectHook.OnDefending]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.BLOCKING_STANCE);
        },
        [StatusEffectHook.OnSkillUsed]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.BLOCKING_STANCE);
        },
        [StatusEffectHook.OnMoving]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.BLOCKING_STANCE);
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}


export class ArcaneChannelingStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ARCANE_CHANNELING;
    applicationHooks =  {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}


export class FocusAimStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FOCUS_AIM;
    applicationHooks =  {
        [StatusEffectHook.OnAttacking]: (self: Combatant) => {
            self.stats.attackPower += 25;
            self.stats.agility += 5;
        },
        [StatusEffectHook.OnAfterAttacking]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.FOCUS_AIM);
            self.stats.attackPower -= 25;
            self.stats.agility -= 5;
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}


export class RegeneratingStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.REGENERATING;
    applicationHooks = {
        [StatusEffectHook.OnTurnStart]: (self: Combatant) => {
            const newHp = Math.min(self.stats.hp + 8, self.baseStats.hp);
            const deltaHp = newHp - self.stats.hp;
            self.stats.hp = newHp;
            // eslint-disable-next-line
            debugger;
            return {
                attackResult: AttackResult.Hit,
                damage: {amount: deltaHp, type: DamageType.Healing},
                cost: 0,
                reaction: DamageReaction.NONE,
                position: self.position
            };
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class FortifiedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FORTIFIED;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            // eslint-disable-next-line
            debugger;
            target.stats.defensePower += 20;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            target.stats.defensePower -= 20;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class StrengthBoostStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.STRENGTH_BOOST;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            target.stats.attackPower += 20;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            target.stats.attackPower -= 20;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class MobilityBoostStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MOBILITY_BOOST;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            target.stats.movementSpeed += 3;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            target.stats.movementSpeed -= 3;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class EncouragedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ENCOURAGED;
    applicationHooks = {
        [StatusEffectHook.OnTurnEnd]: (caster: Combatant, target: Combatant) => {
            const roll = Math.random();
            if (roll <= 0.2) {
                return {
                    attackResult: AttackResult.Hit,
                    damage: { amount: 0, type: DamageType.Unstoppable },
                    cost: -1, // Refund 1 action point
                    reaction: DamageReaction.NONE,
                    position: target.position
                };
            }
            return undefined;
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class RalliedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.RALLIED;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            target.stats.defensePower += 10;
            target.stats.luck += 5;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            target.stats.defensePower -= 10;
            target.stats.luck -= 5;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}
