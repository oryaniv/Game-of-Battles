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

export class UnitedWeStand extends CoopMove {
    name: string = "United We Stand";
    description: string = "Stand together with your allies, increasing their defense by 10% and their attack by 10%.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Defender, CombatantType.StandardBearer, CombatantType.Pikeman] }
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const unitedWeStandResults = getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(targetCombatant) {
                targetCombatant.applyStatusEffect({
                    name: StatusEffectType.STRENGTH_BOOST,
                    duration: 3,
                }); 
                targetCombatant.applyStatusEffect({
                    name: StatusEffectType.MOBILITY_BOOST,
                    duration: 3,
                }); 
            }
            return getStandardActionResult(invoker.position, this.turnCost);
        });

        return unitedWeStandResults;
    };
    cost: number = 12;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Cross,
        range: 0
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self) && !self.hasMoved;
    };
    getCoopDescription = (self: Combatant) => {
        return `Stand together with your allies, increasing their defense by 10% and their attack by 10%.`;
    };
}
