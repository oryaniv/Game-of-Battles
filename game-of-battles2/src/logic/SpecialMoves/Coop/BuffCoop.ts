import { CombatantType } from "@/logic/Combatants/CombatantType";
import { CoopMove, coopCostSlash } from "./CoopMove";
import { CoopPartnerRequirement } from "./CoopMove";
import { Damage, DamageReaction, DamageType } from "@/logic/Damage";
import { Position } from "@/logic/Position";
import { ActionResult, AttackResult, getStandardActionResult, getStatusEffectActionResult } from "@/logic/attackResult";
import { Board } from "@/logic/Board";
import { Combatant } from "@/logic/Combatant";
import { SpecialMoveRangeType, SpecialMoveTriggerType } from "@/logic/SpecialMove";
import { SpecialMoveAlignment } from "@/logic/SpecialMove";
import { SpecialMoveAreaOfEffect } from "@/logic/SpecialMove";
import { SpecialMoveRange } from "@/logic/SpecialMove";
import { CombatMaster } from "@/logic/CombatMaster";
import { StatusEffect, StatusEffectAlignment, StatusEffectType } from "@/logic/StatusEffect";
import { BallistaTurret, BabyBabel } from "@/logic/Combatants/ArtificerConstructs";
import { IdGenerator } from "@/logic/IdGenerator";
import { SoundByte } from "@/GameData/SoundLibrary";
import { SoundManager } from "@/GameData/SoundManager";

export class UnitedWeStand extends CoopMove {
    name: string = "United We Stand";
    description: string = "Caster and all adjacent allies in a 1-tile cross-shaped area are granted strength and mobility boost for 3 turns. Cannot be used after moving.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Defender, CombatantType.StandardBearer, CombatantType.Pikeman, CombatantType.Artificer] }
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const getAllTargets = board.getAreaOfEffectPositions(invoker, target, this.range.areaOfEffect, this.range.align);
        const unitedWeStandResults = getAllTargets.map(AOETarget => {
            const targetCombatant = board.getCombatantAtPosition(AOETarget);
            if(targetCombatant) {
                targetCombatant.applyStatusEffect({
                    name: StatusEffectType.STRENGTH_BOOST,
                    duration: 3,
                }); 
                targetCombatant.applyStatusEffect({
                    name: StatusEffectType.MOBILITY_BOOST,
                    duration: 3,
                }); 
            }

            return getStatusEffectActionResult(StatusEffectType.STRENGTH_BOOST, invoker.position, 1);
        });

        return unitedWeStandResults;
    };
    cost: number = coopCostSlash ? 8 : 12;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Self,
        align: SpecialMoveAlignment.SelfAndAlly,
        areaOfEffect: SpecialMoveAreaOfEffect.Cross,
        range: 0
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self) && !self.hasMoved;
    };
    getCoopDescription = (self: Combatant) => {
        return `Stand together with your allies, increasing their defense by 10% and their attack by 10%.`;
    };
}

export class IngeniousUpgrade extends CoopMove {
    name: string = "Ingenious Upgrade";
    description: string = "Target ally gains attack power boost for 5 turns. In addition, constructs unlock a new skill while this is active.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Fool, CombatantType.Wizard, CombatantType.Healer] }
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const targetCombatant = board.getCombatantAtPosition(target);
        if(targetCombatant && targetCombatant.isConstruct()) {
            targetCombatant.applyStatusEffect({
                name: StatusEffectType.INGENIOUS_UPGRADE,
                duration: 5,
            }); 
        }
        return getStatusEffectActionResult(StatusEffectType.INGENIOUS_UPGRADE, target, 1);
    };
    cost: number = coopCostSlash ? 5 : 8;
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

export class BuildBallistaTurret extends CoopMove {
    name: string = "Deploy Ballista Turret";
    description: string = "Deploy a stationary ballista turret, which shoots bolts at enemies in range.";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Hunter, CombatantType.Artificer, CombatantType.Pikeman] }
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const invokverTeam = invoker.team;
        if(invokverTeam.getAliveCombatants().filter(c => c.getCombatantType() === CombatantType.BallistaTurret).length >= 2) {
            const turret = invokverTeam.getAliveCombatants().find(c => c.getCombatantType() === CombatantType.BallistaTurret);
            if(turret) {
                board.removeCombatant(turret);
                invokverTeam.combatants.splice(invokverTeam.combatants.indexOf(turret), 1);
            }
        }
        const ballista = new BallistaTurret(`Ballista_${IdGenerator.generateId()}`, target, invokverTeam);
        invokverTeam.addCombatant(ballista);
        board.placeCombatant(ballista, target);
        SoundManager.getInstance().playSound(SoundByte.SMITH);
        return getStandardActionResult(invoker.position, this.turnCost);
    };
    cost: number = coopCostSlash ? 10 : 14;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Empty_Space,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    turnCost: number = 2;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}

export class BuildBabyBabel extends CoopMove {
    name: string = "Build Death Tower";
    description: string = "Build a magical guard tower, which can attack enemies with many types of elemental skills";
    coopRequiredPartners: CoopPartnerRequirement[] = [
        { combatantTypeOptions: [CombatantType.Artificer, CombatantType.Wizard, CombatantType.Witch] },
        { combatantTypeOptions: [CombatantType.Hunter, CombatantType.Pikeman, CombatantType.Vanguard, CombatantType.StandardBearer] }
    ];
    meterCost: number = 0;
    effect = (invoker: Combatant, target: Position, board: Board): ActionResult | ActionResult[] => {
        const invokverTeam = invoker.team;
        if(invokverTeam.getAliveCombatants().filter(c => c.getCombatantType() === CombatantType.BabyBabel).length > 0) {
            const babyBabel = invokverTeam.getAliveCombatants().find(c => c.getCombatantType() === CombatantType.BabyBabel);
            if(babyBabel) {
                board.removeCombatant(babyBabel);
                invokverTeam.combatants.splice(invokverTeam.combatants.indexOf(babyBabel), 1);
            }
        }
        const babyBabel = new BabyBabel(`Tower_${IdGenerator.generateId()}`, target, invokverTeam);
        invokverTeam.addCombatant(babyBabel);
        board.placeCombatant(babyBabel, target);
        SoundManager.getInstance().playSound(SoundByte.SMITH);
        return getStandardActionResult(invoker.position, this.turnCost);
    };
    cost: number = coopCostSlash ? 10 : 14;
    range: SpecialMoveRange = {
        type: SpecialMoveRangeType.Curve,
        align: SpecialMoveAlignment.Empty_Space,
        areaOfEffect: SpecialMoveAreaOfEffect.Single,
        range: 1
    };
    turnCost: number = 3;
    checkRequirements = (self: Combatant) => {
        return this.checkCoopRequirements(self);
    };
}
