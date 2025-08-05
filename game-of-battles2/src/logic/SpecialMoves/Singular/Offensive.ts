import { DamageReaction, DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { isSamePosition, Position } from "@/logic/Position";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { Board } from "@/logic/Board";
import { StatusEffectType, StatusEffectHook, StatusEffect, StatusEffectAlignment } from "@/logic/StatusEffect";
import { AttackResult, getDamageActionResult, getStandardActionResult } from "@/logic/attackResult";
import { Combatant } from "@/logic/Combatant";
import { CombatMaster } from "@/logic/CombatMaster";
import { ActionResult } from "@/logic/attackResult";
import { RangeCalculator } from "@/logic/RangeCalculator";
import { CombatantType } from "@/logic/Combatants/CombatantType";
import { emitter } from "@/eventBus";

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
    description = `Low Slash damage to target, Then go into Defend mode.`   
}

function hasArcaneOvercharge(invoker: Combatant) {
    return invoker.statusEffects.some((effect) => effect.name === StatusEffectType.ARCANE_OVERCHARGE);
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
        const hasOvercharge = hasArcaneOvercharge(invoker);
        const damage = hasOvercharge ? {
            amount: this.damage.amount * 1.5,
            type: this.damage.type
        } : this.damage;
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board, damage);
        if((result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit ) && hasOvercharge) {
            CombatMaster.getInstance().tryInflictStatusEffect(invoker, target, board, StatusEffectType.BURNING, 1, 0.6);
        }
        if(hasOvercharge) {
            invoker.removeStatusEffect(StatusEffectType.ARCANE_OVERCHARGE);
        }
        return result;
    };
    checkRequirements = undefined
    description = `Medium Fire damage to target.`   
}

export class FlameCannon implements SpecialMove {   
    name: string = "Flame Cannon";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 8
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
    description = `Medium Fire damage to target at a long range.` 
}

export class IceCannon implements SpecialMove {   
    name: string = "Ice Cannon";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 8
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
    description = `medium Ice damage to target at a long range` 
}

export class ThunderDome implements SpecialMove {
    name: string = "Thunder Dome";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 8
    };
    damage: Damage = {
        amount: 40,
        type: DamageType.Lightning
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `medium Lightning damage at a long range, straight line`   
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
        const hasOvercharge = hasArcaneOvercharge(invoker);
        const damage = hasOvercharge ? {
            amount: this.damage.amount * 1.5,
            type: this.damage.type
        } : this.damage;
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board, damage);
        if((result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit ) && hasOvercharge) {
            CombatMaster.getInstance().tryInflictStatusEffect(invoker, target, board, StatusEffectType.STAGGERED, 1, 0.6);
        }
        if(hasOvercharge) {
            invoker.removeStatusEffect(StatusEffectType.ARCANE_OVERCHARGE);
        }
        return result;
    };
    checkRequirements = undefined
    description = `Medium Lightning damage to target.`   
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
        const hasOvercharge = hasArcaneOvercharge(invoker);
        const damage = hasOvercharge ? {
            amount: this.damage.amount * 1.5,
            type: this.damage.type
        } : this.damage;
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board, damage);
        if((result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit ) && hasOvercharge) {
            CombatMaster.getInstance().tryInflictStatusEffect(invoker, target, board, StatusEffectType.SLOW, 1, 0.6);
        }
        if(hasOvercharge) {
            invoker.removeStatusEffect(StatusEffectType.ARCANE_OVERCHARGE);
        }
        return result;
    };
    checkRequirements = undefined
    description = `Medium Ice damage to target.`   
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
        const hasOvercharge = hasArcaneOvercharge(invoker);
        const damage = hasOvercharge ? {
            amount: this.damage.amount * 1.5,
            type: this.damage.type
        } : this.damage;
        if(hasOvercharge) {
            invoker.removeStatusEffect(StatusEffectType.ARCANE_OVERCHARGE);
        }
        invoker.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const fireBallResults = getAllTargets.map(AOETarget => {
            const result = combatMaster.executeAttack(invoker, AOETarget, board, damage, true);
            if(hasOvercharge && (result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit)) {
                CombatMaster.getInstance().tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.BURNING, 1, 0.6);
            }
            return result;
        });

        return fireBallResults;
    };
    checkRequirements = (self: Combatant) => {
        return self.statusEffects.some((effect) => effect.name === StatusEffectType.ARCANE_CHANNELING);
    };
    description = `Medium Fire damage to all targets in 1-tile radius nova. Requires and Removes Arcane Channeling.`   
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
        const hasOvercharge = hasArcaneOvercharge(invoker);
        const damage = hasOvercharge ? {
            amount: this.damage.amount * 1.5,
            type: this.damage.type
        } : this.damage;
        if(hasOvercharge) {
            invoker.removeStatusEffect(StatusEffectType.ARCANE_OVERCHARGE);
        }
        const chainTargets = board.getChainTargets(invoker, target, 3, 3);
        const chainLightningResults: ActionResult[] = [];
        for(const currentTarget of chainTargets) {
            const result = combatMaster.executeAttack(invoker, currentTarget, board, damage);
            chainLightningResults.push(result);
            if(result.attackResult === AttackResult.Miss || result.attackResult === AttackResult.Fumble || result.attackResult === AttackResult.Blocked) {
                break;
            } else if(hasOvercharge && (result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit)) {
                CombatMaster.getInstance().tryInflictStatusEffect(invoker, currentTarget, board, StatusEffectType.STAGGERED, 1, 0.6);
            }
        }
        return chainLightningResults;
    };
    checkRequirements = (self: Combatant) => {
        return self.statusEffects.some((effect) => effect.name === StatusEffectType.ARCANE_CHANNELING);
    };
    description = `Medium Lightning damage to target, jumps to up to 3 other enemies. Requires and Removes Arcane Channeling.`   
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
        const hasOvercharge = hasArcaneOvercharge(invoker);
        const damage = hasOvercharge ? {
            amount: this.damage.amount * 1.5,
            type: this.damage.type
        } : this.damage;
        if(hasOvercharge) {
            invoker.removeStatusEffect(StatusEffectType.ARCANE_OVERCHARGE);
        }
        const result = combatMaster.executeAttack(invoker, target, board, damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            const duration = hasOvercharge ? 4 : 2;
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.FROZEN, duration, 0.9);
        }
        return result;
    };
    checkRequirements = (self: Combatant) => {
        return self.statusEffects.some((effect) => effect.name === StatusEffectType.ARCANE_CHANNELING);
    };
    description = `Medium Ice damage to target, high chance to inflict Frozen for 2 rounds. Requires and Removes Arcane Channeling.`   
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
        amount: 15,
        type: DamageType.Holy
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `Low Holy damage to target.`   
}

export class GraspOfZirash implements SpecialMove {
    name: string = "Grasp of Zirash";
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
        amount: 20,
        type: DamageType.Dark
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const targetCombatant = board.getCombatantAtPosition(target);
        const negativeStatusEffects: StatusEffect[] = targetCombatant!.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative);
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board, {
            amount: this.damage.amount * (1 + (negativeStatusEffects.length * 0.25)),
            type: this.damage.type,
        });
        return result;
    };
    checkRequirements = undefined
    description = `Low Dark damage to target. Damage increases by 25% of base damage for each negative status effect on target.`   
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
        amount: 20,
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
    description = `Medium Pierce damage to target, chance to Immobilize them for 2 rounds.`   
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
        amount: 20,
        type: DamageType.Pierce
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
        const combatMaster = CombatMaster.getInstance();
        const chainTargets = board.getChainTargets(invoker, target, 1, 1);
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
    description = `Medium Pierce damage to target, can jump to 1 other adjacent enemy.`   
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
        amount: 20,
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
    description = `Medium Blight damage to target, chance to inflict Poisoned for 3 rounds.`   
    // TODO: add a description for the arrow
}

export class Skewer implements SpecialMove {
    name: string = "Skewer";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Line,
        range: 1
    };
    damage: Damage = {
        amount: 20,
        type: DamageType.Pierce
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const skewerResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true);
        });

        return skewerResults;
    };
    checkRequirements = undefined
    description = `Medium Pierce damage to all targets in a 3-tile line.`
}

export class GapingStab implements SpecialMove {
    name: string = "Gaping Stab";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 2
    };
    damage: Damage = {
        amount: 20,
        type: DamageType.Pierce
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.BLEEDING, 3, 0.6);
        }
        return result;
    };
    checkRequirements = undefined
    description = `Medium Pierce damage to target, chance to inflict Bleeding for 3 rounds.`   
}

export class HaftStrike implements SpecialMove {
    name: string = "Haft Strike";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 4;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 15,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.STAGGERED, 3, 0.6);
        }
        return result;
    };
    checkRequirements = undefined
    description = `Medium Crush damage to target, chance to inflict Staggered for 3 rounds.`   
}

export class Rampage implements SpecialMove {
    name: string = "Rampage";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 8;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 25,
        type: DamageType.Slash
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const rampageResults: ActionResult[] = [];
        for(let i = 0; i < 3; i++) {
        const roll = Math.random();
            if (roll <= 0.25) {
                rampageResults.push({
                    attackResult: AttackResult.Miss,
                    damage: { amount: 0, type: DamageType.Unstoppable },
                    cost: 1, // Refund 1 action point
                    reaction: DamageReaction.NONE,
                    position: target
                });
            } else {
                rampageResults.push(combatMaster.executeAttack(invoker, target, board, this.damage));
            }
        }
        return rampageResults;
    };
    checkRequirements = undefined
    description = `3 basic attacks against the target, with a small chance to automatically miss each time.`   
}

export class ShieldBreaker implements SpecialMove {
    name: string = "Shield Breaker";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 3;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 15,
        type: DamageType.Slash
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            const targetCombatant = board.getCombatantAtPosition(target);
            targetCombatant!.removeStatusEffect(StatusEffectType.DEFENDING);
            targetCombatant!.removeStatusEffect(StatusEffectType.BLOCKING_STANCE);
            targetCombatant!.removeStatusEffect(StatusEffectType.SHIELD_WALL);
            targetCombatant!.removeStatusEffect(StatusEffectType.SHIELD_WALL_PROTECTED);
            targetCombatant!.removeStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL);
            targetCombatant!.removeStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED);
            targetCombatant!.removeStatusEffect(StatusEffectType.ARCANE_BARRIER);
            targetCombatant!.applyStatusEffect({name: StatusEffectType.DEFENSE_DOWNGRADE, duration: 3});
        }
        return result;
    };
    checkRequirements = undefined
    description = `Low Slash damage to target, decrease enemy's defense by for 3 rounds, breaks defense mode and removes most defensive statuses (i.e shield wall)`   
}


export class FeralSwing implements SpecialMove {
    name: string = "Feral Swing";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 7;
    turnCost: number = 1;
    range: SpecialMoveRange = { 
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Cone,
        range: 1
    };
    damage: Damage = {
        amount: 35,
        type: DamageType.Slash
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const feralSwingResults: ActionResult[] = [];
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);

        for(const currentTarget of getAllTargets) {
            feralSwingResults.push(combatMaster.executeAttack(invoker, currentTarget, board, this.damage, true));
        }
        return feralSwingResults;
    };
    checkRequirements = undefined
    description = `Basic attack against all targets in a 3-tiles arc.`   
}

export class UnstoppableCharge implements SpecialMove {
    name: string = "Unstoppable Charge";
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
        amount: 35,
        type: DamageType.Slash
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const chargeEndPosition = board.getMovingAttackEndPosition(invoker, target, this.range.range);
        const distance = board.getDistanceBetweenPositions(invoker.position, chargeEndPosition);
        invoker.move(chargeEndPosition, board);
        return combatMaster.executeAttack(invoker, target, board, {
            amount: this.damage.amount * (1 + (distance * 0.15)),
            type: this.damage.type
        });
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasMoved && !self.hasStatusEffect(StatusEffectType.IMMOBILIZED)
    };
    description = `Move forward up to 5 tiles, then basic attack against the target. The More tiles moved, the higher the damage.
    Can not be used after moving.`   
}


export class WindRunAssault implements SpecialMove {
    name: string = "Wind Run Assault";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 7;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.TeleportAssault,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 5
    };
    damage: Damage = {
        amount: 25,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const chargeEndPosition = board.getMovingAttackEndPosition(invoker, target, this.range.range);
        invoker.move(chargeEndPosition, board);
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasMoved
    };
    description = `Teleport by the the target, then perform a basic attack. Can not be used after moving`   
}

export class TitanicFist implements SpecialMove {
    name: string = "Titanic Fist";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 6;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 25,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            const targetCombatant = board.getCombatantAtPosition(target);
            const getPushResult = board.getPushResult(invoker, targetCombatant!, 3);
            if(!getPushResult) {
                return result;
            }
            if(getPushResult.moveTo) {
                targetCombatant!.move(getPushResult.moveTo, board);
            }
            if(getPushResult.collisionObject) {
                targetCombatant?.takeDamage({amount: 10, type: DamageType.Crush}, board);
                const damageResult = getDamageActionResult({amount: 10, type: DamageType.Crush}, getPushResult.moveTo);
                getPushResult.collisionObject?.takeDamage({amount: 10, type: DamageType.Crush}, board);
                const damageResult2 = getDamageActionResult({amount: 10, type: DamageType.Crush}, getPushResult.collisionObject?.position);
                emitter.emit('trigger-method', damageResult);
                emitter.emit('trigger-method', damageResult2);
            }
        }
        return result;
    };
    checkRequirements = undefined
    description = `Medium Crush damage to target. Attempts to push the target up to 3 tiles back if possible. If any other
    target is in the way, both pushed enemy and the target suffer low crush damage.`   
}

export class AngelicTouch implements SpecialMove {
    name: string = "Angelic Touch";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 8;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 60,
        type: DamageType.Holy
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            const roll = Math.random();
            if(roll <= 0.15) {
                const targetCombatant = board.getCombatantAtPosition(target);
                targetCombatant!.stats.hp = 0;
            }
        }
        return result;
    };
    checkRequirements = (self: Combatant) => {
        return self.hasStatusEffect(StatusEffectType.IDAI_NO_HADOU);
    };
    description = `High Holy damage to target, small chance to instant kill. Requires the Idai no Hadou status.`   
}   

export class VipersKiss implements SpecialMove {
    name: string = "Viper's Kiss";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 4;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 20,
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
    description = `Medium Blight damage to target, chance to inflict Poisoned for 3 rounds.`   
}

export class SneakAttack implements SpecialMove {
    name: string = "Sneak Attack";
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
        const targetCombatant = board.getCombatantAtPosition(target);
        let skillDamage = this.damage.amount;
        if(invoker.hasStatusEffect(StatusEffectType.CLOAKED) || board.isFlanked(targetCombatant!)) {
            skillDamage = this.damage.amount * 1.5;
        }
            
        const result = combatMaster.executeAttack(invoker, target, board, {type: this.damage.type, amount: skillDamage});
        return result;
    };
    checkRequirements = undefined
    description = `Medium Pierce damage to target, damage increased by 50% if the user is cloaked or the target is flanked by another ally.`   
}

export class ShockingGauntlet implements SpecialMove {
    name: string = "Shocking Gauntlet";
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
        type: DamageType.Lightning
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.STAGGERED, 3, 0.3);
        }
        return result;
    };
    checkRequirements = undefined
    description = `Medium Lightning damage to target, chance to inflict Staggered for 3 rounds.`   
}   

export class Horns implements SpecialMove {
    name: string = "Horns";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 3;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 50,
        type: DamageType.Pierce
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `High Pierce damage to target.`   
}

export class Claws implements SpecialMove {
    name: string = "Claws";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 3;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 50,
        type: DamageType.Slash
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `High Slash damage to target.`   
}

export class TrollKick implements SpecialMove {
    name: string = "Troll Kick";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 3;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 50,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `High Crush damage to target.`   
}

export class VenomousSpit implements SpecialMove {
    name: string = "Venomous Spit";
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
        amount: 40,
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
    description = `Medium Blight damage to target, chance to inflict Poisoned for 3 rounds.`   
}

export class GooSpit implements SpecialMove {
    name: string = "Goo Spit";
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
    description = `Medium Blight damage to target, chance to inflict Poisoned for 3 rounds.`   
}

export class Crush implements SpecialMove {
    name: string = "Crush";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 2;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 20,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.SLOW, 3, 0.5);
        }
        return result;
    };
    checkRequirements = undefined
    description = `Medium Crush damage to target, may inflict Slow for 3 rounds.`   
}

export class WeaveBurst implements SpecialMove {
    name: string = "Weave Burst";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 3;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 3
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Dark
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const randomDamageType = [DamageType.Fire, DamageType.Ice, DamageType.Lightning][Math.floor(Math.random() * 3)];
        const hasOvercharge = invoker.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE);
        const damage = hasOvercharge ? this.damage.amount * 1.5 : this.damage.amount;
        const attackDamage = {
            amount: damage,
            type: randomDamageType
        };
        const result = combatMaster.executeAttack(invoker, target, board, attackDamage);
        if((result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit ) && hasOvercharge) {
            const afflictionType = randomDamageType === DamageType.Fire ? 
            StatusEffectType.BURNING : randomDamageType === DamageType.Ice ? 
            StatusEffectType.FROZEN : StatusEffectType.STAGGERED;

            CombatMaster.getInstance().tryInflictStatusEffect(invoker, target, board, afflictionType, 1, 0.6);
        }
        hasOvercharge && invoker.removeStatusEffect(StatusEffectType.ARCANE_OVERCHARGE);
        return result;
    };
    checkRequirements = undefined
    description = `Medium Random elemental damage to the target.`   
}

export class ChainWeaveBurst implements SpecialMove {
    name: string = "Chain Weave Burst";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 6;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Dark
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
        const combatMaster = CombatMaster.getInstance();
        const hasOvercharge = hasArcaneOvercharge(invoker);
        const randomDamageType = [DamageType.Fire, DamageType.Ice, DamageType.Lightning][Math.floor(Math.random() * 3)];
        const damage = {
            amount: hasOvercharge ? this.damage.amount * 1.5 : this.damage.amount,
            type: randomDamageType
        };
        if(hasOvercharge) {
            invoker.removeStatusEffect(StatusEffectType.ARCANE_OVERCHARGE);
        }
        const chainTargets = board.getChainTargets(invoker, target, 3, 3);
        const chainWeaveBurstResults: ActionResult[] = [];
        for(const currentTarget of chainTargets) {
            const result = combatMaster.executeAttack(invoker, currentTarget, board, damage);
            chainWeaveBurstResults.push(result);
            if(result.attackResult === AttackResult.Miss || result.attackResult === AttackResult.Fumble || result.attackResult === AttackResult.Blocked) {
                break;
            } else if(hasOvercharge && (result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit)) {
                const afflictionType = randomDamageType === DamageType.Fire ? 
                StatusEffectType.BURNING : randomDamageType === DamageType.Ice ? 
                StatusEffectType.FROZEN : StatusEffectType.STAGGERED;

                CombatMaster.getInstance().tryInflictStatusEffect(invoker, currentTarget, board, afflictionType, 1, 0.6);
            }
        }
        return chainWeaveBurstResults;
    };
    checkRequirements = (self: Combatant) => {
        return self.statusEffects.some((effect) => effect.name === StatusEffectType.ARCANE_CHANNELING);
    };
    description = `Random elemental damage to target, jumps up 3 times.`   
}

export class MindLash implements SpecialMove {
    name: string = "Mind Lash";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 2;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 20,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.STUPEFIED, 3, 0.5);
        }
        return result;
    };
    checkRequirements = undefined
    description = `Medium Crush damage to target. May inflict Stupefied for 3 rounds.`   
}

export class DragonBreath implements SpecialMove {
    name: string = "Dragon's Breath";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 3;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Line,
        range: 1
    };
    damage: Damage = {
        amount: 25,
        type: DamageType.Fire   
    };
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const flameThrowerResults = getAllTargets.map(AOETarget => {
            const result = combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true, this.turnCost);
            if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
                combatMaster.tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.BURNING, 3, 0.6);
            }
            return result;
        });
        return flameThrowerResults;
    };
    checkRequirements = undefined
    description = `Medium Fire damage to target, chance to inflict Burning for 3 rounds.`   
}

export class DragonFireBall implements SpecialMove {
    name: string = "Inferno";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 3;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 3
    };
    damage: Damage = {
        amount: 30, 
        type: DamageType.Fire
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const damage = this.damage;
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const fireBallResults = getAllTargets.map(AOETarget => {
            const result = combatMaster.executeAttack(invoker, AOETarget, board, damage, true);
            return result;
        });

        return fireBallResults;
    };  
    checkRequirements = undefined
    description = `Medium Fire damage to all targets in a 1-tile radius nova.`   
}

export class DieMortal implements SpecialMove {
    name: string = "Die, Mortal!";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
    };
    damage: Damage = {
        amount: 999,
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage, true);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            return getDamageActionResult(this.damage, target, this.turnCost);
        }
        return result;
    };
    checkRequirements = undefined
    description = `Kills an enemy instantly in a flash of glory.`   
}

export class ArcBolt implements SpecialMove {
    name: string = "Arc Shot";
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
        type: DamageType.Pierce
    };  
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `Medium Pierce damage to target.`   
}

export class SharpenalShell implements SpecialMove {
    name: string = "Sharpenal Shell";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 5
    };
    damage: Damage = {
        amount: 25,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const shellResults = getAllTargets.map(AOETarget => {
            const shellDamage = {amount: 25, type: isSamePosition(AOETarget, target) ? DamageType.Crush : DamageType.Pierce};
            const result = combatMaster.executeAttack(invoker, AOETarget, board, shellDamage, true);
            return result;
        });
        invoker.applyStatusEffect({
            name: StatusEffectType.RELOAD,
            duration: 2,
        }); 

        return shellResults;
    }
    checkRequirements = (self: Combatant) => {
        return self.hasStatusEffect(StatusEffectType.INGENIOUS_UPGRADE) && !self.hasStatusEffect(StatusEffectType.RELOAD);
    }
    description = 'Medium crush damage to targtet, Medium pierce damage in 1-tile radius nova. 2 rounds cooldown to reload.'
}
    

export class ScorpionBolt implements SpecialMove {
    name: string = "Scorpion Bolt";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 10;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Line,
        range: 5
    };
    damage: Damage = {
        amount: 25,
        type: DamageType.Pierce
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const scorpionResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true);
        });

        return scorpionResults;
    }
    checkRequirements = (self: Combatant) => {
        return self.hasStatusEffect(StatusEffectType.INGENIOUS_UPGRADE);
    }
    description = `Medium Pierce damage to all targets in a 3-tile line.`   
}

export class TeleportBlast implements SpecialMove {
    name: string = "Teleport Blast";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 1;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 4
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Fire
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.move(target, board);
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.All);
        const blastResults = getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(targetCombatant && targetCombatant.name !== invoker.name) {
                return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true);
            }
            return getStandardActionResult(AOETarget, this.turnCost);
        });
        return blastResults;
    };
    checkRequirements = (self: Combatant) => {
        return self.hasStatusEffect(StatusEffectType.INGENIOUS_UPGRADE);
    }
    description = `Teleport to target tile, then explode and damage everyone in a 1-tile nova radius.`
}

export class TwinSpin implements SpecialMove {
    name: string = "Twin Spin";
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
        amount: 25,
        type: DamageType.Slash
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult();
        }
        let skillDamage = this.damage.amount;
        if(invoker.hasStatusEffect(StatusEffectType.CLOAKED) || board.isFlanked(targetCombatant!)) {
            skillDamage = this.damage.amount * 1.5;
        }
        
        const adjacentCombatants = board.getAdjacentCombatants(targetCombatant,1);
        const isTwinAdjacent = adjacentCombatants.filter(c => !c.isKnockedOut())
        .filter(c => c.name !== invoker.name)
        .some(adjacentCombatant => adjacentCombatant.getCombatantType() === CombatantType.TwinBlades);

        if(isTwinAdjacent) {
            skillDamage = skillDamage * 2;
        }
        const result = combatMaster.executeAttack(invoker, target, board, {amount: skillDamage, type: DamageType.Slash});
        return result;
    };
    checkRequirements = undefined;
    description = `Medium Slashe damage to target. 50% more damage if target is flanked or attacker is cloaked. Double damage if
    another allied Twin Blade is adjacent to the target.`   
}

export class YouScumBag implements SpecialMove {
    name: string = "You ScumBag!";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 1;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 50
    };
    damage: Damage = {
        amount: 40,
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult();
        }
        targetCombatant.takeDamage({amount: this.damage.amount, type: this.damage.type});
        return getDamageActionResult(this.damage, target, 1);
    };
    checkRequirements = undefined;
    description = `You are a lowly, filthy, maggot scumbag and you should die!`
}

export class Stinger implements SpecialMove {
    name: string = "Stinger";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 2;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 8
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Pierce
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `Medium Pierce damage to target`   
}

export class Slicer implements SpecialMove {
    name: string = "Slicer";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 2;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Slash
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `Medium Slash damage to target`   
}

export class GorillaSmash implements SpecialMove {
    name: string = "Gorilla Smash!";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 2;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 1
    };
    damage: Damage = {
        amount: 40,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const whirlwindAttackResults = getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(!targetCombatant || targetCombatant.name === invoker.name) {
                return getStandardActionResult(AOETarget, this.turnCost);
            }
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true, this.turnCost);
        });

        return whirlwindAttackResults;
    };
    checkRequirements = (self: Combatant) => {
        return!self.hasMoved;
    };
    description = `Medium Crush damage to all enemies around you.`   
}