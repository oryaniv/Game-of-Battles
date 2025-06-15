import { ActionResult, AttackResult } from "@/logic/attackResult";
import { getStandardActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
// 
import { Combatant } from "@/logic/Combatant";
import { Bomb, Wall } from "@/logic/Combatants/ArtificerConstructs";
import { CombatantType } from "@/logic/Combatants/CombatantType";
import { CombatMaster } from "@/logic/CombatMaster";
import { DamageReaction, DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { SpecialMoveAreaOfEffect } from "@/logic/SpecialMove";
import { SpecialMoveAlignment, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { SpecialMove } from "@/logic/SpecialMove";
import { StatusEffect, StatusEffectAlignment, StatusEffectType } from "@/logic/StatusEffect";


export class Heal implements SpecialMove {
    name: string = "Heal";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 4;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 3
    };
    damage: Damage = {
        amount: 40,
        type: DamageType.Healing
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult();  
        }
        if(!targetCombatant.isOrganic()) {
            return getStandardActionResult();
        }
        targetCombatant.stats.hp = Math.min(targetCombatant.stats.hp + this.damage.amount, targetCombatant.baseStats.hp);
        return {
            attackResult: AttackResult.Hit,
            damage: {
                amount: this.damage.amount,
                type: this.damage.type
            },
            cost: 1,
            reaction: DamageReaction.NONE,
            position: target
        };
    };
    checkRequirements = undefined
    description = `engulf an ally in a wave of divine energy, healing them for a medium amount of health`   
}

export class Regenerate implements SpecialMove {
    name: string = "Regenerate";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 6;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 3
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Healing
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult();  
        }
        targetCombatant.applyStatusEffect({
            name: StatusEffectType.REGENERATING,
            duration: 5,
        }); 
        return getStandardActionResult();
    };
    checkRequirements = undefined
    description = `Greatly empower an ally's natural healing abilities, 
    allowing them to heal for a small amount of health each turn`   
}

export class Purify implements SpecialMove {
    name: string = "Purify";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 4;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Ally,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Pierce
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult();
        }
        const negativeStatusEffects: StatusEffect[] = targetCombatant.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative);
        for(const statusEffect of negativeStatusEffects) {
            targetCombatant?.removeStatusEffect(statusEffect.name);
        }
        return getStandardActionResult();
    };
    checkRequirements = undefined
    description = `Cure an ally of all Negative status effects`   
}

export class RallyToTheBanner implements SpecialMove {
    name: string = "Rally to the Banner";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 8;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Cross,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Healing
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(!targetCombatant) {
                return getStandardActionResult();
            }
            targetCombatant.applyStatusEffect({
                name: StatusEffectType.RALLIED,
                duration: 3,
            });
        });

        return getStandardActionResult();
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasMoved
    };
    description = `Rally close allies to the banner, granting them all a small bonus to both defense and luck. this move
    cannot be user after moving` 
}

export class Meditate implements SpecialMove {
    name: string = "Meditate";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 8;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Healing
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const negativeStatusEffects: StatusEffect[] = invoker.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative);
        for(const statusEffect of negativeStatusEffects) {
            invoker?.removeStatusEffect(statusEffect.name);
        }
        invoker.stats.hp = Math.min(invoker.stats.hp + 20, invoker.baseStats.hp);
        return {
            attackResult: AttackResult.Hit,
            damage: {
                amount: 15,
                type: DamageType.Healing
            },
            cost: 1,
            reaction: DamageReaction.NONE
        };
    };
    checkRequirements = undefined
    description = `Meditate, cleasing yourself of all negative effects tainting your body and soul`   
}

export class ReinforceConstruct implements SpecialMove {
    name: string = "Reinforce Construct";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 6;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Ally,
        areaOfEffect: SpecialMoveAreaOfEffect.Cross,
        range: 3
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Healing
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const results: ActionResult[] = getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(!targetCombatant) {
                return getStandardActionResult();
            }
            if(targetCombatant.team.index !== invoker.team.index) {
                return getStandardActionResult();
            }
            if(targetCombatant.isConstruct()) {
                targetCombatant.stats.hp = Math.min(targetCombatant.stats.hp + this.damage.amount, targetCombatant.baseStats.hp);
                return {
                    attackResult: AttackResult.Hit,
                    damage: {
                        amount: this.damage.amount,
                        type: this.damage.type
                    },
                    cost: 1,
                    reaction: DamageReaction.NONE,
                    position: AOETarget
                };
            }
            return getStandardActionResult();
        }).filter(result => result !== undefined);
        return results
    };
    checkRequirements = undefined
    description = `Fix and Reinforce a construct, or a Metal covered ally, healing them for a medium amount of health`
}

export class BuildWalls implements SpecialMove {
    name: string = "Build Walls";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 8;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Empty_Space,
        areaOfEffect: SpecialMoveAreaOfEffect.Cone,
        range: 2
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);

        for(const currentTarget of getAllTargets) {
            const wall = new Wall('Wall', currentTarget, invoker.team);
            board.placeCombatant(wall, currentTarget);
        }

        return getStandardActionResult();
    };
    checkRequirements = undefined
    description = `Build a wall, blocking all movement and attacks to and from the target position`
}

export class BoomBoomJack implements SpecialMove {
    name: string = "Deploy Boom Gremlin";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 10;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Empty_Space,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 2
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const invokverTeam = invoker.team;
        if(invokverTeam.getAliveCombatants().filter(c => c.getCombatantType() === CombatantType.Bomb).length >= 7) {
            const bomb = invokverTeam.getAliveCombatants().find(c => c.getCombatantType() === CombatantType.Bomb);
            if(bomb) {
                board.removeCombatant(bomb);
                invokverTeam.combatants.splice(invokverTeam.combatants.indexOf(bomb), 1);
            }
        }
        const bomb = new Bomb('bomb', target, invokverTeam);
        invokverTeam.addCombatant(bomb);
        board.placeCombatant(bomb, target);
        return getStandardActionResult();
    };
    checkRequirements = undefined
    description = `Build a wall, blocking all movement and attacks to and from the target position`
}