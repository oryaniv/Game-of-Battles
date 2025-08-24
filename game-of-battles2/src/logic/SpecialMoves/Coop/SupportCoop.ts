import { CombatantType } from "@/logic/Combatants/CombatantType";
import { coopCostSlash, CoopMove } from "./CoopMove";
import { CoopPartnerRequirement } from "./CoopMove";
import { Damage, DamageReaction, DamageType } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { ActionResult, AttackResult, getDamageActionResult, getStandardActionResult, getStatusEffectActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { SpecialMoveRangeType } from "@/logic/SpecialMove";
import { SpecialMoveAlignment } from "@/logic/SpecialMove";
import { SpecialMoveAreaOfEffect } from "@/logic/SpecialMove";
import { SpecialMoveRange } from "@/logic/SpecialMove";
import { CombatMaster } from "@/logic/CombatMaster";
import { StatusEffect, StatusEffectAlignment, StatusEffectType } from "@/logic/StatusEffect";
import { emitter } from "@/eventBus";

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
            if(targetCombatant && targetCombatant.isOrganic()) {
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
                    cost: this.turnCost,
                    reaction: DamageReaction.NONE,
                    position: AOETarget
                };
            }
            return getStandardActionResult(AOETarget, this.turnCost);
        });

        return rainOfGraceResults;
    };
    cost: number = coopCostSlash ? 8 : 12;
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
    description: string = "Restore a small amount of stamina to all allies in 1-tile radius nova.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Healer, CombatantType.StandardBearer, CombatantType.Witch] }
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const renewedStrengthResults = getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(targetCombatant) {
                const newStamina = Math.min(targetCombatant.stats.stamina + 15, targetCombatant.baseStats.stamina);
                const staminaGain = newStamina - targetCombatant.stats.stamina;
                targetCombatant.stats.stamina = newStamina;
                return getDamageActionResult({amount: staminaGain, type: DamageType.Stamina}, AOETarget);
            }
            return getStandardActionResult(AOETarget, this.turnCost);
        });

        return renewedStrengthResults;
    };
    cost: number = 0;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 0
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}   

export class LastStandOfHeroes extends CoopMove {
    name: string = "Last Stand of Heroes";
    description: string = "When all is lost, summon the lost power of legends, and grant your team 5 action points. this can only be used once per battle";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Hunter, CombatantType.FistWeaver, CombatantType.Defender, CombatantType.Vanguard, CombatantType.Pikeman, CombatantType.Rogue] },
        { combatantTypeOptions: [CombatantType.Witch, CombatantType.Artificer, CombatantType.Fool, CombatantType.Wizard, CombatantType.Healer] },
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.LAST_STAND_USED,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStatusEffectActionResult(StatusEffectType.ENCOURAGED, target, -2);
    };
    cost: number = 10;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    turnCost: number = 3;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self) && !self.hasStatusEffect(StatusEffectType.LAST_STAND_USED) && !self.hasMoved;
    };
}

export class ShieldWall extends CoopMove {
    name: string = "Shield Wall";
    description: string = "Raise your shield to defend yourself and your allies. any ally in range of the wall, will be considered defending. This stance will break upon taking a non-skip action";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Defender, CombatantType.StandardBearer, CombatantType.Artificer] }
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        if(invoker.hasStatusEffect(StatusEffectType.SHIELD_WALL)) {
            return getStandardActionResult(invoker.position, this.turnCost);
        }
        invoker.applyStatusEffect({
            name: StatusEffectType.SHIELD_WALL,
            duration: Number.POSITIVE_INFINITY,
        });
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        getAllTargets.map((AOETarget, index) => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(targetCombatant && targetCombatant.name !== invoker.name && !targetCombatant.hasStatusEffect(StatusEffectType.SHIELD_WALL_PROTECTED)) {
                targetCombatant.applyStatusEffect({name: StatusEffectType.SHIELD_WALL_PROTECTED, duration: Number.POSITIVE_INFINITY});
                targetCombatant.addRelatedCombatant('SHIELD_WALL', invoker);
                invoker.addRelatedCombatant(`SHIELD_WALL_PROTECTED_${index}`, targetCombatant);
                emitter.emit('trigger-method', getStatusEffectActionResult(StatusEffectType.SHIELD_WALL_PROTECTED, AOETarget, 1));
            }
        });
        return getStatusEffectActionResult(StatusEffectType.SHIELD_WALL, invoker.position, this.turnCost);
    };
    cost: number = coopCostSlash ? 8 : 10;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Ally,
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
        { combatantTypeOptions: [CombatantType.Defender, CombatantType.StandardBearer, CombatantType.Artificer] },
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Witch, CombatantType.Healer] },
    ];

    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        if(invoker.hasStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL)) {
            return getStandardActionResult(invoker.position, this.turnCost);
        }
        invoker.applyStatusEffect({
            name: StatusEffectType.ARCANE_SHIELD_WALL,  
            duration: Number.POSITIVE_INFINITY,
        });
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        getAllTargets.map((AOETarget, index) => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(targetCombatant && targetCombatant.name !== invoker.name && !targetCombatant.hasStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED)) {
                targetCombatant.applyStatusEffect({name: StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED, duration: Number.POSITIVE_INFINITY});
                targetCombatant.addRelatedCombatant('ARCANE_SHIELD_WALL', invoker);
                invoker.addRelatedCombatant(`ARCANE_SHIELD_WALL_PROTECTED_${index}`, targetCombatant);
                emitter.emit('trigger-method', getStatusEffectActionResult(StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED, AOETarget, 1));
            }
        });
        return getStatusEffectActionResult(StatusEffectType.ARCANE_SHIELD_WALL, invoker.position, this.turnCost);
    };

    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Ally,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 1
    };
    turnCost: number = 3;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };

    cost: number = coopCostSlash ? 10 : 15;  
    meterCost: number = 0; 
}

export class BloodRite extends CoopMove {
    name: string = "Blood Rite";
    description: string = "Sacrifice yourself or an ally. Nearby allies are healed for the amount of health sacrificed.";
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
        targetCombatant.takeDamage({amount: sacrificeAmount, type: DamageType.Unstoppable}, board);
        const damageResult = getDamageActionResult({amount: sacrificeAmount, type: DamageType.Crush}, targetCombatant.position);
        emitter.emit('trigger-method', damageResult);
        const healingResults = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align).map(AOETarget => {
            const combatantToHeal = board.getCombatantAtPosition(AOETarget);
            if(combatantToHeal && combatantToHeal.name !== targetCombatant.name) {
                combatantToHeal.stats.hp = Math.min(combatantToHeal.stats.hp + sacrificeAmount, combatantToHeal.baseStats.hp);
            }
            return getStandardActionResult(AOETarget, this.turnCost);
        });
        return healingResults;
    };
    cost: number = coopCostSlash ? 7 : 9;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova_No_Empty_Space,
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
    cost: number = coopCostSlash ? 4 : 6;
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
        return getStatusEffectActionResult(StatusEffectType.SANCTUARY, target, this.turnCost);
    };
    cost: number = coopCostSlash ? 8 : 10;
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
    description: string = "Gain the Arcane Conduit status for 2 rounds. While it lasts, gain the Arcane Channeling status at the beginning of your turns.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Artificer] },
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.ARCANE_CONDUIT,
            duration: 2,
        });
        return getStatusEffectActionResult(StatusEffectType.ARCANE_CONDUIT, invoker.position, this.turnCost);
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
    description: string = "Any damage taken by target ally is halved and transferred to you";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Healer, CombatantType.StandardBearer, CombatantType.Pikeman] },
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(target, this.turnCost);
        }
        invoker.applyStatusEffect({
            name: StatusEffectType.GUARDIAN,
            duration: 5,
        });
        
        targetCombatant.applyStatusEffect({
            name: StatusEffectType.GUARDIAN_PROTECTED,
            duration: 5,
        });
        emitter.emit('trigger-method', getStatusEffectActionResult(StatusEffectType.GUARDIAN_PROTECTED, target, 1));
        invoker.addRelatedCombatant('GUARDIAN_PROTECTED', targetCombatant);
        targetCombatant.addRelatedCombatant('GUARDIAN', invoker);
        return getStatusEffectActionResult(StatusEffectType.GUARDIAN, invoker.position, this.turnCost);
    };
    cost: number = 8;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Ally,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
    };
    turnCost: number = 1;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self) && !self.hasStatusEffect(StatusEffectType.GUARDIAN);
    };
}
