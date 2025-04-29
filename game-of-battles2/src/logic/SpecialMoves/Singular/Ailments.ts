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
        range: 5
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
    description = `Barrage an enemy with a torrent of insults regarding their dear mama, leading to a medium probability of them
    losing their composure and becoming enraged, doomed to chase you for 3 rounds`
}

export class StupidestCrapEver implements SpecialMove {
    name: string = "Stupidest Crap Ever";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 7;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Cone,
        range: 3
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect: (invoker: Combatant, target: Position, board: Board) => ActionResult | ActionResult[] = (invoker, target, board) => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.range);
        getAllTargets.forEach(AOETarget => {
            combatMaster.tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.STUPEFIED, 2, 0.6);
        });

        return getStandardActionResult();
    };
     checkRequirements = undefined;
    description = `The stupidest thing you've ever seen? this does something even stupider. those who see
    this may suffer from brain damage and cannot use skills for 2 rounds`
}

export class SmellIt implements SpecialMove {
    name: string = "Smellitt";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 8;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Enemy,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 2
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect: (invoker: Combatant, target: Position, board: Board) => ActionResult | ActionResult[] = (invoker, target, board) => {
        const combatMaster = CombatMaster.getInstance();
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.range);
        getAllTargets.forEach(AOETarget => {
            combatMaster.tryInflictStatusEffect(invoker, AOETarget, board, StatusEffectType.NAUSEATED, 3, 0.6);
        });
        return getStandardActionResult(target);
    };
     checkRequirements = undefined;
    description = `Throw a little vial containing a vile concoction of the most disgusting substances known to man.
    those who smell it may suffer from horrible nausea and may lose their turns for the next 2 rounds`
}

export class LookeyHere implements SpecialMove {
    name: string = "Lookey Here";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 10;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
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
    checkRequirements = undefined;
    description = `Begin one hell of a peculiar dance, making close enememies look at you in bewilderment as long as
    you keep dancing, and as long as they fail to break off of it`;
}