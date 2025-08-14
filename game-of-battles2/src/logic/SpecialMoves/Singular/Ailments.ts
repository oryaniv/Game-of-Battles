import { ActionResult, getStandardActionResult, getStatusEffectActionResult, getMissActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { StatusEffectType } from "@/logic/StatusEffect";
import { CombatMaster } from "@/logic/CombatMaster";
import { emitter } from "@/eventBus";

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
        const hit = combatMaster.tryInflictStatusEffect(invoker, target, board, StatusEffectType.TAUNTED, 3, 0.6);
        return hit ? getStandardActionResult() : getMissActionResult();
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
            const hit = combatMaster.tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.STUPEFIED, 2, 0.6);
            if(!hit) {
                emitter.emit('trigger-method', getMissActionResult(AOETarget, this.turnCost));
            }
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
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(targetCombatant) {
                targetCombatant.applyStatusEffect({name: StatusEffectType.NAUSEATED, duration: 3});
                emitter.emit('trigger-method', getStatusEffectActionResult(StatusEffectType.NAUSEATED, AOETarget, 1));
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
        return getStatusEffectActionResult(StatusEffectType.MESMERIZING, invoker.position, 1);
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasMoved;
    };
    description = `Gain the mesmerizing status. As long as it persists, at the end of your turn, enemies in a 2-tile radius nova around you have a medium chance to become mesmerized and unable to act for 1 round.
    Mesmerizing status will keep on as long as you skip your turn.`;
}


export class DragonRoar implements SpecialMove {
    name: string = "Dragon Roar";
    description = `All surrounding enemies may become Panciked for 2 rounds. Cannot use after moving.`
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 10;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        getAllTargets.forEach(AOETarget => {
            const hit = combatMaster.tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.PANICKED, 2, 0.6);
            if(!hit) {
                emitter.emit('trigger-method', getMissActionResult(AOETarget, this.turnCost));
            }
        });
        return getStandardActionResult();
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasMoved;
    };
}