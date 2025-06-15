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
    description: string = "Strike an adjacent enemy with your shield, pushing them back and potentially knocking them staggered.";
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
                targetCombatant?.takeDamage({amount: 10, type: DamageType.Crush});
                getPushResult.collisionObject?.takeDamage({amount: 10, type: DamageType.Crush});
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
    description: string = "Fire a barrage of arrows to the sky, raining down on all enemies in a cross-shaped area.";
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
    description: string = "Ignite your arrows with fire and brimstone, and launch them in a massive crosse shaped volley";
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
    description: string = "Through most pure prayer, call for the heavens to smite your enemies with holy fire, and bath your allies with healing energy.";
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
    description: string = "Call down a beam of moonlight to strike your enemies, causing them to bleed out.";
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
    description: string = "Perform a deadly spin, cleaving at everyone around you.";
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
    description = `Charge your weapon with the gift of electricity, and strike through a line of targets, dealing medium Lightning damage.`
}

export class SkeweringHarppon extends CoopMove {
    name: string = "Skewering Harppon";
    description: string = "Charge your weapon with the gift of electricity, and strike through a line of targets, dealing medium Lightning damage.";
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
    description: string = "Call upon the hunger of Zirash to strike your enemies, causing them to bleed out.";
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
        range: 6
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
    description: string = "Strike your enemy, damage increases with every ally standing by the target.";
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

export class RuptureTendons extends CoopMove {
    name: string = "Rupture Tendons";
    description: string = "Strike your enemies ankles, making every step of their a pain. they lose health for every step they take.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Rogue, CombatantType.Vanguard, CombatantType.Pikeman] }
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
    cost: number = coopCostSlash ? 5 : 8;
    turnCost: number = 1;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(target, this.turnCost);
        }
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage, true, this.turnCost);
        combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.RUPTURE_TENDONS, 3, 0.9);
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
    description: string = "Sneak attack an enemy as an offering to the goddess of death, if the target dies, you gain boons according to the percentage of health the target had before you attacked.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Rogue, CombatantType.Witch, CombatantType.Fool, CombatantType.Wizard] },
        { combatantTypeOptions: [CombatantType.Healer, CombatantType.FistWeaver, CombatantType.StandardBearer] }
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
    turnCost: number = 3;
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
                    name: StatusEffectType.CLOAKED,
                    duration: 5,
                });
            },
        ];

        const combatMaster = CombatMaster.getInstance();
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(target, this.turnCost);
        }
        const initialHp = targetCombatant.stats.hp;
        let skillDamage = this.damage.amount;
        if(invoker.hasStatusEffect(StatusEffectType.CLOAKED) || board.isFlanked(targetCombatant!)) {
            skillDamage = this.damage.amount * 1.5;
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
            }
        }
            
        
        return result;

        function getBoons(boonAmount: number) {
            const boonsShuffled = shuffleArray(boons);
            return boonsShuffled.slice(0, boonAmount);
        }


        function getBoonAmount(healthPercentage: number) {
            if(healthPercentage === 100) {
                return 4;
            } else if(healthPercentage >= 60) {
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
    description: string = "Kick your enemy thrice with wonderful alacrity. If all kicks land, a lightning bolt will strike them as well.";
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
    description: string = "Strike your enemy with a scythe of souls, causing them to bleed out.";
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
            targetCombatant.takeDamage({amount: targetCombatant.stats.hp, type: DamageType.Unstoppable});
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
    description: string = "Take careful aim and launch a hyper accurate shot at your enemy. goes beyond obstacles, high chance for critical hit.";
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
    description: string = "Launch a poisoned arrow at your enemy, causing them to bleed out.";
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
    description: string = "Unleashes the Wizard's full hidden, Forbidden potential in a terrifying blast that no protection can stop, dealing massive damage.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Witch, CombatantType.Fool, CombatantType.Artificer] },
        { combatantTypeOptions: [CombatantType.Vanguard, CombatantType.Pikeman, CombatantType.FistWeaver, CombatantType.StandardBearer] }
    ];
    damage: Damage = {
        amount: 90,
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
    description: string = "Fall on your enemies with a mighty blow powered with the wrath of the skies, striking the target and whoever behind with the power of lightning";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Artificer, CombatantType.FistWeaver] },
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
    description: string = "Grab an enemy, pull him to you, then strike him. He can not move or attack you without being struck again.";
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
    description: string = "Medium fire damage in a line, chance to inflinct burn";
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