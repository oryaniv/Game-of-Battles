import { StatusEffect, StatusEffectType, StatusEffectHook, StatusEffectAlignment } from "../StatusEffect";
import { Combatant } from "../Combatant";
import { ActionResult, AttackResult, getStandardActionResult } from "../attackResult";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { CombatMaster } from "../CombatMaster";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect } from "../SpecialMove";
import { RangeCalculator } from "../RangeCalculator";
import { Board } from "../Board";
import { Position } from "../Position";
import { EnragedAIAgent } from "../AI/StatusAIAgent";
import { AIAgentType } from "../AI/AIAgent";
import { Doll } from "../Combatants/Fool";

export class BlockingStanceStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.BLOCKING_STANCE;
    applicationHooks =  {
        [StatusEffectHook.OnBeingAttacked]: (attacker: Combatant, defender: Combatant, damage: Damage, attackCost: number) => {
            if(damage.type !== DamageType.Crush && damage.type !== DamageType.Pierce && damage.type !== DamageType.Slash) {
                return;
            }

            const roll = Math.random();
            if (roll <= 0.7) {
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
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class FortifiedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FORTIFIED;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.removeStatusEffect(StatusEffectType.DEFENSE_DOWNGRADE);
            caster.stats.defensePower += 20;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.defensePower -= 20;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class StrengthBoostStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.STRENGTH_BOOST;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.removeStatusEffect(StatusEffectType.STRENGTH_DOWNGRADE);
            caster.stats.attackPower += 20;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.attackPower -= 20;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class MobilityBoostStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MOBILITY_BOOST;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.removeStatusEffect(StatusEffectType.SLOW);
            caster.stats.movementSpeed += 2;
            caster.stats.agility += 3;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.movementSpeed -= 2;
            caster.stats.agility -= 3;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class EncouragedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ENCOURAGED;
    applicationHooks = {
        [StatusEffectHook.OnTurnEnd]: (caster: Combatant, target: Combatant) => {
            const roll = Math.random();
            const extraActionChance = 0.2 + (caster.stats.luck * 0.02);
            if (roll <= extraActionChance) {
                return {
                    attackResult: AttackResult.NotFound,
                    damage: { amount: 0, type: DamageType.Unstoppable },
                    cost: -1, // Refund 1 action point
                    reaction: DamageReaction.NONE,
                    position: caster.position
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
            caster.stats.defensePower += 10;
            caster.stats.luck += 5;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.defensePower -= 10;
            caster.stats.luck -= 5;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class MesmerizingStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MESMERIZING;
    applicationHooks = {
        [StatusEffectHook.OnAttacking]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.MESMERIZING);
        },
        [StatusEffectHook.OnDefending]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.MESMERIZING);
        },
        [StatusEffectHook.OnSkillUsed]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.MESMERIZING);
        },
        [StatusEffectHook.OnMoving]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.MESMERIZING);
        },
        [StatusEffectHook.OnTurnEnd]: (self: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            const combatMaster = CombatMaster.getInstance();

            const getAllTargets: Position[] = board.getAreaOfEffectPositions(self, self.position, SpecialMoveAreaOfEffect.Great_Nova, SpecialMoveAlignment.Enemy);
            getAllTargets.filter(AOETarget => board.getCombatantAtPosition(AOETarget) !== null)
                         .filter(AOETarget => board.getCombatantAtPosition(AOETarget)?.team.getName() !== self.team.getName())
                         .forEach(AOETarget => {
                combatMaster.tryInflictStatusEffect(self, AOETarget, board, StatusEffectType.MESMERIZED, 1, 0.6);
            });
        } 
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class CircusDiaboliqueStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.CIRCUS_DIABOLIQUE;
    applicationHooks = {
        [StatusEffectHook.OnAttacking]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.CIRCUS_DIABOLIQUE);
        },
        [StatusEffectHook.OnDefending]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.CIRCUS_DIABOLIQUE);
        },
        [StatusEffectHook.OnSkillUsed]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.CIRCUS_DIABOLIQUE);
        },
        [StatusEffectHook.OnMoving]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.CIRCUS_DIABOLIQUE);
        },
        [StatusEffectHook.OnTurnEnd]: (self: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            const combatMaster = CombatMaster.getInstance();

            const getAllTargets: Position[] = board.getAreaOfEffectPositions(self, self.position, SpecialMoveAreaOfEffect.Great_Nova, SpecialMoveAlignment.Enemy);
            getAllTargets.filter(AOETarget => board.getCombatantAtPosition(AOETarget) !== null)
                         .filter(AOETarget => board.getCombatantAtPosition(AOETarget)?.team.getName() !== self.team.getName())
                         .forEach(AOETarget => {
                combatMaster.tryInflictStatusEffect(self, AOETarget, board, StatusEffectType.PANICKED, 1, 0.6);
            });
        } 
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class CloakedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.CLOAKED;  
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.stats.attackPower += 25;
        },
        [StatusEffectHook.OnDamageTaken]: (caster: Combatant, target: Combatant, damage: Damage) => {
            caster.removeStatusEffect(StatusEffectType.CLOAKED);
        },
        [StatusEffectHook.OnAfterAttacking]: (caster: Combatant, target: Combatant) => {
            caster.removeStatusEffect(StatusEffectType.CLOAKED);
        },
        [StatusEffectHook.OnBeingSteppedOn]: (caster: Combatant, target: Combatant, board: Board) => {
            caster.removeStatusEffect(StatusEffectType.CLOAKED);
        },
        [StatusEffectHook.OnSkillUsed]: (self: Combatant, target: Combatant, damage: Damage, amount: number, board: Board, skill: SpecialMove) => {
            if(typeof skill.breaksCloaking === 'undefined' || skill.breaksCloaking) {
                self.removeStatusEffect(StatusEffectType.CLOAKED);
            }
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.attackPower -= 25;
            // eslint-disable-next-line
            debugger;
            const doll = caster.getRelatedCombatants().find((combatant) => combatant instanceof Doll);
            if(doll) {
                // doll.takeDamage({amount: 100, type: DamageType.Unstoppable});
                doll.stats.hp = 0;
            }
        }
        
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}


export class FullMetalJacketStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FULL_METAL_JACKET;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.stats.defensePower += 20;
            if([DamageType.Crush, DamageType.Pierce, DamageType.Slash].includes(target.basicAttack().type)) {
                caster.stats.attackPower += 20;
            }
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.defensePower -= 20;
            if([DamageType.Crush, DamageType.Pierce, DamageType.Slash].includes(target.basicAttack().type)) {
                caster.stats.attackPower -= 20;
            }
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class IdaiNoHadouStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.IDAI_NO_HADOU;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.stats.agility += 10;
            caster.stats.luck += 10;
            caster.stats.movementSpeed += 2;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.agility -= 10;
            caster.stats.luck -= 10;
            caster.stats.movementSpeed -= 2;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class ShieldWallStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.SHIELD_WALL;
    applicationHooks = {
        [StatusEffectHook.OnAttacking]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.SHIELD_WALL);
        },
        [StatusEffectHook.OnDefending]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.SHIELD_WALL);
        },
        [StatusEffectHook.OnSkillUsed]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.SHIELD_WALL);
        },
        [StatusEffectHook.OnMoving]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.SHIELD_WALL);
        },
        [StatusEffectHook.OnTurnEnd]: (self: Combatant, target: Combatant, damage: Damage, amount: number, board: Board, skill: SpecialMove) => {
            const combatMaster = CombatMaster.getInstance();

            const getAllTargets: Position[] = board.getAreaOfEffectPositions(self, self.position, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.Enemy);
            getAllTargets.filter(AOETarget => board.getCombatantAtPosition(AOETarget) !== null)
                         .filter(AOETarget => board.getCombatantAtPosition(AOETarget)?.team.getName() !== self.team.getName())
                         .forEach(AOETarget => {
                if(board.getCombatantAtPosition(AOETarget)?.team.getName() === self.team.getName()) {
                    board.getCombatantAtPosition(AOETarget)?.applyStatusEffect({
                        name: StatusEffectType.SHIELD_WALL_PROTECTED,
                        duration: 1,
                    });
                }
            });
        } 
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class ShieldWallProtectedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.SHIELD_WALL_PROTECTED;
    applicationHooks = {
        [StatusEffectHook.OnMoving]: (caster: Combatant, target: Combatant) => { 
            caster.removeStatusEffect(StatusEffectType.SHIELD_WALL_PROTECTED);
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}


export class FrenzyStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FRENZY;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.stats.attackPower += 40;
            caster.insertAiAgent(new EnragedAIAgent());
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.attackPower -= 40;
            caster.removeAiAgent(AIAgentType.ENRAGED);
        },
        [StatusEffectHook.OnDeath]: (caster: Combatant, target: Combatant) => {
            caster.stats.hp = 1;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class SanctuaryStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DIVINE_RETRIBUTION;
    applicationHooks = {
        [StatusEffectHook.OnBeingAttacked]: (self: Combatant, defender: Combatant, damage: Damage, attackCost: number) => {
            return {attackResult: AttackResult.Blocked, damage: {amount: 0, type: DamageType.Unstoppable}, cost: attackCost * 2, reaction: DamageReaction.IMMUNITY, position: self.position};
        },
        [StatusEffectHook.OnAttacking]: (caster: Combatant, target: Combatant) => {
            caster.removeStatusEffect(StatusEffectType.SANCTUARY);
        },
        [StatusEffectHook.OnMoving]: (caster: Combatant, target: Combatant) => {
            caster.removeStatusEffect(StatusEffectType.SANCTUARY);
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class ArcaneOverchargeStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ARCANE_OVERCHARGE;
    applicationHooks = {
        
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class ArcaneBarrierStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ARCANE_BARRIER;
    applicationHooks = {
        [StatusEffectHook.OnDamageTaken]: (self: Combatant, target: Combatant, damage: Damage) => {
            // eslint-disable-next-line 
            debugger;
            const ArcaneBarrierStatusEffect = self.statusEffects.find(statusEffect => statusEffect.name === StatusEffectType.ARCANE_BARRIER);
            if(!ArcaneBarrierStatusEffect) {
                throw new Error("Arcane Overcharge Status Effect not found");
            }
            let damageToRestore = damage.amount;
            const newDuration = ArcaneBarrierStatusEffect.duration - damage.amount;
            if(newDuration > 0) {
                self.applyStatusEffect({
                    name: StatusEffectType.ARCANE_BARRIER,
                    duration: newDuration,
                });
            } else {
                damageToRestore = damageToRestore - Math.abs(newDuration);
                self.removeStatusEffect(StatusEffectType.ARCANE_BARRIER);
            }
            if(damageToRestore > 0) {
                self.stats.hp += damageToRestore;
            }
            return getStandardActionResult();
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class ArcaneConduitStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ARCANE_CONDUIT;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.applyStatusEffect({
                name: StatusEffectType.ARCANE_CHANNELING,
                duration: Number.POSITIVE_INFINITY,
            });
        },
        [StatusEffectHook.OnTurnStart]: (caster: Combatant, target: Combatant) => {
            caster.applyStatusEffect({
                name: StatusEffectType.ARCANE_CHANNELING,
                duration: Number.POSITIVE_INFINITY,
            });
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class DiamondSupremacyStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DIAMOND_SUPREMACY;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.stats.range = 3;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.range = 2;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}
