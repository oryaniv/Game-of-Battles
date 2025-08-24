import { StatusEffect, StatusEffectType, StatusEffectHook, StatusEffectAlignment } from "../StatusEffect";
import { Combatant } from "../Combatant";
import { ActionResult, AttackResult, getDamageActionResult, getStandardActionResult, getMissActionResult } from "../attackResult";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { CombatMaster } from "../CombatMaster";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect } from "../SpecialMove";
import { RangeCalculator } from "../RangeCalculator";
import { Board } from "../Board";
import { Position } from "../Position";
import { EnragedAIAgent } from "../AI/StatusAIAgent";
import { AIAgentType } from "../AI/AIAgent";
import { Doll } from "../Combatants/Fool";
import { ReplacementPart } from "../SpecialMoves/Singular/Self";
import {STAT_BUFF_INCREASE_ENABLED, ATTACK_DEFENSE_INCREASE_AMOUNT, AGILITY_LUCK_INCREASE_AMOUNT} from "../LogicFlags";
import { emitter } from "@/eventBus";

export class BlockingStanceStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.BLOCKING_STANCE;
    description: string = "Incoming physical attacks have a 70% chance to be blocked. removed upon any action but skip";
    applicationHooks =  {
        [StatusEffectHook.OnBeingAttacked]: (attacker: Combatant, defender: Combatant, damage: Damage, attackCost: number) => {
            if(damage.type !== DamageType.Crush && damage.type !== DamageType.Pierce && damage.type !== DamageType.Slash) {
                return;
            }

            const roll = Math.random();
            if (roll <= 0.7) {
                return {
                    attackResult: AttackResult.Blocked,
                    damage: {
                        amount: 0,
                        type: DamageType.None
                    },
                    cost: attackCost * 2,
                    reaction: DamageReaction.IMMUNITY,
                    position: defender.position,
                    statusEffectType: StatusEffectType.BLOCKING_STANCE
                };
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
    description: string = "Allows the use of higher Tier spells, and augments others. Removed after casting a spell that requires it.";
    name: StatusEffectType = StatusEffectType.ARCANE_CHANNELING;
    applicationHooks =  {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}


export class FocusAimStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FOCUS_AIM;
    description: string = "Increases attack power and accuracy for the next attack.";
    applicationHooks =  {
        [StatusEffectHook.OnAttacking]: (self: Combatant) => {
            self.stats.attackPower += STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 25 : 25;
            self.stats.agility += STAT_BUFF_INCREASE_ENABLED ? AGILITY_LUCK_INCREASE_AMOUNT + 5 : 5;
        },
        [StatusEffectHook.OnAfterAttacking]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.FOCUS_AIM);
            self.stats.attackPower -= STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 25 : 25;
            self.stats.agility -= STAT_BUFF_INCREASE_ENABLED ? AGILITY_LUCK_INCREASE_AMOUNT + 5 : 5;
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}


export class RegeneratingStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.REGENERATING;
    description: string = "Regenerates a small amount of health at the start of each turn.";
    applicationHooks = {
        [StatusEffectHook.OnTurnStart]: (self: Combatant) => {
            if(!self.isOrganic()) {
                return;
            }

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
    description: string = "Increases defense considerably";
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.removeStatusEffect(StatusEffectType.DEFENSE_DOWNGRADE);
            caster.stats.defensePower += STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 20 : 20;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.defensePower -= STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 20 : 20;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class StrengthBoostStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.STRENGTH_BOOST;
    description: string = "Increases attack power considerably";
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.removeStatusEffect(StatusEffectType.STRENGTH_DOWNGRADE);
            caster.stats.attackPower += STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 20 : 20;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.attackPower -= STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 20 : 20;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class MobilityBoostStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MOBILITY_BOOST;
    description: string = "Increases movement speed and agility";
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.removeStatusEffect(StatusEffectType.SLOW);
            caster.stats.movementSpeed += 2;
            caster.stats.agility += STAT_BUFF_INCREASE_ENABLED ? AGILITY_LUCK_INCREASE_AMOUNT + 3 : 3;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.movementSpeed -= 2;
            caster.stats.agility -= STAT_BUFF_INCREASE_ENABLED ? AGILITY_LUCK_INCREASE_AMOUNT + 3 : 3;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class EncouragedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ENCOURAGED;
    description: string = "Gives a 20% chance to gain an extra action point at the end of each turn. chance further increases by the luck stat";
    applicationHooks = {
        [StatusEffectHook.OnTurnEnd]: (caster: Combatant, target: Combatant, board: Board) => {
            const roll = Math.random();
            const extraActionChance = 0.2 + (caster.stats.luck * 0.02);
            if (roll <= extraActionChance) {
                return {
                    attackResult: AttackResult.NotFound,
                    damage: { amount: NaN, type: DamageType.None },
                    cost: -1, // Refund 1 action point
                    reaction: DamageReaction.NONE,
                    position: caster.position,
                    statusEffectType: StatusEffectType.ENCOURAGED
                };
            }
            return undefined;
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class RalliedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.RALLIED;
    description: string = "Increases both defense and luck";
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.stats.defensePower += STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 10 : 10;
            caster.stats.luck += STAT_BUFF_INCREASE_ENABLED ? AGILITY_LUCK_INCREASE_AMOUNT + 5 : 5;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.defensePower -= STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 10 : 10;
            caster.stats.luck -= STAT_BUFF_INCREASE_ENABLED ? AGILITY_LUCK_INCREASE_AMOUNT + 5 : 5;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class MesmerizingStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MESMERIZING;
    description: string = "enemies in a 2-tile radius have a medium chance to become mesmerized and unable to act for 1 turn. removed upon any action but skip";
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
                const hit = combatMaster.tryInflictStatusEffect(self, AOETarget, board, StatusEffectType.MESMERIZED, 1, 0.6);
                if(!hit) {
                    emitter.emit('trigger-method', getMissActionResult(AOETarget, 1));
                }
            });
        } 
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class CircusDiaboliqueStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.CIRCUS_DIABOLIQUE;
    description: string = "enemies in a 2-tile radius have a medium chance to become trapped in a nightmare for 2 turns, unable to act and slowly decay. removed upon any action but skip";
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
                const hit = combatMaster.tryInflictStatusEffect(self, AOETarget, board, StatusEffectType.NIGHTMARE_LOCKED, 2, 0.6);
                if(!hit) {
                    emitter.emit('trigger-method', getMissActionResult(AOETarget, 1));
                }
            });
        } 
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class CloakedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.CLOAKED;  
    description: string = "Invisible to enemies, cannot be targeted, but can still be hit by Area of Effect attacks. Can also be found if an enemy tries to move to their position. Attacking and most skills break cloaking.";
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.stats.attackPower += 30;
            caster.stats.agility += 10;
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
            caster.stats.attackPower -= 30;
            caster.stats.agility -= 10;

            const doll = caster.getRelatedCombatants()["doll"];
            if(doll) {
                doll.stats.hp = 0;
                caster.removeRelatedCombatant("doll");
            }
        }
        
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}


export class FullMetalJacketStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FULL_METAL_JACKET;
    description: string = "Increases defense, and also attack power for any physical combatant. allows you to be repaired like a machine, and gives you the replacement part skill. Also adds weakness to lightning";
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.stats.defensePower += STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 15 : 20;
            if([DamageType.Crush, DamageType.Pierce, DamageType.Slash].includes(target.basicAttack().type)) {
                caster.stats.attackPower += STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 15 : 20;
            }
            if(caster.isOrganic()) {       
                caster.specialMoves.push(new ReplacementPart());
            }
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.defensePower -= STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 15 : 20;
            if([DamageType.Crush, DamageType.Pierce, DamageType.Slash].includes(target.basicAttack().type)) {
                caster.stats.attackPower -= STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 15 : 20;
            }
            caster.specialMoves = caster.specialMoves.filter(move => move.name !== "Replacement Part");
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class IdaiNoHadouStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.IDAI_NO_HADOU;
    description: string = "Increases agility, luck, and movement speed. Also allows the use of the Vengeful Angel skill";
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
    description = `All physical damage for this combatant is halved, and cannot be hit in weakness or suffer critical by physical attacks. this and any statuses born of it will be removed by any action except skip`;
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
        [StatusEffectHook.OnDeath]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.SHIELD_WALL);
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            removeShieldWallRelatedCombatants(self);
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

function removeShieldWallRelatedCombatants(self: Combatant) {
    Object.keys(self.relatedCombatants)
        .filter(key => key.startsWith('SHIELD_WALL_PROTECTED_'))
        .forEach(key => {
            const relatedCombatant = self.relatedCombatants[key];
            if(relatedCombatant) {
                relatedCombatant.removeStatusEffect(StatusEffectType.SHIELD_WALL_PROTECTED);
            }
            delete self.relatedCombatants[key];
    });
}

export class ShieldWallProtectedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.SHIELD_WALL_PROTECTED;
    description = `This combatant is protected by a shield wall. all physical damage to it is halved, and cannot be hit in weakness or suffer critical by physical attacks. 
    removed by moving or if the shield wall invoker loses shield wall status`;
    applicationHooks = {
        [StatusEffectHook.OnMoving]: (caster: Combatant, target: Combatant) => { 
            caster.removeStatusEffect(StatusEffectType.SHIELD_WALL_PROTECTED);
            caster.removeRelatedCombatant('SHIELD_WALL');
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class ArcaneShieldWallStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ARCANE_SHIELD_WALL;
    description = `All damage except unstoppable for this combatant is halved, and cannot be hit in weakness or suffer critical hits. this and any statuses born of it will be removed by any action except skip`;
    applicationHooks = {
        [StatusEffectHook.OnAttacking]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL);
        },
        [StatusEffectHook.OnDefending]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL);

        },
        [StatusEffectHook.OnSkillUsed]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL);
        },
        [StatusEffectHook.OnMoving]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL);
        },
        [StatusEffectHook.OnDeath]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL);
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            removeArcaneShieldWallRelatedCombatants(self);
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

function removeArcaneShieldWallRelatedCombatants(self: Combatant) {
    Object.keys(self.relatedCombatants)
        .filter(key => key.startsWith('ARCANE_SHIELD_WALL_PROTECTED_'))
        .forEach(key => {
            const relatedCombatant = self.relatedCombatants[key];
            if(relatedCombatant) {
                relatedCombatant.removeStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED);
            }
            delete self.relatedCombatants[key];
    });
}

export class ArcaneShieldWallProtectedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED;
    description = `This combatant is protected by an arcane shield wall. all damage to it except unstoppable is halved, and it cannot be hit in weakness or suffer critical hits. 
    Removed by moving or if the Arcane shield wall invoker loses Arcane shield wall status`;
    applicationHooks = {
        [StatusEffectHook.OnMoving]: (caster: Combatant, target: Combatant) => { 
            caster.removeStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED);
            caster.removeRelatedCombatant('ARCANE_SHIELD_WALL');
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}


export class FrenzyStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FRENZY;
    description = `Combatant gains dramatic attack power increase, and cannot die, but loses control and will attack the closest target, including allies.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.stats.attackPower += STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 40 : 40;
            caster.insertAiAgent(new EnragedAIAgent());
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.attackPower -= STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 40 : 40;
            caster.removeAiAgent(AIAgentType.ENRAGED);
        },
        [StatusEffectHook.OnDeath]: (caster: Combatant, target: Combatant) => {
            caster.stats.hp = 1;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class SanctuaryStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.SANCTUARY;
    description = `All attacks against this combatant are blocked, except unstoppable damage. Sanctuary is removed upon moving or attacking, including attack-based skills`;
    applicationHooks = {
        [StatusEffectHook.OnBeingAttacked]: (self: Combatant, defender: Combatant, damage: Damage, attackCost: number) => {
            //return {attackResult: AttackResult.Blocked, damage: {amount: 0, type: DamageType.Unstoppable}, cost: attackCost * 2, reaction: DamageReaction.IMMUNITY, position: self.position};
            return {
                attackResult: AttackResult.Blocked,
                damage: {
                    amount: 0,
                    type: DamageType.None
                },
                cost: attackCost * 2,
                reaction: DamageReaction.IMMUNITY,
                position: self.position,
                statusEffectType: StatusEffectType.SANCTUARY
            };
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
    description = `This combatant is charged with immense power. Next spell will be considerably stronger and may have additional effects.`;
    applicationHooks = {
        
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class ArcaneBarrierStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ARCANE_BARRIER;
    description = `Protected by a magical barrier. All damage will be soaked by the barrier until it breaks.
    Does not soak unstoppable damage.`;
    applicationHooks = {
        [StatusEffectHook.OnDamageTaken]: (self: Combatant, target: Combatant, damage: Damage) => {

            const ArcaneBarrierStatusEffect = self.statusEffects.find(statusEffect => statusEffect.name === StatusEffectType.ARCANE_BARRIER);
            if(!ArcaneBarrierStatusEffect) {
                throw new Error("Arcane Barrier Status Effect not found");
            }
            if(damage.type === DamageType.Unstoppable) {
                return getStandardActionResult();
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
                self.stats.hp = Math.min(self.stats.hp + damageToRestore, self.baseStats.hp);
            }
            return getStandardActionResult();
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class ArcaneConduitStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ARCANE_CONDUIT;
    description = `This combatant is granted arcane power from an ally, and will gain Arcane channeling status effect every turn until this status ends.`;
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
    description = ``;
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

export class GuardianStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.GUARDIAN;
    description = `This combatant is a guardian of an ally. Any damage taken by the ally is instead inflicted on the guardian, but halved.`;
    applicationHooks = {
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            const guardianProtected = target.getRelatedCombatants()['GUARDIAN_PROTECTED'];
            if(guardianProtected && !guardianProtected.isKnockedOut()) {
                guardianProtected.removeStatusEffect(StatusEffectType.GUARDIAN_PROTECTED);
            }
        },
        [StatusEffectHook.OnDeath]: (caster: Combatant, target: Combatant) => {
            const guardianProtected = target.getRelatedCombatants()['GUARDIAN_PROTECTED'];
            if(guardianProtected && !guardianProtected.isKnockedOut()) {
                guardianProtected.removeStatusEffect(StatusEffectType.GUARDIAN_PROTECTED);
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class GuardianProtectedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.GUARDIAN_PROTECTED;
    description = `This combatant is protected by a guardian. Any damage taken to it is instead inflicted on the guardian, but halved.`;
    applicationHooks = {
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            const guardian = target.getRelatedCombatants()['GUARDIAN'];
            if(guardian && !guardian.isKnockedOut()) {
                guardian.removeStatusEffect(StatusEffectType.GUARDIAN);
            }
        },
        [StatusEffectHook.OnDeath]: (caster: Combatant, target: Combatant) => {
            const guardian = target.getRelatedCombatants()['GUARDIAN'];
            if(guardian && !guardian.isKnockedOut()) {
                guardian.removeStatusEffect(StatusEffectType.GUARDIAN);
            }
        },
        [StatusEffectHook.OnDamageTaken]: (caster: Combatant, target: Combatant, damage: Damage) => {
            const guardian = target.getRelatedCombatants()['GUARDIAN'];
            if(!guardian) {
                return getStandardActionResult();
            }
            const damageToRestore = damage.amount;
            caster.stats.hp = Math.min(caster.stats.hp + damageToRestore, caster.baseStats.hp);
            const damageToInflict = damage.amount * 0.5;
            guardian.takeDamage({amount: damageToInflict, type: DamageType.Unstoppable});
            const damageResult = getDamageActionResult({amount: damageToInflict, type: DamageType.Unstoppable}, guardian.position);
            emitter.emit('trigger-method', damageResult);
            return getStandardActionResult();
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class DiamondHookedHoldingStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DIAMOND_HOOKED_HOLDING;
    description = `This combatant holds an enemy captive with a diamnd hook, and will attack it if it tries to move or resist.`;
    applicationHooks = {
        [StatusEffectHook.OnTurnStart ]: (self: Combatant) => {
            const heldEnemy = self.getRelatedCombatants()['DIAMOND_HOOKED_HOLDING'];
            if(!heldEnemy) {
                self.removeStatusEffect(StatusEffectType.DIAMOND_HOOKED_HOLDING);
            }
        },
        [StatusEffectHook.OnMoving]: (self: Combatant) => {
            const heldEnemy = self.getRelatedCombatants()['DIAMOND_HOOKED_HOLDING'];
            if(heldEnemy) {
                heldEnemy.removeStatusEffect(StatusEffectType.DIAMOND_HOOKED);
                heldEnemy.removeRelatedCombatant('DIAMOND_HOOKED');
            }
            self.removeStatusEffect(StatusEffectType.DIAMOND_HOOKED_HOLDING);
        },
        [StatusEffectHook.OnDeath]: (self: Combatant) => {
            const heldEnemy = self.getRelatedCombatants()['DIAMOND_HOOKED_HOLDING'];
            if(heldEnemy) {
                heldEnemy.removeStatusEffect(StatusEffectType.DIAMOND_HOOKED);
                heldEnemy.removeRelatedCombatant('DIAMOND_HOOKED');
            }
            self.removeStatusEffect(StatusEffectType.DIAMOND_HOOKED_HOLDING);
        },
        [StatusEffectHook.OnKilling]: (caster: Combatant, target: Combatant) => {
            const heldEnemy = target.getRelatedCombatants()['DIAMOND_HOOKED_HOLDING'];
            if(heldEnemy && target.name === heldEnemy.name) {
                caster.removeStatusEffect(StatusEffectType.DIAMOND_HOOKED_HOLDING);
                caster.removeRelatedCombatant('DIAMOND_HOOKED');
                caster.stats.hp = Math.min(caster.stats.hp + 20, caster.baseStats.hp);
                caster.stats.stamina = Math.min(caster.stats.stamina + 10, caster.baseStats.stamina);
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}

export class IngeniousUpgradeStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.INGENIOUS_UPGRADE;
    description = `This construct has gone through an upgrade, has a unique skill unlocked, and a considerable boost to attack power.`;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.stats.attackPower += STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 20 : 20;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.stats.attackPower -= STAT_BUFF_INCREASE_ENABLED ? ATTACK_DEFENSE_INCREASE_AMOUNT + 20 : 20;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Positive;
}
