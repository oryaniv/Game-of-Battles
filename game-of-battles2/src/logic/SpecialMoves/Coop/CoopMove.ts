import { ActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { CombatantType } from "@/logic/Combatants/CombatantType";
import { Damage, DamageType } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { StatusEffectType } from "@/logic/StatusEffect";

export const coopCostSlash = true;

export interface CoopPartnerRequirement {
    combatantTypeOptions: CombatantType[];
}

export interface CoopMoveWithPartners {
    move:CoopMove;
    partners: Combatant[];
}

export abstract class CoopMove implements SpecialMove {
    // taken from SpecialMove
    name: string = "Coop Move";
    triggerType: SpecialMoveTriggerType = SpecialMoveTriggerType.Cooperative;
    cost: number = 0;
    turnCost: number = 0;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    description: string = "Coop Move";
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        return [];
    };

    // these are new, and belong to COOP alone
    checkCoopRequirements = (invoker: Combatant): boolean => {
        const invokerTeam = invoker.team;
        const aliveSupporters = invokerTeam.getAliveCombatants().filter(combatant => combatant.name !== invoker.name);
        return this.coopRequiredPartners.every(partner => aliveSupporters
            .some(supporter => partner.combatantTypeOptions.includes(supporter.getCombatantType()) && supporterCanCoop(supporter)));

        function supporterCanCoop(supporter: Combatant): boolean {
            return [
                StatusEffectType.STUPEFIED,
                StatusEffectType.CHARMED,
                StatusEffectType.NIGHTMARE_LOCKED,
                StatusEffectType.MESMERIZED,
                StatusEffectType.FROZEN,
                StatusEffectType.NAUSEATED,
                StatusEffectType.TAUNTED,
                StatusEffectType.PANICKED,
            ].every(statusEffect => !supporter.hasStatusEffect(statusEffect));
        }
    };
    abstract coopRequiredPartners: CoopPartnerRequirement[];
    abstract meterCost: number;
}