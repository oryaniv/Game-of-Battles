import { DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { Board } from "@/logic/Board";
import { StatusEffectType, StatusEffectHook } from "@/logic/StatusEffect";
import { AttackResult, getStandardActionResult } from "@/logic/attackResult";
import { Combatant } from "@/logic/Combatant";
import { CombatMaster } from "@/logic/CombatMaster";
import { ActionResult } from "@/logic/attackResult";
import { RangeCalculator } from "@/logic/RangeCalculator";

export class DefensiveStrike implements SpecialMove {
    name: string = "Defensive Strike";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 20,
        type: DamageType.Slash
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board);
        combatMaster.defend(invoker);
        return result;
    };
    checkRequirements = undefined
    description = `Attack Quickly for low Slash damage, and immediately go into Defend mode.`   
}


export class Flame implements SpecialMove {
    name: string = "Flame";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Fire
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `Ignite an enemy with Malicious fire and deal medium Fire damage.`   
}

export class LightningBolt implements SpecialMove {
    name: string = "Lightning Bolt";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 5
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Lightning
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `Strike a foe with a bolt of lightning and deal medium Lightning damage.`   
}

export class Icicle implements SpecialMove {
    name: string = "Icicle";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Ice
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `Conjure a sharp icicle to impale an enemy and deal medium Ice damage.`   
}

export class FireBall implements SpecialMove {
    name: string = "Fireball";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 8;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 5
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Fire
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        invoker.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.range);
        const fireBallResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true);
        });

        return fireBallResults;
    };
    checkRequirements = (self: Combatant) => {
        return self.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING);
    };
    description = `Hurl a ball of fire that explodes on impact, dealing medium Fire damage to all in the area. Removes Arcane Channeling.`   
}

export class ChainLightning implements SpecialMove {
    name: string = "Chain Lightning";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 7;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Chain,
        range: 5
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Lightning
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
        const combatMaster = CombatMaster.getInstance();
        const chainTargets = board.getChainTargets(invoker, target, 3, 3);
        const chainLightningResults: ActionResult[] = [];
        for(const currentTarget of chainTargets) {
            const result = combatMaster.executeAttack(invoker, currentTarget, board, this.damage);
            chainLightningResults.push(result);
            if(result.attackResult === AttackResult.Miss || result.attackResult === AttackResult.Fumble || result.attackResult === AttackResult.Blocked) {
                break;
            }
        }
        return chainLightningResults;
    };
    checkRequirements = (self: Combatant) => {
        return self.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING);
    };
    description = `Shoot a bolt of lightning at an enemy, the bolt will then jump to up to 3 other 
    enemies, dealing half damage of the previous hit. Removes Arcane Channeling.`   
}


export class FrozenBurst implements SpecialMove {
    name: string = "Frozen Burst";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 6;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
    };
    damage: Damage = {
        amount: 40,
        type: DamageType.Ice
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        invoker.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.FROZEN, 2, 0.9);
        }
        return result;
    };
    checkRequirements = (self: Combatant) => {
        return self.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING);
    };
    description = `Blast an enemy with a surge of freezing cold, dealing medium ice damage and having a hight chance
    of freezing the target for 2 turns. Removes Arcane Channeling.`   
}


export class SacredFlame implements SpecialMove {
    name: string = "Sacred Flame";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 3;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 3
    };
    damage: Damage = {
        amount: 20,
        type: DamageType.Holy
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `Strike an enemy with a beam of holy retribution, dealing low Holy damage.`   
}

export class DarkThorn implements SpecialMove {
    name: string = "Dark Thorn";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 3;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
    };
    damage: Damage = {
        amount: 25,
        type: DamageType.Dark
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `Raise a thorn coated with Dark energies from the ground, dealing low Darl damage to the target.`   
}

export class PinDown implements SpecialMove {
    name: string = "Pin Down";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 4;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 8
    };
    damage: Damage = {
        amount: 25,
        type: DamageType.Pierce
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.IMMOBILIZED, 2, 1);
        }
        return result;
    };
    checkRequirements = undefined
    description = `Shoot an enemy's legs, with amedium chance to immobilize them for 2 turns.`   
}

export class Ricochet implements SpecialMove {
    name: string = "Ricochet";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 7;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Chain,
        range: 8
    };
    damage: Damage = {
        amount: 25,
        type: DamageType.Pierce
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
        const combatMaster = CombatMaster.getInstance();
        const chainTargets = board.getChainTargets(invoker, target, 1, 3);
        const ricochetResults: ActionResult[] = [];
        for(const currentTarget of chainTargets) {
            const result = combatMaster.executeAttack(invoker, currentTarget, board, this.damage);
            ricochetResults.push(result);
            if(result.attackResult === AttackResult.Miss || result.attackResult === AttackResult.Fumble || result.attackResult === AttackResult.Blocked) {
                break;
            }
        }
        return ricochetResults;
    };
    checkRequirements = undefined
    description = `Shoot an enemy with a special arrow the splinters on impact, ricocheting and hitting another enemy.`   
}

export class ToxicArrow implements SpecialMove {
    name: string = "Toxic Arrow";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 6;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 8
    };
    damage: Damage = {
        amount: 25,
        type: DamageType.Blight
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.POISONED, 3, 0.6);
        }
        return result;
    };
    checkRequirements = undefined
    description = `Launch an arrow coated in a deadly poison, dealing medium Blight damage and having a medium chance to inflict Poisoned for 3 turns.`   
}
