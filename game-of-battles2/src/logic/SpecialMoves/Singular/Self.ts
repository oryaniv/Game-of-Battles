import { DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { Board } from "@/logic/Board";
import { StatusEffectType, StatusEffectHook } from "@/logic/StatusEffect";
import { getStandardActionResult } from "@/logic/attackResult";
import { Combatant } from "@/logic/Combatant";


export class BlockingStance implements SpecialMove {
    name: string = "Blocking Stance";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 3;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Crush
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatant = board.getCombatantAtPosition(target);
        if(!combatant) {
            return getStandardActionResult();
        }
        combatant.applyStatusEffect({
            name: StatusEffectType.BLOCKING_STANCE,
            duration: Number.POSITIVE_INFINITY,
        }); 
        return getStandardActionResult();
        
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasStatusEffect(StatusEffectType.BLOCKING_STANCE);
    };
    description = `Go into Blocking stance. 
    Every attack against you of slash, pierce or crush damage types has a 50 percent chance of being blocked.
    Stance will end upon moving or attacking.`
}

export class ArcaneChanneling implements SpecialMove {
    name: string = "Arcane Chanelling";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 7;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Slash
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatant = board.getCombatantAtPosition(target);
        if(!combatant) {
            return getStandardActionResult();
        }
        combatant.applyStatusEffect({
            name: StatusEffectType.ARCANE_CHANNELING,
            duration: Number.POSITIVE_INFINITY,
        }); 
        return getStandardActionResult();
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING);
    };
    description = `Gather the power of the arcane in your body, and get ready to unleash a devastating spell.`
}

export class FocusAim implements SpecialMove {
    name: string = "Focus Aim";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 7;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Slash
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        const combatant = board.getCombatantAtPosition(target);
        if(!combatant) {
            return getStandardActionResult();
        }
        combatant.applyStatusEffect({
            name: StatusEffectType.FOCUS_AIM,
            duration: Number.POSITIVE_INFINITY,
        }); 
        return getStandardActionResult();
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasStatusEffect(StatusEffectType.FOCUS_AIM);
    };
    description = `Gather the power of the arcane in your body, and get ready to unleash a devastating spell.`
}