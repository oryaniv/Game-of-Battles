import { CombatantType } from "@/logic/Combatants/CombatantType";
import { CoopMove } from "./CoopMove";
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
    cost: number = 10;
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
            return getStandardActionResult();
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
        { combatantTypeOptions: [CombatantType.Witch, CombatantType.Fool] }
    ];
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    cost: number = 12;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult();
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
        
        
        return getStandardActionResult();
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