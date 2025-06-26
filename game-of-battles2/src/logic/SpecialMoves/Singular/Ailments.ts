import { ActionResult, getStandardActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { StatusEffectType } from "@/logic/StatusEffect";
import { CombatMaster } from "@/logic/CombatMaster";

export class YoMama implements SpecialMove {
    name: string = "Yo Mama!";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 5;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 6
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect: (invoker: Combatant, target: Position, board: Board) => ActionResult | ActionResult[] = (invoker, target, board) => {
        const combatMaster = CombatMaster.getInstance();
        const targetCombatant = board.getCombatantAtPosition(target);
        if(!targetCombatant) {
            return getStandardActionResult();
        }
        combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.TAUNTED, 3, 0.6);
        return getStandardActionResult();
    };
     checkRequirements = undefined;
    description = `Target enemy may become taunted by you for 3 rounds.`
}

export class StupidestCrapEver implements SpecialMove {
    name: string = "Stupidest Crap Ever";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 7;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Straight,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Cone,
        range: 4
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect: (invoker: Combatant, target: Position, board: Board) => ActionResult | ActionResult[] = (invoker, target, board) => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        getAllTargets.forEach(AOETarget => {
            combatMaster.tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.STUPEFIED, 2, 0.6);
        });

        return getStandardActionResult();
    };
     checkRequirements = undefined;
    description = `Enemies in 1-tile arc may become Stupefied for 2 rounds, making them unable to use skills.`
}

export class SmellIt implements SpecialMove {
    name: string = "Smellitt";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 8;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 3
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect: (invoker: Combatant, target: Position, board: Board) => ActionResult | ActionResult[] = (invoker, target, board) => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(targetCombatant) {
                // combatMaster.tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.NAUSEATED, 3, 0.6);
                targetCombatant.applyStatusEffect({name: StatusEffectType.NAUSEATED, duration: 3});
            }   
        });
        return getStandardActionResult(target);
    };
     checkRequirements = undefined;
    description = `Enemies in 1-tile radius nova become Nauseated and unable to act for 3 rounds. Every turn they have chance to recover`
}

export class LookeyHere implements SpecialMove {
    name: string = "Lookey Here";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 10;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Great_Nova,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect: (invoker: Combatant, target: Position, board: Board) => ActionResult | ActionResult[] = (invoker, target, board) => {
        invoker.applyStatusEffect({name: StatusEffectType.MESMERIZING, duration: Number.POSITIVE_INFINITY});
        return getStandardActionResult(invoker.position);
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasMoved;
    };
    description = `Enemies in a 2-tile radius nova around you may become mesmerized and unable to act for 1 round.
    This will keep on as long as you skip your turn.`;
}