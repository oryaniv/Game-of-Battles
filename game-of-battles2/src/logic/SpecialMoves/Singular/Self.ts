import { DamageReaction, DamageType } from "@/logic/Damage";
import { Damage } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { Board } from "@/logic/Board";
import { StatusEffectType, StatusEffectHook, StatusEffect, StatusEffectAlignment } from "@/logic/StatusEffect";
import { ActionResult, AttackResult, getStandardActionResult, getStatusEffectActionResult } from "@/logic/attackResult";
import { Combatant } from "@/logic/Combatant";
import { emitter } from "@/eventBus";


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
        emitter.emit('trigger-method', getStatusEffectActionResult(StatusEffectType.BLOCKING_STANCE, target, 1));
        return getStatusEffectActionResult(StatusEffectType.BLOCKING_STANCE, target, 1);
        
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasStatusEffect(StatusEffectType.BLOCKING_STANCE);
    };
    description = `Gain Blocking stance status. As long as it lasts, any physical attack against you has 70% chance to be blocked.`
}

export class ArcaneChanneling implements SpecialMove {
    name: string = "Arcane Channeling";
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
        return getStatusEffectActionResult(StatusEffectType.ARCANE_CHANNELING, target, 1);
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING);
    };
    description = `Gain the Arcane Channeling status. Required for various spells.`
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
        return getStatusEffectActionResult(StatusEffectType.FOCUS_AIM, target, 1);
    };
    checkRequirements = (self: Combatant) => {
        return !self.hasStatusEffect(StatusEffectType.FOCUS_AIM);
    };
    description = `Gain the Focus Aim status, which increases attack power and agility for the next attack.`
}

export class ShadowStep implements SpecialMove {
    name: string = "Shadow Step";
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 8;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Empty_Space,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 3
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Slash
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.move(target, board);
        invoker.applyStatusEffect({
            name: StatusEffectType.CLOAKED,
            duration: 5,
        });
        return getStandardActionResult();
    };  
    checkRequirements = (self: Combatant) => {
        return !self.hasStatusEffect(StatusEffectType.CLOAKED) && !self.hasMoved;
    };
    description = `Move to target position, and become cloaked for 5 rounds. Cloaking breaks upon taking damage, attackin and performing most skills.`
}

export class TrollRegeneration implements SpecialMove {
    name: string = "Troll Regeneration";
    triggerType = SpecialMoveTriggerType.Passive;
    cost: number = 0;
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
        invoker.applyStatusEffect({
            name: StatusEffectType.TROLL_REGENERATION,
            duration: Number.POSITIVE_INFINITY,
        }); 
        return getStandardActionResult();
    };
    checkRequirements = undefined
    description = `Regenerate 15 health points every turn.`
}       

export class DragonRage implements SpecialMove {
    name: string = "Dragon Rage";
    description = `Gain 2 additional action points.`
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 10;
    turnCost: number = 1;
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
    effect = (invoker: Combatant, target: Position, board: Board) => {
        return getStatusEffectActionResult(StatusEffectType.ENCOURAGED, target, -2);
    };
    checkRequirements = undefined;
}     

export class BeastRage implements SpecialMove {
    name: string = "Beast Rage";
    description = `Gain an additional action point.`
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 10;
    turnCost: number = 1;
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
    effect = (invoker: Combatant, target: Position, board: Board) => {
        return getStatusEffectActionResult(StatusEffectType.ENCOURAGED, target, -1);
    };
    checkRequirements = (self: Combatant) => {
        return!self.hasMoved;
    };
}  

export class SelfDestruct implements SpecialMove {
    name: string = "Self Destruct";
    description = `Self destruct and deal medium fire damage in a 1-tile radius nova.`
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 0;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.All,
        areaOfEffect: SpecialMoveAreaOfEffect.Nova,
        range: 0
    };
    damage: Damage = {
        amount: 0,
        type: DamageType.Unstoppable
    };
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.takeDamage({ amount: 50, type: DamageType.Unstoppable }, board);
        return getStandardActionResult();
    };
    checkRequirements = undefined;
}

export class ReplacementPart implements SpecialMove {
    name: string = "Replacement Part";
    description = `Restore some health and stamina. Requires Ingenius Upgrade status.`
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 0;
    turnCost: number = 1;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    }
    damage: Damage = {
        amount: 0,
        type: DamageType.Healing
    }
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.stats.hp = Math.min(invoker.stats.hp + 20, invoker.baseStats.hp);
        invoker.stats.stamina = Math.min(invoker.stats.stamina + 10, invoker.baseStats.stamina);
        return {
            attackResult: AttackResult.Hit,
            damage: {
                amount: 20,
                type: this.damage.type
            },
            cost: 1,
            reaction: DamageReaction.NONE,
            position: target
        };
    }
    checkRequirements = (self: Combatant) => {
        return self.hasStatusEffect(StatusEffectType.INGENIOUS_UPGRADE);
    }
}

export class DragonAura implements SpecialMove {
    name: string = "Dragon Aura";
    description = `Gain the Dragon Aura status for 200 rounds. Any non-unstoppable damage taken may be reduced down to 0, and the duration is cut by the amount of damage taken.`
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 10;
    turnCost: number = 1;
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
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.ARCANE_BARRIER,
            duration: 200,
        });
        return getStatusEffectActionResult(StatusEffectType.ARCANE_BARRIER, invoker.position, this.turnCost);
    };
    checkRequirements = (self: Combatant) => {
        return!self.hasMoved;
    };
}

export class ChainBreaker implements SpecialMove {
    name: string = "Chain Breaker";
    description = `Break the chain of status effects.`
    triggerType = SpecialMoveTriggerType.Active;
    cost: number = 10;
    turnCost: number = 1;
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
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const negativeStatusEffects: StatusEffect[] = invoker.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative);
        for(const statusEffect of negativeStatusEffects) {
            invoker?.removeStatusEffect(statusEffect.name);
        }
        return getStandardActionResult();
    };
    checkRequirements = (self: Combatant) => {
        return!self.hasMoved;
    };
}

export class AdditionalTurns1 implements SpecialMove {
    name: string = "Divine Celerity";
    description = `Gain 1 additional action point every round.`
    triggerType = SpecialMoveTriggerType.Passive;
    cost: number = 10;
    turnCost: number = 1;
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
    effect = (invoker: Combatant, target: Position, board: Board) => {
        invoker.applyStatusEffect({
            name: StatusEffectType.DIVINE_ALACRITY,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStatusEffectActionResult(StatusEffectType.DIVINE_ALACRITY, invoker.position, this.turnCost);
    };
    checkRequirements = undefined;
}