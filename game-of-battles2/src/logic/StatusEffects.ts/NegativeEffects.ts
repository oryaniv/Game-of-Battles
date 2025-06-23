import { StatusEffectAlignment } from "../StatusEffect";
import { Combatant } from "../Combatant";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";
import { StatusEffect } from "../StatusEffect";
import { AttackResult, getStandardActionResult } from "../attackResult";
import { DamageType, Damage } from "../Damage";
import { DamageReaction } from "../Damage";
import { CombatMaster } from "../CombatMaster";
import { Board } from "../Board";
import { CharmedAIAgent, PanickedAIAgent, StunLockedAIAgent, TauntedAIAgent } from "../AI/StatusAIAgent";
import { AIAgentType } from "../AI/AIAgent";
import {STAT_BUFF_INCREASE_ENABLED, ATTACK_DEFENSE_INCREASE_AMOUNT, AGILITY_LUCK_INCREASE_AMOUNT} from "../LogicFlags";

export class ImmobilizedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.IMMOBILIZED;
    description = `Unable to move`;
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
    description = `This combatant cannot act, and is weak to crush damage. Removed by being attacked.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.stats.agility = 0;
            self.stats.movementSpeed = Number.NEGATIVE_INFINITY;
            self.removeStatusEffect(StatusEffectType.DEFENDING);
            self.removeStatusEffect(StatusEffectType.BLOCKING_STANCE);
            self.insertAiAgent(new StunLockedAIAgent("Frozen"));
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.stats.agility = self.baseStats.agility;
            self.stats.movementSpeed = self.baseStats.movementSpeed;
            self.removeAiAgent(AIAgentType.STUNLOCKED);
        },
        [StatusEffectHook.OnAfterCalculateDamage]: (self: Combatant, attacker: Combatant, damage: Damage) => {
            self.removeStatusEffect(StatusEffectType.FROZEN);
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class StrengthDowngradeStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.STRENGTH_DOWNGRADE;
    description = `Attack power is reduced.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.STRENGTH_BOOST);
            self.stats.attackPower -= STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 20 : 20;
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.stats.attackPower += STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 20 : 20;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class DefenseDowngradeStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DEFENSE_DOWNGRADE;
    description = `Defense is reduced.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.FORTIFIED);
            self.stats.defensePower -= STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 20 : 20;
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.stats.defensePower += STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 20 : 20;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class LuckDowngradeStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.LUCK_DOWNGRADE;
    description = `Luck is reduced.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.stats.luck -= STAT_BUFF_INCREASE_ENABLED ? AGILITY_LUCK_INCREASE_AMOUNT + 5 : 5;
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.stats.luck += STAT_BUFF_INCREASE_ENABLED ? AGILITY_LUCK_INCREASE_AMOUNT + 5 : 5;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class StaggeredStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.STAGGERED;
    description = `Agility is slightly reduced.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.stats.agility -= 5;
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.stats.agility += 5;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class SlowStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.SLOW;
    description = `Movement speed and agility are both reduced.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.MOBILITY_BOOST);
            self.stats.movementSpeed -= 2;
            self.stats.agility -= STAT_BUFF_INCREASE_ENABLED ? AGILITY_LUCK_INCREASE_AMOUNT + 3 : 3;
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.stats.movementSpeed += 2;
            self.stats.agility += STAT_BUFF_INCREASE_ENABLED ? AGILITY_LUCK_INCREASE_AMOUNT + 3 : 3;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class PoisonedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.POISONED;
    description = `Suffer 10 blight damage at the end of each turn.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            if(!self.isOrganic()) {
                self.removeStatusEffect(StatusEffectType.POISONED);
            }
        },
        [StatusEffectHook.OnTurnEnd]: (self: Combatant, target: Combatant, board: Board) => {
            self.takeDamage({amount: 10, type: DamageType.Blight}, board);
            if(self.stats.hp <= 0) {
                self.stats.hp = 0;
            }
            return {
                attackResult: AttackResult.Hit,
                damage: {
                    amount: 10,
                    type: DamageType.Blight
                },
                cost: 0,
                reaction: DamageReaction.NONE,
                position: self.position
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class BleedingStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.BLEEDING;
    description = `Suffer 10 pierce damage at the end of each turn.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            if(!self.isOrganic()) {
                self.removeStatusEffect(StatusEffectType.BLEEDING);
            }
        },
        [StatusEffectHook.OnTurnEnd]: (caster: Combatant, target: Combatant, board: Board) => {
            // caster.stats.hp -= 10;
            caster.takeDamage({amount: 10, type: DamageType.Pierce}, board);
            if(caster.stats.hp <= 0) {
                caster.stats.hp = 0;
                // board.removeCombatant(caster);
            }
            return {
                attackResult: AttackResult.Hit,
                damage: {
                    amount: 10,
                    type: DamageType.Pierce
                },
                cost: 0,
                reaction: DamageReaction.NONE,
                position: caster.position
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class TauntedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.TAUNTED;
    description = `This combatant is taunted by an enemy, and is dead set to chase and attack it. Also has a it's defense and agility slightly reduced.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            if(!caster.isOrganic()) {
                caster.removeStatusEffect(StatusEffectType.TAUNTED);
                return;
            }
            caster.insertAiAgent(new TauntedAIAgent(target));
            caster.stats.agility -= 5;
            caster.stats.defensePower -= 15;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            if(!caster.isOrganic()) {
                return;
            }
            caster.removeAiAgent(AIAgentType.TAUNTED);
            caster.stats.agility += 5;
            caster.stats.defensePower += 15;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class StupefiedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.STUPEFIED;
    description = `Cannot use skills`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            if(!caster.isOrganic()) {
                caster.removeStatusEffect(StatusEffectType.STUPEFIED);
                return;
            }
            caster.removeStatusEffect(StatusEffectType.FOCUS_AIM);
            caster.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
        },  
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class NauseatedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.NAUSEATED;
    description = `Unable to act. May be removed at the start of each turn.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant, target: Combatant) => {
            if(!self.isOrganic()) {
                self.removeStatusEffect(StatusEffectType.NAUSEATED);
                return;
            }
            self.removeStatusEffect(StatusEffectType.CLOAKED);
            self.removeStatusEffect(StatusEffectType.MESMERIZING);
            self.removeStatusEffect(StatusEffectType.CIRCUS_DIABOLIQUE);
            self.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
            self.removeStatusEffect(StatusEffectType.FOCUS_AIM);
            self.insertAiAgent(new StunLockedAIAgent("Nauseated"));
        },
        [StatusEffectHook.OnTurnStart]: (self: Combatant) => {
            const chanceWithDelta = 0.5 - ((self.stats.luck) * 0.02);
            if(Math.random() < chanceWithDelta) {
                return;
            }
            self.removeStatusEffect(StatusEffectType.NAUSEATED);
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            if(!self.isOrganic()) {
                return;
            }
            self.aiAgent && self.removeAiAgent(AIAgentType.STUNLOCKED);
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}       

export class MesmerizedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MESMERIZED;
    description = `Unable to act. Removed by taking damage.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            if(!caster.isOrganic()) {
                caster.removeStatusEffect(StatusEffectType.MESMERIZED);
                return;
            }
            caster.removeStatusEffect(StatusEffectType.DEFENDING);
            caster.removeStatusEffect(StatusEffectType.BLOCKING_STANCE);
            caster.removeStatusEffect(StatusEffectType.FOCUS_AIM);
            caster.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
            caster.removeStatusEffect(StatusEffectType.CLOAKED);
            caster.removeStatusEffect(StatusEffectType.MESMERIZING);
            caster.removeStatusEffect(StatusEffectType.CIRCUS_DIABOLIQUE);
            caster.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
            caster.removeStatusEffect(StatusEffectType.SHIELD_WALL);
            caster.removeStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL);
            caster.insertAiAgent(new StunLockedAIAgent("Mesmerized"));
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant) => {
            if(!caster.isOrganic()) {
                return;
            }
            caster.removeAiAgent(AIAgentType.STUNLOCKED);
        },
        [StatusEffectHook.OnDamageTaken]: (caster: Combatant, damage: Damage) => {
            caster.removeStatusEffect(StatusEffectType.MESMERIZED);
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class NightmareLockedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.NIGHTMARE_LOCKED;
    description = `Unable to act, and takes 10 blight damage at the end of each turn. will not be removed by taking damage.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            if(!caster.isOrganic()) {
                caster.removeStatusEffect(StatusEffectType.NIGHTMARE_LOCKED);
                return;
            }
            caster.removeStatusEffect(StatusEffectType.DEFENDING);
            caster.removeStatusEffect(StatusEffectType.BLOCKING_STANCE);
            caster.removeStatusEffect(StatusEffectType.FOCUS_AIM);
            caster.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
            caster.removeStatusEffect(StatusEffectType.CLOAKED);
            caster.removeStatusEffect(StatusEffectType.MESMERIZING);
            caster.removeStatusEffect(StatusEffectType.CIRCUS_DIABOLIQUE);
            caster.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
            caster.removeStatusEffect(StatusEffectType.SHIELD_WALL);
            caster.removeStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL);
            caster.insertAiAgent(new StunLockedAIAgent("Nightmare Locked"));
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant) => {
            if(!caster.isOrganic()) {
                return;
            }
            caster.removeAiAgent(AIAgentType.STUNLOCKED);
        },
        [StatusEffectHook.OnTurnStart]: (caster: Combatant) => {
            caster.takeDamage({amount: 10, type: DamageType.Dark});
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class MarkedForPainStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MARKED_FOR_PAIN;
    description = `This combatant was marked by an assassin, and will take 25% more damage from their next attack.`;
    applicationHooks = {
        [StatusEffectHook.OnBeingAttacked]: (self: Combatant, attacker: Combatant) => {
            if(attacker.specialMoves.map(m => m.name).includes("Assassin's Mark" )) {
                self.applyStatusEffect({
                    name: StatusEffectType.MARKED_DETONATED,
                    duration: 0,
                });
            }
        },
        [StatusEffectHook.OnAfterCalculateDamage]: (self: Combatant, attacker: Combatant, damage: Damage) => {
            if(!self.hasStatusEffect(StatusEffectType.MARKED_DETONATED)) {
                return getStandardActionResult();
            }
            self.removeStatusEffect(StatusEffectType.MARKED_FOR_PAIN);
            self.removeStatusEffect(StatusEffectType.MARKED_DETONATED);
            return {
                attackResult: AttackResult.NotFound,
                damage: {
                    amount: damage.amount * 1.25,
                    type: damage.type
                },
                cost: 1,
                reaction: DamageReaction.NONE
            };
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}   

export class MarkedForExecutionStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MARKED_FOR_EXECUTION;
    description = `This combatant was marked twiceby an assassin, and will take 50% more damage from their next attack.`;
    applicationHooks = {
        [StatusEffectHook.OnBeingAttacked]: (self: Combatant, attacker: Combatant) => {
            if(attacker.specialMoves.map(m => m.name).includes("Assassin's Mark" )) {
                self.applyStatusEffect({
                    name: StatusEffectType.MARKED_DETONATED,
                    duration: 0,
                });
            }
        },
        [StatusEffectHook.OnAfterCalculateDamage]: (self: Combatant, attacker: Combatant, damage: Damage) => {
 
            if(!self.hasStatusEffect(StatusEffectType.MARKED_DETONATED)) {
                return getStandardActionResult();
            }
            self.removeStatusEffect(StatusEffectType.MARKED_FOR_EXECUTION);
            self.removeStatusEffect(StatusEffectType.MARKED_DETONATED);
            return {
                attackResult: AttackResult.NotFound,
                damage: {
                    amount: damage.amount * 1.5,
                    type: damage.type
                },
                cost: 1,
                reaction: DamageReaction.NONE
            };
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class MarkedForOblivionStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MARKED_FOR_OBLIVION;
    description = `This combatant was marked thrice by an assassin, and will take 100% more damage from their next attack.`;
    applicationHooks = {
        [StatusEffectHook.OnBeingAttacked]: (self: Combatant, attacker: Combatant) => {
            if(!self.isDefending() && attacker.specialMoves.map(m => m.name).includes("Assassin's Mark" )) {
                self.applyStatusEffect({
                    name: StatusEffectType.MARKED_DETONATED,
                    duration: 0,
                });
            }
        },
        [StatusEffectHook.OnAfterCalculateDamage]: (self: Combatant, attacker: Combatant, damage: Damage) => {
            if(!self.hasStatusEffect(StatusEffectType.MARKED_DETONATED)) {
                return getStandardActionResult();
            }
            self.removeStatusEffect(StatusEffectType.MARKED_FOR_OBLIVION);
            self.removeStatusEffect(StatusEffectType.MARKED_DETONATED);
            return {
                attackResult: AttackResult.NotFound,
                damage: {
                    amount: damage.amount * 2 ,
                    type: damage.type
                },
                cost: 1,
                reaction: DamageReaction.NONE
            };
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}   


export class MarkedDetonatedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MARKED_DETONATED;
    description = ``;
    isVisible: boolean = false;
    applicationHooks = {
        [StatusEffectHook.OnBeingMissed]: (self: Combatant, attacker: Combatant) => {
            self.removeStatusEffect(StatusEffectType.MARKED_DETONATED);
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class PanickedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.PANICKED;
    description = `This combatant is panicked, and will flee from the closest enemy.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            if(!self.isOrganic()) {
                self.removeStatusEffect(StatusEffectType.PANICKED);
                return;
            }
            self.insertAiAgent(new PanickedAIAgent());
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            if(!self.isOrganic()) {
                return;
            }
            self.removeAiAgent(AIAgentType.PANICKED);
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class CharmedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.CHARMED;
    description = `This combatant is charmed by an enemy, will attack its allies, and aid its enemies.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            if(!self.isOrganic()) {
                self.removeStatusEffect(StatusEffectType.CHARMED);
                return;
            }
            self.insertAiAgent(new CharmedAIAgent());
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            if(!self.isOrganic()) {
                return;
            }
            self.removeAiAgent(AIAgentType.CHARMED);
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class ForbiddenAfflictionStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FORBIDDEN_AFFLICTION;
    description = `This combatant is afflicted by a forbidden affliction. Any step of movement or attack will inclict dark damage on it.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            if(!self.isOrganic()) {
                self.removeStatusEffect(StatusEffectType.FORBIDDEN_AFFLICTION);
                return;
            }
        },
        [StatusEffectHook.OnMoving]: (self: Combatant, attacker: Combatant, damage: Damage, amount: number, board: Board) => {
            self.takeDamage({amount: amount * 6, type: DamageType.Dark});
        },
        [StatusEffectHook.OnAttacking]: (self: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            self.takeDamage({amount: 6, type: DamageType.Dark});
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class DivineRetributionStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DIVINE_RETRIBUTION;
    description = `This combatant is afflicted by divine retribution, and will suffer half of any direct damage it inflicts.`;
    applicationHooks = {
        [StatusEffectHook.OnInflictingDamage]: (self: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {

            const damageAmount = damage.amount * 0.5;
            self.takeDamage({amount: damageAmount, type: DamageType.Unstoppable});
            return {
                attackResult: AttackResult.Hit,
                damage: {amount: damageAmount, type: DamageType.Unstoppable},
                cost: 0,
                reaction: DamageReaction.NONE,
                position: self.position
            }
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class PlaguedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.PLAGUED;
    description = `This combatant is afflicted by plague, will suffer 10 blight damage at the end of each turn, and spread the plague to adjacent allies.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            if(!self.isOrganic()) {
                self.removeStatusEffect(StatusEffectType.PLAGUED);
                return;
            }
        },
        [StatusEffectHook.OnTurnEnd]: (self: Combatant, target: Combatant, board: Board) => {
            self.takeDamage({amount: 10, type: DamageType.Blight}, board);
            if(self.stats.hp <= 0) {
                self.stats.hp = 0;
            }
            return {
                attackResult: AttackResult.Hit,
                damage: {
                    amount: 10,
                    type: DamageType.Blight
                },
                cost: 0,
                reaction: DamageReaction.NONE,
                position: self.position
            }
        },
        [StatusEffectHook.OnTurnStart]: (self: Combatant) => {
            const selfTeam = self.team;
            const adjacentCombatants = selfTeam.combatants.filter((combatant) => {
                const selfPosition = self.position;
                const combatantPosition = combatant.position;
                return combatantPosition.y === selfPosition.y && combatantPosition.x === selfPosition.x + 1 ||
                combatantPosition.y === selfPosition.y && combatantPosition.x === selfPosition.x - 1 ||
                combatantPosition.x === selfPosition.x && combatantPosition.y === selfPosition.y + 1 ||
                combatantPosition.x === selfPosition.x && combatantPosition.y === selfPosition.y - 1;
            });
            adjacentCombatants.forEach((combatant) => {
                combatant.applyStatusEffect({
                    name: StatusEffectType.PLAGUED,
                    duration: 3,
                });
            });
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class BurningStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.BURNING;
    description = `Suffer 10 fire damage at the end of each turn.`;
    applicationHooks = {
        [StatusEffectHook.OnTurnEnd]: (self: Combatant, target: Combatant, board: Board) => {
            self.takeDamage({amount: 10, type: DamageType.Fire}, board);
            if(self.stats.hp <= 0) {
                self.stats.hp = 0;
            }
            return {
                attackResult: AttackResult.Hit,
                damage: {
                    amount: 10,
                    type: DamageType.Fire
                },
                cost: 0,
                reaction: DamageReaction.NONE,
                position: self.position
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class DiamondHookedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DIAMOND_HOOKED;
    description = `This combatant is held captive by a diamond hook. Will be attacked by the captor if it moves, or if it tries to attack the captor.`;
    applicationHooks = {
        [StatusEffectHook.OnMoving]: (self: Combatant, attacker: Combatant, damage: Damage, amount: number, board: Board) => {
            const holder = self.getRelatedCombatants()['DIAMOND_HOOKED'];
            if(holder && board.isInMeleeRange(holder, self)) {
                const combatMaster = CombatMaster.getInstance();
                const result = combatMaster.executeAttack(holder, self.position, board, holder.basicAttack());
                return result;
            }
        },
        [StatusEffectHook.OnDeath]: (self: Combatant) => {
            const holder = self.getRelatedCombatants()['DIAMOND_HOOKED'];
            if(holder) {
                holder.removeStatusEffect(StatusEffectType.DIAMOND_HOOKED_HOLDING);
                holder.removeRelatedCombatant('DIAMOND_HOOKED_HOLDING');
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class SleepingStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.SLEEPING;
    description = `Combatant cannot act. Next melee attack on it will be a critical hit. Removed by taking damage.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            if(!self.isOrganic()) {
                self.removeStatusEffect(StatusEffectType.PANICKED);
                return;
            }
            self.insertAiAgent(new StunLockedAIAgent('Sleeping'));
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            if(!self.isOrganic()) {
                return;
            }
            self.removeAiAgent(AIAgentType.STUNLOCKED);
        },
        [StatusEffectHook.OnDamageTaken]: (self: Combatant, target: Combatant, damage: Damage) => {

            if(damage.amount > 0) {
                self.removeStatusEffect(StatusEffectType.SLEEPING);
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}