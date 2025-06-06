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

export class RainOfGrace extends CoopMove {
    name: string = "Rain of Grace";
    description: string = "Call down merciful drops of divine grace, healing and purifying all allies in a cross-shaped area.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Healer, CombatantType.StandardBearer, CombatantType.FistWeaver] }
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const rainOfGraceResults = getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(targetCombatant) {
                targetCombatant.stats.hp = Math.min(targetCombatant.stats.hp + 40, targetCombatant.baseStats.hp);
                const negativeStatusEffects: StatusEffect[] = targetCombatant.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative);
                for(const statusEffect of negativeStatusEffects) {
                    targetCombatant?.removeStatusEffect(statusEffect.name);
                }
                return {
                    attackResult: AttackResult.Hit,
                    damage: {
                        amount: 40,
                        type: DamageType.Healing
                    },
                    cost: 1,
                    reaction: DamageReaction.NONE,
                    position: AOETarget
                };
            }
            return getStandardActionResult();
        });

        return rainOfGraceResults;
    };
    cost: number = 12;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Cross,
        range: 4
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class RenewedStrength extends CoopMove {
    name: string = "Renewed Strength";
    description: string = "Fill your allies with renewed vigor, restoring 15 stamina to each ally.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Healer, CombatantType.StandardBearer, CombatantType.Witch] }
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const renewedStrengthResults = getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(targetCombatant) {
                targetCombatant.stats.stamina = Math.min(targetCombatant.stats.stamina + 15, targetCombatant.baseStats.stamina);
            }
            return getStandardActionResult();
        });

        return renewedStrengthResults;
    };
    cost: number = 0;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 1
    };
    turnCost: number = 1;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}   

export class LastStandOfHeroes extends CoopMove {
    name: string = "Last Stand of Heroes";
    description: string = "When all is lost, summon the lost power of legends, and grant your team 6 action points. this can only be used once per battle";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Healer, CombatantType.FistWeaver, CombatantType.Defender, CombatantType.StandardBearer, CombatantType.Pikeman] },
        { combatantTypeOptions: [CombatantType.Witch, CombatantType.Rogue, CombatantType.Fool, CombatantType.Wizard, CombatantType.Hunter] },
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.LAST_STAND_USED,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStandardActionResult(target, -6);
    };
    cost: number = 10;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 1
    };
    turnCost: number = 3;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self) && !self.hasStatusEffect(StatusEffectType.LAST_STAND_USED);
    };
}

export class ShieldWall extends CoopMove {
    name: string = "Shield Wall";
    description: string = "Raise your shield to defend yourself and your allies. any ally in range of the wall, will be considered defending. This stance will break upon taking a non-skip action";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Defender, CombatantType.StandardBearer] }
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.SHIELD_WALL,
            duration: 1,
        });
        return getStandardActionResult(invoker.position, 2);
    };
    cost: number = 10;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 1
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class ArcaneShieldWall extends CoopMove {
    name: string = "Arcane Shield Wall";
    description: string = "Raise your shield to defend yourself and your allies. any ally in range of the wall, will be considered defending. This stance will break upon taking a non-skip action";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Defender, CombatantType.StandardBearer] },
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Artificer, CombatantType.Witch] },
    ];

    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.ARCANE_SHIELD_WALL,
            duration: 1,
        });
        return getStandardActionResult(invoker.position, 2);
    };

    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 1
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };

    cost: number = 10;  
    meterCost: number = 0; 
}

export class BloodRite extends CoopMove {
    name: string = "Blood Rite";
    description: string = "Sacrifice yourself or an ally, and the blood of sacrifice shall feed your allies, healing them for the amount sacrificed.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Healer, CombatantType.Witch] },
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(target, 1);
        }
        const sacrificeAmount = targetCombatant.stats.hp;
        targetCombatant.takeDamage({amount: sacrificeAmount, type: DamageType.Unstoppable});
        const healingResults = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align).map(AOETarget => {
            const combatantToHeal = board.getCombatantAtPosition(AOETarget);
            if(combatantToHeal && combatantToHeal.name !== targetCombatant.name) {
                combatantToHeal.stats.hp = Math.min(combatantToHeal.stats.hp + sacrificeAmount, combatantToHeal.baseStats.hp);
            }
            return getStandardActionResult();
        });
        return healingResults;
    };
    cost: number = 9;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 1
    };
    turnCost: number = 1;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class SwappingGale extends CoopMove {
    name: string = "Swapping Gale";
    description: string = "Dance to summon the winds of change, and swap places with an ally.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Rogue, CombatantType.Fool] }
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const swapCombatant = board.getCombatantAtPosition(target);
        if(!swapCombatant) {
            return getStandardActionResult(target, this.turnCost);
        }
        const originalPosition = invoker.position;
        const swapPosition = target;

        board.removeCombatant(invoker);
        board.removeCombatant(swapCombatant);

        invoker.position = {x: -1, y: -1}
        swapCombatant.position = {x: -1, y: -1};

        board.placeCombatant(invoker, swapPosition);
        board.placeCombatant(swapCombatant, originalPosition);

        return getStandardActionResult(invoker.position, this.turnCost);
    };
    cost: number = 6;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Ally,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 8
    };
    turnCost: number = 1;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class Sanctuary extends CoopMove {
    name: string = "Sanctuary";
    description: string = "Target Ally is protected by a sacred shield. As long as they don't move or attack, any attack against them will be entirely blocked.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Defender, CombatantType.StandardBearer, CombatantType.Healer] }
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(target, this.turnCost);
        }
        targetCombatant.applyStatusEffect({
            name: StatusEffectType.SANCTUARY,
            duration: 5,
        });
        return getStandardActionResult(target, this.turnCost);
    };
    cost: number = 10;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Ally,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
    };
    turnCost: number = 1;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}


export class ArcaneConduit extends CoopMove {
    name: string = "Arcane Conduit";
    description: string = "Arcane Conduit";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard] },
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.ARCANE_CONDUIT,
            duration: 2,
        });
        return getStandardActionResult(invoker.position, 2);
    };
    cost: number = 10;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class Guardian extends CoopMove {
    name: string = "Guardian";
    description: string = "Guardian";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Defender, CombatantType.StandardBearer] },
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.GUARDIAN,
            duration: 1,
        });
        return getStandardActionResult(invoker.position, 2);
    };
    cost: number = 10;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 1
    };
    turnCost: number = 1;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}
