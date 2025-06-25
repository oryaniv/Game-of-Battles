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
import { IdGenerator } from "@/logic/IdGenerator";
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
    description = `Restore Medium amount of health to an organic ally.`   
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
    description = `Ally gains the Regenerating status for 5 rounds. Each turn, they restore a small amount of health. only works on organic allies.`   
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
    description = `Remove all negative status effects from an ally.`   
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
    description = `You and all allies in a 1-tile cross-shaped area gain the Rallied status for 3 rounds.
    Rallied combatants gain a boost to both defense and luck. Can not be used after moving.` 
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
    description = `Resotre a small amount of health, and remove all negative status effects.`   
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
        amount: 40,
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
    description = `Resotre Medium amount of health to all constructs in a 1-tile cross-shaped area.`
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
            const wall = new Wall(`Wall_${IdGenerator.generateId()}`, currentTarget, invoker.team);
            board.placeCombatant(wall, currentTarget);
        }

        return getStandardActionResult();
    };
    checkRequirements = undefined
    description = `Build walls in a 1-tile arc-shaped area. Walls block movement and may stand in the way of attacks.`
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
        const bomb = new Bomb(`Bomb_${IdGenerator.generateId()}`, target, invokverTeam);
        invokverTeam.addCombatant(bomb);
        board.placeCombatant(bomb, target);
        return getStandardActionResult();
    };
    checkRequirements = undefined
    description = `Deploy a walking bomb, which can blow itself up. If it dies, it will explode on the spot
    can have up to 7 bombs at the same time.`
}