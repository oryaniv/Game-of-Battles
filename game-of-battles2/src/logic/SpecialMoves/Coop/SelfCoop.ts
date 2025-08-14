import { CombatantType } from "@/logic/Combatants/CombatantType";
import { CoopMove, coopCostSlash } from "./CoopMove";
import { CoopPartnerRequirement } from "./CoopMove";
import { Damage, DamageReaction, DamageType } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { ActionResult, AttackResult, getStandardActionResult, getStatusEffectActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { SpecialMoveRangeType } from "@/logic/SpecialMove";
import { SpecialMoveAlignment } from "@/logic/SpecialMove";
import { SpecialMoveAreaOfEffect } from "@/logic/SpecialMove";
import { SpecialMoveRange } from "@/logic/SpecialMove";
import { CombatMaster } from "@/logic/CombatMaster";
import { StatusEffect, StatusEffectAlignment, StatusEffectType } from "@/logic/StatusEffect";
import { Doll } from "@/logic/Combatants/Fool";
import { emitter } from "@/eventBus";
import { SoundManager } from "@/GameData/SoundManager";
import { SoundByte } from "@/GameData/SoundLibrary";

export class IdaiNoHadou extends CoopMove {
    name: string = "Idai no Hadou";
    description: string = "Resotre a small amount of health and stamina, and remove all negative status effects. Then gain the Idai no Hadou status for 3 rounds, which increases luck and agility and unlocks the angelic touch skill.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.FistWeaver, CombatantType.Vanguard, CombatantType.Defender] },
        { combatantTypeOptions: [CombatantType.Healer, CombatantType.StandardBearer, CombatantType.Fool] }
    ];
    cost: number = coopCostSlash ? 8 : 12;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.IDAI_NO_HADOU,
            duration: 3,
        }); 
        invoker.stats.hp = Math.min(invoker.stats.hp + 20, invoker.baseStats.hp);
        invoker.stats.stamina = Math.min(invoker.stats.stamina + 18, invoker.baseStats.stamina);
        const negativeStatusEffects: StatusEffect[] = invoker.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative);
        for(const statusEffect of negativeStatusEffects) {
            invoker?.removeStatusEffect(statusEffect.name);
        }
        return getStatusEffectActionResult(StatusEffectType.IDAI_NO_HADOU, invoker.position, this.turnCost);
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    turnCost: number = 3;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class DiamondSupremacy extends CoopMove {
    name: string = "Diamond Supremacy";
    description: string = "Diamond Supremacy";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Pikeman, CombatantType.Vanguard, CombatantType.Defender, CombatantType.StandardBearer] },
    ];
    cost: number = 12;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.DIAMOND_SUPREMACY,
            duration: 3,
        }); 
        return getStandardActionResult();
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class Frenzy extends CoopMove {
    name: string = "Frenzy";
    description: string = "Gain the Frenzy status for 3 rounds. While in frenzy, your attack power is increased, and you cannot die, but you lose control over your actions and attack the closest target, enemy or ally.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Witch, CombatantType.Vanguard, CombatantType.Fool, CombatantType.StandardBearer] },
    ];
    cost: number = coopCostSlash ? 8 : 10;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.FRENZY,
            duration: 3,
        });
        return getStatusEffectActionResult(StatusEffectType.FRENZY, invoker.position, this.turnCost);
    };
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

export class NastyNastyDolly extends CoopMove {
    name: string = "Nasty Nasty Dolly";
    description: string = `Move to target position, cloak yourself, and place a doll as a decoy. If anyone attacks the doll, 
    it will explod and everyone in 1-tile radius cross shaped area will be dealt blight damage with a chance to be poisoned.
    The doll is removed if the user is exposed.`;
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Rogue, CombatantType.Fool, CombatantType.Artificer] },
    ];
    cost: number = coopCostSlash ? 8 : 11;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const originalPosition = invoker.position;
        invoker.move(target, board);
        invoker.applyStatusEffect({
            name: StatusEffectType.CLOAKED,
            duration: 5,
        });
        const doll = new Doll(invoker.name + "_doll", originalPosition, invoker.team);
        board.placeCombatant(doll, originalPosition);
        invoker.addRelatedCombatant("doll", doll);
        doll.addRelatedCombatant("doll_owner", invoker);
        SoundManager.getInstance().playSound(SoundByte.FOOL_LAUGH);
        return getStandardActionResult(invoker.position, this.turnCost);
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Empty_Space,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 3
    };
    turnCost: number = 1;
    checkRequirements = (self: Combatant) => {
        const hasDoll = self.getRelatedCombatants()["doll"] !== undefined;
        return this.checkCoopRequirements(self) && !self.hasMoved  && !hasDoll;
    };
}

export class Teleportation extends CoopMove {
    name: string = "Teleportation";
    description: string = "Teleport to a target location. Having Arcane Channeling or Arcane Overcharge statuses may entail additional effects.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.FistWeaver, CombatantType.Rogue] },
    ];
    cost: number = coopCostSlash ? 5 : 8;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.move(target, board);
        if(invoker.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING)) {
            invoker.applyStatusEffect({
                name: StatusEffectType.ARCANE_BARRIER,
                duration: 50,
            });
            invoker.removeStatusEffect(StatusEffectType.ARCANE_CHANNELING);
            emitter.emit('trigger-method', getStatusEffectActionResult(StatusEffectType.ARCANE_BARRIER, target, 1));
        }
        if(invoker.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE)) {
            const combatMaster = CombatMaster.getInstance();
            const getAllTargets = board.getAreaOfEffectPositions(invoker, target, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.All);
            const type = [DamageType.Fire, DamageType.Lightning, DamageType.Ice].sort(() => Math.random() - 0.5)[0];
            const blastResults = getAllTargets.map(AOETarget => {
                const targetCombatant = board.getCombatantAtPosition(AOETarget);
                if(targetCombatant && targetCombatant.name !== invoker.name) {
                    return combatMaster.executeAttack(invoker, AOETarget, board, { amount: 20, type }, true, this.turnCost);
                }
                return getStandardActionResult(AOETarget, this.turnCost);
            });
            invoker.removeStatusEffect(StatusEffectType.ARCANE_OVERCHARGE);
            return blastResults;
        }
        return getStandardActionResult(invoker.position, this.turnCost);
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Empty_Space,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 9
    };
    turnCost: number = 1;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self) && !self.hasMoved;
    };
}

export class ArcaneOvercharge extends CoopMove {
    name: string = "Arcane Overcharge";
    description: string = "Next spell will deal significantly more damage, and may have additional effects.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Wizard, CombatantType.Witch, CombatantType.Vanguard, CombatantType.Hunter] },
    ];
    cost: number = coopCostSlash ? 7 : 10;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.ARCANE_OVERCHARGE,
            duration: Number.POSITIVE_INFINITY,
        });
        return getStatusEffectActionResult(StatusEffectType.ARCANE_OVERCHARGE, invoker.position, this.turnCost);
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    turnCost: number = 1;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class ArcaneBarrier extends CoopMove {
    name: string = "Arcane Barrier";
    description: string = "Gain the Arcane Barrier status for 50 rounds. Any non-unstoppable damage taken may be reduced down to 0, and the duration is cut by the amount of damage taken.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Defender, CombatantType.Healer, CombatantType.StandardBearer] },
    ];
    cost: number = coopCostSlash ? 5 : 8;
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        invoker.applyStatusEffect({
            name: StatusEffectType.ARCANE_BARRIER,
            duration: 50,
        });
        return getStatusEffectActionResult(StatusEffectType.ARCANE_BARRIER, invoker.position, this.turnCost);
    };
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.Self,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 0
    };
    turnCost: number = 1;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}   