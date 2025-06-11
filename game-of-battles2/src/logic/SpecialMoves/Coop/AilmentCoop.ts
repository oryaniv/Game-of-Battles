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

export class HellScream extends CoopMove {
    name: string = "Hell Scream";
    description: string = "Let out a terrifying scream from the depths of your burning soul, high chance to inflict fear on enemies.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Fool, CombatantType.Witch] }
    ];
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    cost: number = 14;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);

        getAllTargets.map(AOETarget => {
            combatMaster.tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.PANICKED, 3, 0.6);
            return getStandardActionResult(AOETarget, this.turnCost);
        });

        return getStandardActionResult();
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Cross,
        range: 3
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class BlowAKiss extends CoopMove {
    name: string = "Blow a Kiss";
    description: string = "Sends an enemy your hearty token of love, with a medium chance of charming them.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Fool, CombatantType.Witch, CombatantType.Healer] }
    ];
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 4
    };
    cost: number = 8;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(invoker.position, this.turnCost);
        }
        combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.CHARMED, 2, 0.6);
        return getStandardActionResult(invoker.position, this.turnCost);
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    turnCost: number = 2;
}

export class StandUpComedyGoneWrong extends CoopMove {
    name: string = "Stand Up Comedy Gone Wrong";
    description: string = "You always wanted to be a comedian, but no one is laughing. instead, there's a medium chance they'll want to kill you.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Fool, CombatantType.Vanguard, CombatantType.Defender] }
    ];
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Cross,
        range: 6
    };
    cost: number = 10;
    meterCost: number = 0;  
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        getAllTargets.map(AOETarget => {
            combatMaster.tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.TAUNTED, 1, 0.6);
        });
        return getStandardActionResult(invoker.position, this.turnCost);
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    turnCost: number = 2;
}

export class CircusDiabolique extends CoopMove {
    name: string = "Circus Diabolique";
    description: string = "Entrhall your foes with the most magnificent show of nightmares ever conceived. if struck, they'll be helpess, and slowly rot away as they watch in horror.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Fool, CombatantType.Witch, CombatantType.Rogue] },
        { combatantTypeOptions: [CombatantType.StandardBearer, CombatantType.Wizard, CombatantType.Defender] }
    ];
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Great_Nova,
        range: 0
    }; 
    cost: number = 15;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({name: StatusEffectType.CIRCUS_DIABOLIQUE, duration: Number.POSITIVE_INFINITY});
        return getStandardActionResult(invoker.position);
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    turnCost: number = 3;
}
