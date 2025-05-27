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
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.STRENGTH_BOOST);
            self.stats.attackPower -= 20;
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.stats.attackPower += 20;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class DefenseDowngradeStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DEFENSE_DOWNGRADE;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.FORTIFIED);
            self.stats.defensePower -= 20;
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.stats.defensePower += 20;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class LuckDowngradeStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.LUCK_DOWNGRADE;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.stats.luck -= 5;
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.stats.luck += 5;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class StaggeredStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.STAGGERED;
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
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.MOBILITY_BOOST);
            self.stats.movementSpeed -= 2;
            self.stats.agility -= 3;
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.stats.movementSpeed += 2;
            self.stats.agility += 3;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class PoisonedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.POISONED;
    applicationHooks = {
        [StatusEffectHook.OnTurnEnd]: (self: Combatant, target: Combatant, board: Board) => {
            // self.stats.hp -= 10;
            self.takeDamage({amount: 10, type: DamageType.Blight});
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
    applicationHooks = {
        [StatusEffectHook.OnTurnEnd]: (caster: Combatant, target: Combatant, board: Board) => {
            // caster.stats.hp -= 10;
            caster.takeDamage({amount: 10, type: DamageType.Pierce});
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
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.insertAiAgent(new TauntedAIAgent(target));
            caster.stats.agility -= 5;
            caster.stats.defensePower -= 15;
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant, target: Combatant) => {
            caster.removeAiAgent(AIAgentType.TAUNTED);
            caster.stats.agility += 5;
            caster.stats.defensePower += 15;
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class StupefiedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.STUPEFIED;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.removeStatusEffect(StatusEffectType.FOCUS_AIM);
            caster.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
        },  
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class NauseatedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.NAUSEATED;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant, target: Combatant) => {
            self.removeStatusEffect(StatusEffectType.CLOAKED);
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
            self.aiAgent && self.removeAiAgent(AIAgentType.STUNLOCKED);
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}       

export class MesmerizedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MESMERIZED;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.removeStatusEffect(StatusEffectType.DEFENDING);
            caster.removeStatusEffect(StatusEffectType.BLOCKING_STANCE);
            caster.removeStatusEffect(StatusEffectType.FOCUS_AIM);
            caster.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
            caster.removeStatusEffect(StatusEffectType.CLOAKED);
            caster.insertAiAgent(new StunLockedAIAgent("Mesmerized"));
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant) => {
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
    applicationHooks = {
        [StatusEffectHook.OnApply]: (caster: Combatant, target: Combatant) => {
            caster.removeStatusEffect(StatusEffectType.DEFENDING);
            caster.removeStatusEffect(StatusEffectType.BLOCKING_STANCE);
            caster.removeStatusEffect(StatusEffectType.FOCUS_AIM);
            caster.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
            caster.removeStatusEffect(StatusEffectType.CLOAKED);
            caster.insertAiAgent(new StunLockedAIAgent("Nightmare Locked"));
        },
        [StatusEffectHook.OnRemove]: (caster: Combatant) => {
            caster.removeAiAgent(AIAgentType.STUNLOCKED);
        },
        [StatusEffectHook.OnTurnStart]: (caster: Combatant) => {
            caster.takeDamage({amount: 10, type: DamageType.Blight});
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class MarkedForPainStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.MARKED_FOR_PAIN;
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
    applicationHooks = {
        [StatusEffectHook.OnBeingMissed]: (self: Combatant, attacker: Combatant) => {
            self.removeStatusEffect(StatusEffectType.MARKED_DETONATED);
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class PanickedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.PANICKED;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.insertAiAgent(new PanickedAIAgent());
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.removeAiAgent(AIAgentType.PANICKED);
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}

export class CharmedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.CHARMED;
    applicationHooks = {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.insertAiAgent(new CharmedAIAgent());
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.removeAiAgent(AIAgentType.CHARMED);
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}
