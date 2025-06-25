import { CombatantType } from "@/logic/Combatants/CombatantType";
import { coopCostSlash, CoopMove } from "./CoopMove";
import { CoopPartnerRequirement } from "./CoopMove";
import { Damage, DamageReaction, DamageType } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { ActionResult, AttackResult, getStandardActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { SpecialMoveAlignment } from "@/logic/SpecialMove";
import { SpecialMoveAreaOfEffect } from "@/logic/SpecialMove";
import { SpecialMoveRange } from "@/logic/SpecialMove";
import { CombatMaster } from "@/logic/CombatMaster";
import { getResultsForStatusEffectHook, StatusEffect, StatusEffectAlignment, StatusEffectHook, StatusEffectType } from "@/logic/StatusEffect";
import { shuffleArray } from "@/logic/AI/AIUtils";
import { FistWeaver } from "@/logic/Combatants/FistWeaver";


export class ShieldBash extends CoopMove {
    name: string = "Shield Bash";
    description: string = "Medium Crush damage to target, chance to Stagger them for 3 rounds, and push them up to 2 tiles back. If they hit something on the way, they'll stop, and both them and the obstacle will suffer a small amount of damage.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Vanguard, CombatantType.FistWeaver] }
    ];
    damage: Damage = {
        amount: 20,
        type: DamageType.Crush
    };
    cost: number = coopCostSlash ? 3 : 5;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage, false, this.turnCost);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            const targetCombatant = board.getCombatantAtPosition(target);
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.STAGGERED, 3, 0.6);
            const getPushResult = board.getPushResult(invoker, targetCombatant!, 2);
            if(!getPushResult) {
                return result;
            }
            if(getPushResult.moveTo) {
                targetCombatant!.move(getPushResult.moveTo, board);
            }
            if(getPushResult.collisionObject) {
                targetCombatant?.takeDamage({amount: 10, type: DamageType.Crush}, board);
                getPushResult.collisionObject?.takeDamage({amount: 10, type: DamageType.Crush}, board);
            }
        }
        return result;
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    turnCost: number = 1;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class RainOfArrows extends CoopMove {
    name: string = "Rain of Arrows";
    description: string = "Medium Pierce damage to all targets in a 1-tile cross-shaped area.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Hunter, CombatantType.StandardBearer, CombatantType.Pikeman, CombatantType.Rogue] }
    ];
    damage: Damage = {
        amount: 20,
        type: DamageType.Pierce
    };
    cost: number = coopCostSlash ? 6 : 10;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const rainOfArrowsResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true, this.turnCost);
        });

        return rainOfArrowsResults;
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Cross,
        range: 6
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class BrimstoneRain extends CoopMove {
    name: string = "Brimstone Rain";
    description: string = "Medium Fire damage to all targets in a 1-tile cross-shaped area, chance to inflict Burning for 3 rounds.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Hunter, CombatantType.StandardBearer, CombatantType.Pikeman, CombatantType.Rogue] },
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Artificer] }
    ];
    damage: Damage = {
        amount: 30,
        type: DamageType.Fire
    };
    cost: number = coopCostSlash ? 8 : 12;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const brimstoneRainResults = getAllTargets.map(AOETarget => {
            const result = combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true, this.turnCost);
            if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
                combatMaster.tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.BURNING, 3, 0.6);
            }
            return result;
        });

        return brimstoneRainResults;
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Cross,
        range: 6
    };
    turnCost: number = 3;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class QueensWrathMothersLove extends CoopMove {
    name: string = "Queen's Wrath, Mother's Love";
    description: string = "All targets in a 1-tile radius nova, allies are healed for medium amount of health, enemies are dealt medium Holy damage.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Healer, CombatantType.StandardBearer, CombatantType.FistWeaver] },
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Witch] }
    ];
    damage: Damage = {
        amount: 30,
        type: DamageType.Holy
    };
    cost: number = coopCostSlash ? 10 : 15;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const queensWrathMothersLoveResults = getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(!targetCombatant) {  
                return getStandardActionResult();
            }
            if(targetCombatant.team === invoker.team && targetCombatant.isOrganic()) {
                targetCombatant.stats.hp = Math.min(targetCombatant.stats.hp + 40, targetCombatant.baseStats.hp);
                return {
                    attackResult: AttackResult.Hit,
                    damage: {
                        amount: 40,
                        type: DamageType.Healing
                    },
                    cost: 3,
                    reaction: DamageReaction.NONE,
                    position: AOETarget
                }
            } else {
                return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true, this.turnCost);
            }
        });

        return queensWrathMothersLoveResults;
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 4
    };
    turnCost: number = 3;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class MoonBeam extends CoopMove {
    name: string = "Moon Beam";
    description: string = "All targets in a 3-tile line are dealt medium Holy damage.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Healer] }
    ];
    damage: Damage = {
        amount: 35,
        type: DamageType.Holy
    };
    cost: number = coopCostSlash ? 6 : 9;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const moonBeamResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true, this.turnCost);
        });

        return moonBeamResults;
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Line,
        range: 1
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}
        
export class WhirlwindAttack extends CoopMove {
    name: string = "Whirlwind Attack";
    description: string = "All targets in a 1-tile nova around you are dealt medium Slash damage.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Vanguard, CombatantType.Pikeman] }
    ];
    damage: Damage = {
        amount: 35,
        type: DamageType.Slash
    };
    cost: number = coopCostSlash ? 7 : 10;
    meterCost: number = 0;
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
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 1
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class ColdEdge extends CoopMove {
    name: string = "Cold Edge";
    triggerType = SpecialMoveTriggerType.Cooperative;
    cost: number = coopCostSlash ? 6 : 8;
    turnCost: number = 1;
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Artificer, CombatantType.Healer] }
    ];
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Line,
        range: 1
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Ice
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const coldEdgeResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true, this.turnCost);
        });

        return coldEdgeResults;
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    
    meterCost: number = 0;
    description = `Medium Ice damage to all targets in a 1-tile line.`
}

export class SkeweringHarppon extends CoopMove {
    name: string = "Skewering Harppon";
    description: string = "Medium Pierce damage to all targets in a 3-tile line in a 4-tile range.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Hunter, CombatantType.Pikeman] }
    ];
    damage: Damage = {
        amount: 25,
        type: DamageType.Pierce
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Line,
        range: 4
    };
    cost: number = coopCostSlash ? 4 : 10;
    meterCost: number = 0;
    turnCost: number = 2;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const skeweringHarpponResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true, this.turnCost);
        });

        return skeweringHarpponResults;
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class HungerOfZirash extends CoopMove {
    name: string = "Hunger of Zirash";
    description: string = "Medium Dark damage to all targets in a 1-tile radius nova, and removes all of their negative status effects. For each negative status effect removed, the damage is repeated.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Witch, CombatantType.Rogue] },
        { combatantTypeOptions: [CombatantType.Healer, CombatantType.FistWeaver, CombatantType.Fool] }
    ];
    damage: Damage = {
        amount: 20,
        type: DamageType.Dark
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 5
    };
    cost: number = coopCostSlash ? 9 : 15;
    meterCost: number = 0;
    turnCost: number = 3;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const hungerOfZirashResults = getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(!targetCombatant) {
                return getStandardActionResult(AOETarget, this.turnCost);
            }
            const negativeStatusEffects: StatusEffect[] = targetCombatant.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative);
            const length = negativeStatusEffects.length;
            const damage = {type: this.damage.type, amount: this.damage.amount * (1 + length)};
            const result = combatMaster.executeAttack(invoker, AOETarget, board, damage, true, this.turnCost);
            if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
                for(const statusEffect of negativeStatusEffects) {
                    targetCombatant?.removeStatusEffect(statusEffect.name);
                }
            }
            return result;
        });

        return hungerOfZirashResults;
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class StrikeAsOne extends CoopMove {
    name: string = "Strike as One";
    description: string = "Medium Crush damage to target, damage increases by 25% of base damage for each ally adjacent to the target.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Vanguard, CombatantType.FistWeaver, 
            CombatantType.Pikeman] }
    ];
    cost: number = coopCostSlash ? 5 : 8;
    meterCost: number = 0;
    damage: Damage = {
        amount: 20,
        type: DamageType.Crush
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    turnCost: number = 1;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(target, this.turnCost);
        }
        const adjacentCombatants = board.getAdjacentCombatants(targetCombatant, 1);
        const result = CombatMaster.getInstance().executeAttack(invoker, target, board, {
            amount: this.damage.amount * (1 + (adjacentCombatants.length * 0.25)),
            type: this.damage.type,
        });
        return result;
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class ForbiddenArt extends CoopMove {
    name: string = "Forbidden Art";
    description: string = "medium dark damage, and inflicts forbidden affliction for 3 rounds. target takes damage for every step and attack roll.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Rogue, CombatantType.Vanguard, CombatantType.Pikeman, CombatantType.Witch] }
    ];
    damage: Damage = {
        amount: 20,
        type: DamageType.Dark
    };  
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    cost: number = coopCostSlash ? 7 : 10;
    turnCost: number = 1;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(target, this.turnCost);
        }
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage, true, this.turnCost);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            const targetCombatant = board.getCombatantAtPosition(target);
            if(targetCombatant) {
                targetCombatant.applyStatusEffect({
                    name: StatusEffectType.FORBIDDEN_AFFLICTION,
                    duration: 3,
                });
            }
        }
        return result;
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    meterCost: number = 0;
}

export class DanceOfDaggers extends CoopMove {
    name: string = "Dance of Daggers";
    description: string = "Strike your enemies with a flurry of daggers, causing them to bleed out.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Rogue, CombatantType.Fool, CombatantType.Hunter] }
    ];
    damage: Damage = {
        amount: 20,
        type: DamageType.Slash
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Cross,
        range: 1
    };
    turnCost: number = 2;
    cost: number = coopCostSlash ? 7 : 9;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const danceOfDaggersResults = getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(!targetCombatant || targetCombatant.name === invoker.name) {
                return getStandardActionResult(AOETarget, this.turnCost);
            }
            const attackResult = combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true, this.turnCost);
            if(attackResult.attackResult === AttackResult.Hit || attackResult.attackResult === AttackResult.CriticalHit) {
                combatMaster.tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.BLEEDING, 3, 0.6);
            }
            return attackResult;
        });
        return danceOfDaggersResults;
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    meterCost: number = 0;
}


export class KarithrasBoon extends CoopMove {
    name: string = "Karithras Boon";
    description: string = "Attack an enemy. if it dies, get buffs according to target health percent lost. Double damage while cloaked";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        // { combatantTypeOptions: [CombatantType.Rogue, CombatantType.Witch, CombatantType.Fool, CombatantType.Wizard] },
        // { combatantTypeOptions: [CombatantType.Healer, CombatantType.FistWeaver, CombatantType.StandardBearer] }
        { combatantTypeOptions: [CombatantType.Fool, CombatantType.Witch, CombatantType.StandardBearer, CombatantType.Rogue, CombatantType.Vanguard] }
    ];
    damage: Damage = {
        amount: 20,
        type: DamageType.Slash
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    turnCost: number = 2;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const boons = [
            (recipient: Combatant) => { 
                recipient.applyStatusEffect({
                    name: StatusEffectType.MOBILITY_BOOST,
                    duration: 3,
                });
            },
            (recipient: Combatant) => {
                recipient.applyStatusEffect({
                    name: StatusEffectType.RALLIED,
                    duration: 3,
                });
            },
            (recipient: Combatant) => {
                recipient.applyStatusEffect({
                    name: StatusEffectType.FOCUS_AIM,
                    duration: 3,
                });
            },
            (recipient: Combatant) => {
                recipient.applyStatusEffect({
                    name: StatusEffectType.ENCOURAGED,
                    duration: 3,
                });
            },
            (recipient: Combatant) => {
                recipient.applyStatusEffect({
                    name: StatusEffectType.REGENERATING,
                    duration: 5,
                });
            },
            (recipient: Combatant) => {
                recipient.applyStatusEffect({
                    name: StatusEffectType.FORTIFIED,
                    duration: 5,
                });
            },
            // (recipient: Combatant) => {
            //     recipient.applyStatusEffect({
            //         name: StatusEffectType.CLOAKED,
            //         duration: 5,
            //     });
            // },
        ];

        const combatMaster = CombatMaster.getInstance();
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(target, this.turnCost);
        }
        const initialHp = targetCombatant.stats.hp;
        let skillDamage = this.damage.amount;
        if(invoker.hasStatusEffect(StatusEffectType.CLOAKED)) {
            skillDamage = this.damage.amount * 2;
        }
        const result = combatMaster.executeAttack(invoker, target, board, {type: this.damage.type, amount: skillDamage}, true, this.turnCost);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            if(targetCombatant?.stats.hp <= 0) {
                const healthPercentage = Math.floor((initialHp / targetCombatant.baseStats.hp) * 100);
                const boonAmount = getBoonAmount(healthPercentage);
                const boons = getBoons(boonAmount);
                boons.forEach(boon => {
                    boon(invoker);
                });
                if(healthPercentage >= 1000) {
                    invoker.applyStatusEffect({
                        name: StatusEffectType.CLOAKED,
                        duration: 5,
                    });
                }
            }
        }
            
        
        return result;

        function getBoons(boonAmount: number) {
            const boonsShuffled = shuffleArray(boons);
            return boonsShuffled.slice(0, boonAmount);
        }

        function getBoonAmount(healthPercentage: number) {
            if(healthPercentage >= 60) {
                return 3;
            } else if(healthPercentage >= 30) {
                return 2;
            } else {
                return 1;
            }
        }
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    meterCost: number = 0;
    cost: number = coopCostSlash ? 10 : 15;
}

export class LightningKicks extends CoopMove {
    name: string = "Lightning Kicks";
    description: string = "Low Crush damage to target, 3 times. If all attacks land, they are dealt medium Lightning damage as well.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Vanguard, CombatantType.Pikeman, CombatantType.FistWeaver] }
    ];
    damage: Damage = {
        amount: 20,
        type: DamageType.Crush
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    turnCost: number = 2;
    cost: number = coopCostSlash ? 7 : 10;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const kickResults: ActionResult[] = [];
        for(let i = 0; i < 3; i++) {
            const kickResult = combatMaster.executeAttack(invoker, target, board, this.damage, true, this.turnCost);
            kickResults.push(kickResult);
        }
        if(kickResults.every(result => result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit)) {
            const lightningBoltResult = combatMaster.executeAttack(invoker, target, board, {type: DamageType.Lightning, amount: 20}, true, this.turnCost);
            return [...kickResults, lightningBoltResult];
        }
        return kickResults;
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    meterCost: number = 0;
}

export class SoulScythe extends CoopMove {
    name: string = "Soul Scythe";
    description: string = "Low chance to drop target to 0 health. Chance increases for each negative status effect on the target, as well as for every % of missing health.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Vanguard, CombatantType.Pikeman, CombatantType.Rogue] }
    ];
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    cost: number = coopCostSlash ? 6 : 10;
    turnCost: number = 1;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(target, this.turnCost);
        }
        const targetHp = targetCombatant.stats.hp;
        const targetMaxHp = targetCombatant.baseStats.hp;
        const targetNegativeStatusEffects = targetCombatant.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative);
        const chanceToKill = 10 + 
                            (targetNegativeStatusEffects.length * 10) + 
                            calcChanceByMissingHealth(targetHp, targetMaxHp) + 
                            ((invoker.stats.luck - targetCombatant.stats.luck) * 0.02);
        const randomNumber = Math.floor(Math.random() * 100);
        if(randomNumber <= chanceToKill) {
            targetCombatant.takeDamage({amount: targetCombatant.stats.hp, type: DamageType.Unstoppable}, board);
            if(targetCombatant.isKnockedOut()) {
                getResultsForStatusEffectHook(invoker, StatusEffectHook.OnKilling, targetCombatant, undefined, 1, board);
            }
        }
        return getStandardActionResult(target, this.turnCost);

        function calcChanceByMissingHealth(targetHp: number, targetMaxHp: number) {
            const missingHp = targetMaxHp - targetHp;
            const missingHpPercentage = (missingHp / targetMaxHp) * 100;
            return missingHpPercentage / 2;
        }
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    meterCost: number = 0;
}

export class SnipeShot extends CoopMove {
    name: string = "Snipe Shot";
    description: string = "Medium Pierce damage to target with increased attack power and agility. Curved trajectory.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Hunter, CombatantType.Vanguard, CombatantType.FistWeaver] }
    ];
    damage: Damage = {
        amount: 20,
        type: DamageType.Pierce
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 5
    };
    turnCost: number = 1;
    cost: number = coopCostSlash ? 5 : 9;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        invoker.stats.agility += 10;
        invoker.stats.attackPower += 20;
        const result = combatMaster.executeAttack(invoker, target, board, this.damage, true, this.turnCost);
        invoker.stats.agility -= 10;
        invoker.stats.attackPower -= 20;
        return result;
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    meterCost: number = 0;
}

export class PlagueArrow extends CoopMove {
    name: string = "Plague Arrow";
    description: string = "Medium Blight damage to target, chance to inflict Plagued for 3 rounds. Plagued enemies may inflict plageud on their friends";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Artificer, CombatantType.Witch, CombatantType.Fool] }
    ];
    damage: Damage = {
        amount: 20,
        type: DamageType.Blight
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 8
    };
    turnCost: number = 1;
    cost: number = coopCostSlash ? 5 : 7;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage, false, this.turnCost);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.PLAGUED, 3, 0.6);
        }
        return result;
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    meterCost: number = 0;
}

export class CatastrophicCalamity extends CoopMove {
    name: string = "Catastrophic Calamity";
    description: string = "Massive Unstoppable damage to all targets in a 2-tile radius nova. Requires both Arcane Channeling and Arcane Overcharge.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Witch, CombatantType.Fool, CombatantType.Artificer] },
        { combatantTypeOptions: [CombatantType.Vanguard, CombatantType.Pikeman, CombatantType.FistWeaver, CombatantType.StandardBearer, CombatantType.Defender] }
    ];
    damage: Damage = {
        amount: 100,
        type: DamageType.Unstoppable
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Great_Nova,
        range: 5
    };
    turnCost: number = 3;
    cost: number = coopCostSlash ? 12 : 18;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        invoker.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const CatastrophicCalamityResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true, this.turnCost);
        });
        invoker.removeStatusEffect(StatusEffectType.ARCANE_OVERCHARGE);
        invoker.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);

        return CatastrophicCalamityResults;
    };
    checkRequirements = (self: Combatant) => {
        const charged = self.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE) && self.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING);
        return this.checkCoopRequirements(self) && charged;
    };
}

export class SkySovereignsWrath extends CoopMove {
    name: string = "Sky Sovereign's Wrath";
    description: string = "Medium Lightning damage to all targets in a 3-tile line.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Artificer] },
    ];
    damage: Damage = {
        amount: 25,
        type: DamageType.Lightning
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Line,
        range: 1
    };
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const wrathResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true, this.turnCost);
        });

        return wrathResults;
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    turnCost: number = 1;
    cost: number = coopCostSlash ? 6 : 10;
    meterCost: number = 0;
}

export class DiamondHook extends CoopMove {
    name: string = "Diamond Hook";
    description: string = "Target is grabbed and pulled, dealt low pierce damage, and then attacked again for Medium Pierce damage. If the attack hits, the target is hooked to the attacker.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Artificer, CombatantType.Vanguard, CombatantType.Defender, CombatantType.StandardBearer] }
    ];
    damage: Damage = {
        amount: 10,
        type: DamageType.Pierce
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 5
    };
    turnCost: number = 2;
    cost: number = coopCostSlash ? 8 : 12;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const results = []
        const result = combatMaster.executeAttack(invoker, target, board, this.damage, true, this.turnCost);
        results.push(result);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            const targetCombatant = board.getCombatantAtPosition(target);
            if(!targetCombatant) {
                return result;
            }
            const pullResult = board.getPullResult(invoker, targetCombatant, 5);
            if(!pullResult || pullResult.pullDistance === 0) {
                return result;
            }
            targetCombatant.move(pullResult.moveTo, board);

            const afterPullAttackResult = combatMaster.executeAttack(invoker, pullResult.moveTo, board, {
                type: DamageType.Pierce,
                amount: invoker.basicAttack().amount * (1 + (0.1 * pullResult.pullDistance)),
            }, true, this.turnCost);

            results.push(afterPullAttackResult);

            if(afterPullAttackResult.attackResult === AttackResult.Hit || afterPullAttackResult.attackResult === AttackResult.CriticalHit) {
                targetCombatant.applyStatusEffect({
                    name: StatusEffectType.DIAMOND_HOOKED,
                    duration: 5,
                });
                targetCombatant.addRelatedCombatant('DIAMOND_HOOKED', invoker);
    
                invoker.applyStatusEffect({
                    name: StatusEffectType.DIAMOND_HOOKED_HOLDING,
                    duration: 5,
                });
                invoker.addRelatedCombatant('DIAMOND_HOOKED_HOLDING', targetCombatant);
            }            
        }
        return results;
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self) && !self.hasStatusEffect(StatusEffectType.DIAMOND_HOOKED_HOLDING);
    };
}

export class FlameThrower extends CoopMove {
    name: string = "Flame Thrower";
    description: string = "Medium fire damage in a 3-tile line, chance to inflinct burn";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Artificer, CombatantType.Vanguard] }
    ];
    damage: Damage = {
        amount: 20,
        type: DamageType.Fire
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Line,
        range: 1
    };
    turnCost: number = 1;
    cost: number = coopCostSlash ? 5 : 8;
    meterCost: number = 0;
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
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}