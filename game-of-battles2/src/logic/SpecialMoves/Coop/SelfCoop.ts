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
import { StatusEffectType } from "@/logic/StatusEffect";

export class IdaiNoHadou extends CoopMove {
    name: string = "Idai no Hadou";
    description: string = "Idai no Hadou";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.FistWeaver, CombatantType.Vanguard, CombatantType.Defender] },
        { combatantTypeOptions: [CombatantType.Healer, CombatantType.StandardBearer, CombatantType.Fool] }
    ];
    cost: number = 12;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.IDAI_NO_HADOU,
            duration: 3,
        }); 
        return getStandardActionResult();
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    turnCost: number = 3;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class MyrmidonHour extends CoopMove {
    name: string = "Myrmidon Hour";
    description: string = "Myrmidon Hour";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.FistWeaver, CombatantType.Vanguard, CombatantType.Defender] },
    ];
    cost: number = 12;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.MYRMIDON_HOUR,
            duration: 3,
        }); 
        return getStandardActionResult();
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    turnCost: number = 3;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}