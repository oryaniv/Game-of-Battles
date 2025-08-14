import { CombatantType } from "@/logic/Combatants/CombatantType";
import { coopCostSlash, CoopMove } from "./CoopMove";
import { CoopPartnerRequirement } from "./CoopMove";
import { Damage, DamageReaction, DamageType } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { ActionResult, AttackResult, getMissActionResult, getStandardActionResult, getStatusEffectActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { SpecialMoveRangeType } from "@/logic/SpecialMove";
import { SpecialMoveAlignment } from "@/logic/SpecialMove";
import { SpecialMoveAreaOfEffect } from "@/logic/SpecialMove";
import { SpecialMoveRange } from "@/logic/SpecialMove";
import { CombatMaster } from "@/logic/CombatMaster";
import { StatusEffect, StatusEffectAlignment, StatusEffectType } from "@/logic/StatusEffect";
import { emitter } from "@/eventBus";

export class HellScream extends CoopMove {
    name: string = "Hell Scream";
    description: string = "All enemies in a 1-tile radius cross-shaped have a chance to be inflicted with panic for 3 turns";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Fool, CombatantType.Witch] }
    ];
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    cost: number = coopCostSlash ? 10 : 14;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);

        getAllTargets.map(AOETarget => {
            const hit = combatMaster.tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.PANICKED, 3, 0.6);
            if(!hit) {
                emitter.emit('trigger-method', getMissActionResult(AOETarget, this.turnCost));
            }
        });

        return getStandardActionResult(invoker.position, this.turnCost);
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
    description: string = "Chance to charm target enemy for 2 turns";
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
        const hit = combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.CHARMED, 2, 0.6);
        return hit ? getStandardActionResult(target, this.turnCost) : getMissActionResult(target, this.turnCost);
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    turnCost: number = 2;
}

export class StandUpComedyGoneWrong extends CoopMove {
    name: string = "Stand Up Comedy Gone Wrong";
    description: string = "All enemies in a 1-tile cross-shaped area of effect have a chance to be inflicted with taunted for 3 rounds.";
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
    cost: number = coopCostSlash ?  8 : 10;
    meterCost: number = 0;  
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        getAllTargets.map(AOETarget => {
            const hit = combatMaster.tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.TAUNTED, 3, 0.6);
            if(!hit) {
                emitter.emit('trigger-method', getMissActionResult(AOETarget, this.turnCost));
            }
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
    description: string = `Gain the Circus Diabolique status effect.
    As long as it persists, at the end of your turn, enemies in a 2-tile radius nova around have a medium chance to become Nightmare locked for 2 rounds.
    They are unable to act, and suffer 10 blight damage every turn. Circus Diabolique status will keep on as long as you skip your turn.`;
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Fool, CombatantType.Witch, CombatantType.Rogue, CombatantType.Artificer] },
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
    cost: number = coopCostSlash ? 10 : 15;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({name: StatusEffectType.CIRCUS_DIABOLIQUE, duration: Number.POSITIVE_INFINITY});
        return getStandardActionResult(invoker.position);
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self) && !self.hasMoved;
    };
    turnCost: number = 3;
}

export class SleepingDart extends CoopMove {
    name: string = "Sleeping Dart";
    description: string = "High chance to inflict sleep for 2 rounds. does not break cloaking.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Fool, CombatantType.Artificer, CombatantType.Hunter] }
    ];
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 3
    };
    cost: number = coopCostSlash ? 6 : 10;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult(invoker.position, this.turnCost);
        }
        const hit = combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.SLEEPING, 2, 0.9);
        return hit ? getStandardActionResult(target, this.turnCost) : getMissActionResult(target, this.turnCost);
    };
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
    breaksCloaking: boolean = false;
    turnCost: number = 1;
}
