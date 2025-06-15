import { DamageReaction, DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { isSamePosition, Position } from "@/logic/Position";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { Board } from "@/logic/Board";
import { StatusEffectType, StatusEffectHook, StatusEffect, StatusEffectAlignment } from "@/logic/StatusEffect";
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
    description = `Ignite an enemy with Malicious fire and deal medium Fire damage.`   
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
        range: 6
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
    description = `medium fire damage at a long range` 
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
        range: 6
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
    description = `medium Ice damage at a long range` 
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
        amount: 30,
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
            if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
                CombatMaster.getInstance().tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.BURNING, 1, 0.6);
            }
            return result;
        });

        return fireBallResults;
    };
    checkRequirements = (self: Combatant) => {
        return self.statusEffects.some((effect) => effect.name === StatusEffectType.ARCANE_CHANNELING);
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
            }
        }
        return chainLightningResults;
    };
    checkRequirements = (self: Combatant) => {
        return self.statusEffects.some((effect) => effect.name === StatusEffectType.ARCANE_CHANNELING);
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
        amount: 15,
        type: DamageType.Holy
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board, this.damage);
        return result;
    };
    checkRequirements = undefined
    description = `Strike an enemy with a beam of holy retribution, dealing low Holy damage.`   
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
    description = `Launch an arrow coated in a deadly poison, dealing medium Blight damage and having a medium chance to inflict Poisoned for 3 turns.`   
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
    description = `Stab the enemy where it hurts, dealing medium Pierce damage.`
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
    description = `Stab the enemy where it hurts, dealing medium Pierce damage and having a medium chance to inflict Bleeding for 3 turns.`   
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
    description = `Strike an enemy with a powerful haft, dealing medium Crush damage.`   
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
    description = `Strike at the enemy in a wild frenzy, Swinging 3 times but at the cost of a small chance to miss every time regardless.`   
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
    description = `Swing at an enemy's armor and shields, ripping them away and opening them up to attack.`   
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
    description = `Swing your blade in a wide arc, dealing massive Slash damage to all in the area.`   
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
    description = `Charge at an enemy with a blade held high, damage increasees the more panels you move in the process`   
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
    description = `Let your feet run on the wind itself, then drop by an enemy and strike them by surprise.`   
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
                targetCombatant?.takeDamage({amount: 10, type: DamageType.Crush});
                getPushResult.collisionObject?.takeDamage({amount: 10, type: DamageType.Crush});
            }
        }
        return result;
    };
    checkRequirements = undefined
    description = `Strike an enemy with a powerful fist, dealing medium Crush damage and pushing them up to 3 panels back.
    if they hit something on the way, they'll stop, and both them and the obstacle will suffer a small amount of damage.`   
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
    description = `Imbue your fist with the gift of the heavens, deal massive holy damage to an enemy, and may kill it outright.`   
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
    description = `Strike the target with a dagger coated with deadly poison, dealing medium Blight damage and having a medium chance to inflict Poisoned for 3 turns.`   
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
    description = `Strike an unsuspecting enemy, either from invisibility or from from the flank, for considerable pierce damage`   
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
    description = `Use your handy electrified gauntlet to shock an enemy from up close, dealing medium Lightning damage and having a small chance to inflict Staggered for 3 turns.`   
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
    description = `Strike an enemy with your horns, dealing medium Pierce damage.`   
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
    description = `Strike an enemy with your claws, dealing medium Slash damage.`   
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
    description = `Strike an enemy with your mighty foot, dealing medium Crush damage.`   
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
    description = `Strike an enemy with your venomous spit, dealing medium Blight damage, may also poison them for 3 turns.`   
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
        amount: 30,
        type: DamageType.Fire   
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.BURNING, 3, 0.5);
        }
        return result;
    };
    checkRequirements = undefined
    description = `Breathe fire on an enemy, dealing medium Fire damage and may inflict Burning for 3 turns.`   
}

export class DragonFireBall implements SpecialMove {
    name: string = "Dragon Fire Ball";
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
    description = `Cast a ball of fire, dealing medium Fire damage.`   
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
    description = `Shoot a bolt in an arc, dealing medium Pierce damage.`   
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
    description = 'medium crush damage to targtet, medium pierce damage to everyone around it. 2 rounds cooldown to reload.'
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
    description = `Shoot a bolt in an arc, dealing medium Pierce damage.`   
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
    description = `Shoot a bolt in an arc, dealing medium Pierce damage.`
}