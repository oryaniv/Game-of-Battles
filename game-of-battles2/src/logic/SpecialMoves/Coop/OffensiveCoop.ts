import { CombatantType } from "@/logic/Combatants/CombatantType";
import { CoopMove } from "./CoopMove";
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
import { StatusEffect, StatusEffectAlignment, StatusEffectType } from "@/logic/StatusEffect";


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
    cost: number = 5;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const result = combatMaster.executeAttack(invoker, target, board, this.damage);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            const targetCombatant = board.getCombatantAtPosition(target);
            combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.STAGGERED, 1, 0.6);
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
        { combatantTypeOptions: [CombatantType.Hunter, CombatantType.StandardBearer] }
    ];
    damage: Damage = {
        amount: 20,
        type: DamageType.Pierce
    };
    cost: number = 10;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const rainOfArrowsResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true);
        });

        // eslint-disable-next-line
        debugger;
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
        { combatantTypeOptions: [CombatantType.Hunter] },
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Witch] }
    ];
    damage: Damage = {
        amount: 30,
        type: DamageType.Fire
    };
    cost: number = 12;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const brimstoneRainResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true);
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
    cost: number = 15;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const queensWrathMothersLoveResults = getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(!targetCombatant) {  
                return getStandardActionResult();
            }
            if(targetCombatant.team === invoker.team) {
                targetCombatant.stats.hp = Math.min(targetCombatant.stats.hp + 40, targetCombatant.baseStats.hp);
                return {
                    attackResult: AttackResult.Hit,
                    damage: {
                        amount: 40,
                        type: DamageType.Healing
                    },
                    cost: 2,
                    reaction: DamageReaction.NONE,
                    position: AOETarget
                }
            } else {
                return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true);
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
        amount: 30,
        type: DamageType.Holy
    };
    cost: number = 6;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const moonBeamResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true);
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
    cost: number = 10;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const whirlwindAttackResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true);
        });

        return whirlwindAttackResults;
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Melee,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 1
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class ThunderLance extends CoopMove {
    name: string = "Thunder Lance";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 8;
    turnCost: number = 1;
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.FistWeaver] }
    ];
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Line,
        range: 1
    };
    damage: Damage = {
        amount: 30,
        type: DamageType.Lightning
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const thunderLanceResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true);
        });

        return thunderLanceResults;
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
        amount: 20,
        type: DamageType.Pierce
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Line,
        range: 4
    };
    cost: number = 10;
    meterCost: number = 0;
    turnCost: number = 2;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const skeweringHarpponResults = getAllTargets.map(AOETarget => {
            return combatMaster.executeAttack(invoker, AOETarget, board, this.damage, true);
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
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Witch] },
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
    cost: number = 15;
    meterCost: number = 0;
    turnCost: number = 3;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const hungerOfZirashResults = getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(!targetCombatant) {
                return getStandardActionResult();
            }
            const negativeStatusEffects: StatusEffect[] = targetCombatant.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative);
            const length = negativeStatusEffects.length;
            const damage = {type: this.damage.type, amount: this.damage.amount * (1 + length)};
            return combatMaster.executeAttack(invoker, AOETarget, board, damage, true);
        });

        return hungerOfZirashResults;
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

