import { CombatantType } from "@/logic/Combatants/CombatantType";
import { coopCostSlash, CoopMove } from "./CoopMove";
import { CoopPartnerRequirement } from "./CoopMove";
import { Damage, DamageReaction, DamageType } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { ActionResult, AttackResult, getStandardActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { SpecialMoveRangeType } from "@/logic/SpecialMove";
import { SpecialMoveAlignment } from "@/logic/SpecialMove";
import { SpecialMoveAreaOfEffect } from "@/logic/SpecialMove";
import { SpecialMoveRange } from "@/logic/SpecialMove";
import { CombatMaster } from "@/logic/CombatMaster";
import { StatusEffect, StatusEffectAlignment, StatusEffectType } from "@/logic/StatusEffect";



export class DevourDivinity extends CoopMove {
    name: string = "Devour Divinity";
    description: string = "Devour the divinity of your enemies, high chance to inflict fear on enemies.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Healer, CombatantType.StandardBearer] }
    ];
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    cost: number = coopCostSlash ? 7 : 10;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(!targetCombatant) {
                return getStandardActionResult();
            }
            const positiveStatusEffects: StatusEffect[] = targetCombatant.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Positive);
            const length = positiveStatusEffects.length;
            invoker.stats.hp = Math.min(invoker.stats.hp + (10 * length), invoker.baseStats.hp);
            invoker.applyStatusEffect({
                name: StatusEffectType.STRENGTH_BOOST,
                duration: length,
            });
            for(const statusEffect of positiveStatusEffects) {
                targetCombatant?.removeStatusEffect(statusEffect.name);
            }
            return getStandardActionResult(AOETarget, this.turnCost);
        });

        return getStandardActionResult();
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 6
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class UltimateCurse extends CoopMove {
    name: string = "Ultimate Curse";
    description: string = "Bane your enemy with a crippling curse, weakening them in every way possible";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Witch, CombatantType.Fool, CombatantType.Hunter] }
    ];
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    cost: number = coopCostSlash ? 8 : 12;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(target, this.turnCost);
        }
        targetCombatant.applyStatusEffect({
            name: StatusEffectType.STRENGTH_DOWNGRADE,
            duration: 3,
        }); 
        targetCombatant.applyStatusEffect({
            name: StatusEffectType.DEFENSE_DOWNGRADE,
            duration: 3,
        }); 
        targetCombatant.applyStatusEffect({
            name: StatusEffectType.LUCK_DOWNGRADE,
            duration: 3,
        }); 
        targetCombatant.applyStatusEffect({
            name: StatusEffectType.SLOW,
            duration: 3,
        }); 
        
        
        return getStandardActionResult(target, this.turnCost);
    };  
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 7
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class DivineRetribution extends CoopMove {
    name: string = "Divine Retribution";
    description: string = "Mark an enemy with the mark of vengeance. They will suffer half of any direct damage they inflict.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Vanguard, CombatantType.Hunter, CombatantType.Pikeman] }
    ];
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    cost: number = coopCostSlash ? 7 : 10;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(target, this.turnCost);
        }
        targetCombatant.applyStatusEffect({
            name: StatusEffectType.DIVINE_RETRIBUTION,
            duration: 3,
        });
        return getStandardActionResult(target, this.turnCost);
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 5
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class ShatterSteel extends CoopMove {
    name: string = "Shatter Steel";
    description: string = "Use your unbreakable edge to break your enemy's arms and armor. decreaseing their defense and attack power.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Vanguard, CombatantType.Witch, CombatantType.Fool, CombatantType.Rogue] }
    ];
    damage: Damage = {
        amount: 15,
        type: DamageType.Pierce
    };
    cost: number = coopCostSlash ? 6 : 9;
    turnCost: number = 1;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(target, this.turnCost);
        }
        const result = combatMaster.executeAttack(invoker, target, board, this.damage, true, this.turnCost);
        if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
            targetCombatant.applyStatusEffect({
                name: StatusEffectType.DEFENSE_DOWNGRADE,
                duration: 3,
            });
            targetCombatant.applyStatusEffect({
                name: StatusEffectType.STRENGTH_DOWNGRADE,
                duration: 3,
            });
            targetCombatant.removeStatusEffect(StatusEffectType.FULL_METAL_JACKET);
        }
        return result;
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 2
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    
}   