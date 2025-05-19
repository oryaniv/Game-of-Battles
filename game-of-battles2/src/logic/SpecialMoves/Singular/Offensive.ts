import { DamageReaction, DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { Position } from "@/logic/Position";
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
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const fireBallResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true);
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
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.FROZEN, 2, 0.9);
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
        const chainTargets = board.getChainTargets(invoker, target, 1, 2);
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
        type: SpecialMoveRangeType.Straight,
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
        type: SpecialMoveRangeType.Straight,
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
        return !self.hasMoved
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
                targetCombatant!.stats.hp -= 10;
                getPushResult.collisionObject.stats.hp -= 10;
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
    cost: number = 12;
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
