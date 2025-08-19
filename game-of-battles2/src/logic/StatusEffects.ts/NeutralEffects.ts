import { StatusEffectAlignment } from "../StatusEffect";
import { Combatant } from "../Combatant";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";
import { StatusEffect } from "../StatusEffect";
import { Board } from "../Board";
import { SpecialMoveAlignment, SpecialMoveAreaOfEffect } from "../SpecialMove";
import { ActionResult, AttackResult, getStandardActionResult, getStatusEffectActionResult } from "../attackResult";
import { Position } from "../Position";
import { Damage, DamageType } from "../Damage";
import { DamageReaction } from "../Damage";
import { RangeCalculator } from "../RangeCalculator";
import { CombatMaster } from "../CombatMaster";
import { emitter } from "@/eventBus";
// import { OozeGolem } from "../Combatants/OozeGolem";
import { Team } from "../Team";
import { IdGenerator } from "../IdGenerator";
// import { getNewCombatantName } from "@/CombatantNameProvider";
import { CombatantType } from "@/logic/Combatants/CombatantType";
import { getCombatantByType } from "@/boardSetups";
import { getNewCombatantName } from "@/CombatantNameProvider";

export class DefendingStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DEFENDING;
    description = `All incoming damage is halved. incoming attacks cannot miss, fumble, crit or hit weakness.`;
    applicationHooks = {

    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class InspiringKillerStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.INSPIRING_KILLER;
    description = `Any time this combatant kills an enemy, allies adjacent to said enemy will gain a random buff.`;
    applicationHooks = {
        [StatusEffectHook.OnKilling]: (caster: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            const getAllTargets = board.getAreaOfEffectPositions(caster, target.position, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.Ally);
            getAllTargets.forEach((targetPosition) => {
                const targetAlly = board.getCombatantAtPosition(targetPosition);
                if(!targetAlly || targetAlly.team.getName() !== caster.team.getName()) {
                    return;
                }
                const buffIndex = Math.floor(Math.random() * 4);
                const randomizedBuff = [StatusEffectType.RALLIED, StatusEffectType.MOBILITY_BOOST,
                     StatusEffectType.STRENGTH_BOOST, StatusEffectType.ENCOURAGED][buffIndex];
                if (targetAlly) {
                    targetAlly.applyStatusEffect({
                        name: randomizedBuff,
                        duration: 3,
                    });
                }
            });
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class EnergyAbsorbStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ENERGY_ABSORB;
    isVisible?: boolean = false;
    description = ``;
    applicationHooks =  {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class FoolsLuckStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FOOLS_LUCK;
    description = `Any attack against the fool has a small chance to miss, and half this chance to fumble. Chance grows with the fool's luck stat.`;
    applicationHooks = {
        [StatusEffectHook.OnBeingAttacked]: (attacked: Combatant, attacker: Combatant, damage: Damage, attackCost: number) => {
            const chanceToMiss = attacked.stats.luck * 0.02;
            const chanceToFumble = attacked.stats.luck * 0.01;
            const random = Math.random();
            
            if (random <= chanceToFumble) {
                attacked.baseStats.luck += 1;
                attacked.stats.luck += 1;
                return {attackResult: AttackResult.Fumble, damage: {amount: 0, type: DamageType.Unstoppable}, cost: attackCost, reaction: DamageReaction.NONE, position: attacked.position};
            }
            if (random <= chanceToMiss) {
                attacked.baseStats.luck += 2;
                attacked.stats.luck += 2;
                return {attackResult: AttackResult.Miss, damage: {amount: 0, type: DamageType.Unstoppable}, cost: attackCost, reaction: DamageReaction.NONE, position: attacked.position};
            }
            return;
        },
        [StatusEffectHook.OnBeingAilmentInflicted]: (attacked: Combatant, attacker: Combatant, damage: Damage, attackCost: number) => {
            const chancToFail = attacked.stats.luck * 0.02;
            const random = Math.random();
            if (random <= chancToFail) {
                return {attackResult: AttackResult.Miss, damage: {amount: 0, type: DamageType.Unstoppable}, cost: attackCost, reaction: DamageReaction.NONE, position: attacked.position};
            }
            return;
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class FirstStrikeStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.FIRST_STRIKE;
    description = `Once every turn, this combatant will strike at its melee attackers before they get to attack.`;
    applicationHooks = {
        [StatusEffectHook.OnBeingAttacked]: (self: Combatant, attacker: Combatant, damage: Damage, amount: number, board: Board) => {
            let isAttackerHookedToSelf = false;
            const isDiamondHookHolder = self.hasStatusEffect(StatusEffectType.DIAMOND_HOOKED_HOLDING);
            if(isDiamondHookHolder) {
                const heldCombatant = self.getRelatedCombatants()["DIAMOND_HOOKED_HOLDING"];
                isAttackerHookedToSelf = !!heldCombatant && heldCombatant.name === attacker.name;
            }
            
            if(
                !board.isInMeleeRange(self, attacker) ||
                attacker.hasStatusEffect(StatusEffectType.CLOAKED)
            ) {
                return;
            }

            if(!isAttackerHookedToSelf &&
                (self.hasStatusEffect(StatusEffectType.STRUCK_FIRST) || 
                attacker.hasStatusEffect(StatusEffectType.FIRST_STRIKE))) {
                return;
            }

            self.applyStatusEffect({
                name: StatusEffectType.STRUCK_FIRST,
                duration: Number.POSITIVE_INFINITY,
            });

            const combatMaster = CombatMaster.getInstance();
            const firstStrikeResult = combatMaster.executeAttack(self, attacker.position, board, self.basicAttack());
            emitter.emit('trigger-method', firstStrikeResult);
            if(attacker.isKnockedOut()) {
               return getStandardActionResult(attacker.position);
            }
            
        },
        [StatusEffectHook.OnTurnStart]: (self: Combatant) => {
            self.removeStatusEffect(StatusEffectType.STRUCK_FIRST);
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class StruckFirstStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.STRUCK_FIRST;
    description = `This combatant had already struck first.`;
    isVisible?: boolean = false;
    applicationHooks =  {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class RiposteStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.RIPOSTE;
    description = `Every time an enemy misses this combatant in melee, this combatant will retaliate against the attacker with a basic attack.`;
    applicationHooks = {
        [StatusEffectHook.OnBeingMissed]: (self: Combatant, attacker: Combatant, damage: Damage, amount: number, board: Board) => {
            const rangeCalculator = new RangeCalculator();
            if(rangeCalculator.areInMeleeRange(self, attacker)) {
                const combatMaster = CombatMaster.getInstance();
                const riposteResult = combatMaster.executeAttack(self, attacker.position, board, self.basicAttack());
                emitter.emit('trigger-method', riposteResult);
            }
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class MarchingDefenseStatusEffect implements StatusEffect {
    description = `This combatant can use the Defend action even after moving`;
    name: StatusEffectType = StatusEffectType.MARCHING_DEFENSE;
    applicationHooks = {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class SadistStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.SADIST;
    description = `This combatant will restore some health and stamina and gain an attack power boost if it inflicts 50 or more damage with a direct attack.`;
    applicationHooks = {
        [StatusEffectHook.OnInflictingDamage]: (self: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            if(damage.amount >= 50) {
                self.stats.hp = Math.min(self.stats.hp + 15, self.baseStats.hp);
                self.stats.stamina = Math.min(self.stats.stamina + 15, self.baseStats.stamina);
                self.applyStatusEffect({
                    name: StatusEffectType.STRENGTH_BOOST,
                    duration: 3,
                });
                emitter.emit('trigger-method', getStatusEffectActionResult(StatusEffectType.STRENGTH_BOOST, self.position, 1));
            }
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class GoingOffStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.GOING_OFF;
    description = `This combatant will explode on death, inflicting fire damage to all enemies in 1-tile radius nova.`;
    applicationHooks = {
        [StatusEffectHook.OnDeath]: (caster: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {

            const combatMaster = CombatMaster.getInstance();
            const getAllTargets = board.getAreaOfEffectPositions(caster, caster.position, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.All);
            getAllTargets.forEach((targetPosition) => {
                const targetEnemy = board.getCombatantAtPosition(targetPosition);
                if(targetEnemy && targetEnemy.name !== caster.name) {
                    const result = combatMaster.executeAttack(caster, targetEnemy.position, board, {amount: 30, type: DamageType.Fire});
                    emitter.emit('trigger-method', result);
                }
            });
        },
        [StatusEffectHook.OnDamageTaken]: (self: Combatant, target: Combatant, damage: Damage) => {
            if(damage.amount >= 1 && (damage.type  === DamageType.Ice)) {
                self.removeStatusEffect(StatusEffectType.GOING_OFF);
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class DivineMiracleStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DIVINE_MIRACLE;
    description = `Once per Battle, upon their health dropping to 0, this combatant will heal and have all negative statuses removed`;
    applicationHooks = {
        [StatusEffectHook.OnDeath]: (caster: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            if(caster.hasStatusEffect(StatusEffectType.DIVINE_MIRACLE_USED)) {
                return;
            }
            caster.stats.hp = Math.min(40, caster.baseStats.hp);
            const negativeStatusEffects: StatusEffect[] = caster.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative);
            for(const statusEffect of negativeStatusEffects) {
                caster?.removeStatusEffect(statusEffect.name);
            }
            // caster.removeStatusEffect(StatusEffectType.DIVINE_MIRACLE);
            caster.applyStatusEffect({
                name: StatusEffectType.DIVINE_MIRACLE_USED,
                duration: Number.POSITIVE_INFINITY,
            });
            return {
                attackResult: AttackResult.Hit,
                damage: {
                    amount: 40,
                    type: DamageType.Healing
                },
                cost: 0,
                reaction: DamageReaction.NONE,
                position: target
            };
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}   

export class LifeDrinkerStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.LIFE_DRINKER;
    description = `Every time this combatant kills a non construct enemy, it will gain 30% of the target's max health, and 10% of the target's max health for each negative status it has.`;
    applicationHooks = {
        [StatusEffectHook.OnKilling]: (caster: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            if(!caster.isOrganic()) {
                return;
            }
            const victimMaxHp = target.baseStats.hp;
            const victimNegativeEffectCount = target.getStatusEffects().filter(status => status.alignment === StatusEffectAlignment.Negative).length;
            const lifeDrinkAmount = Math.floor((victimMaxHp * 0.3) + 
            (victimNegativeEffectCount > 0 ? victimNegativeEffectCount * (victimMaxHp * 0.1) : 0));
            caster.baseStats.hp += lifeDrinkAmount;
            caster.stats.hp = Math.min(caster.stats.hp + lifeDrinkAmount, caster.baseStats.hp);
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class LastStandUsedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.LAST_STAND_USED;
    description = ``;
    isVisible?: boolean = false;
    applicationHooks = {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class DecoyStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DECOY;
    description = `This combatant is a decoy, and will be destroyed if its creator is revealed. Destroying the decoy will reveal the creator.`;
    applicationHooks = {
        [StatusEffectHook.OnDeath]: (caster: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            const realTarget = caster.getRelatedCombatants()["doll_owner"];
            if(realTarget) {
                realTarget.removeStatusEffect(StatusEffectType.CLOAKED);
            }
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class SurpriseBoomStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.SURPRISE_BOOM;
    description = `This combatant will explode on death, inflicting blight damage to everyone around in 1-tile radius nova.`;
    applicationHooks = {
        [StatusEffectHook.OnDeath]: (caster: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            const combatMaster = CombatMaster.getInstance();
            const getAllTargets = board.getAreaOfEffectPositions(caster, target.position, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.All);
            const results: ActionResult[] = getAllTargets.map((targetPosition) => {
                const targetEnemy = board.getCombatantAtPosition(targetPosition);
                if(!targetEnemy || targetEnemy.name === caster.name) {
                    return getStandardActionResult();
                }
                const result = combatMaster.executeAttack(caster, targetEnemy.position, board, {amount: 20, type: DamageType.Blight});
                if(result.attackResult === AttackResult.Hit || result.attackResult === AttackResult.CriticalHit) {
                    combatMaster.tryInflictStatusEffect(caster, targetEnemy.position, board, StatusEffectType.POISONED, 3, 0.6);
                }
                return result;
            });
            return results;
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class TrollRegenerationStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.TROLL_REGENERATION;
    description = `This combatant will regenerate some health at the start of each turn. Suffering fire or blight damage will remove this status.`;
    applicationHooks = {
        [StatusEffectHook.OnTurnStart]: (self: Combatant) => {
            const newHp = Math.min(self.stats.hp + 12, self.baseStats.hp);
            const deltaHp = newHp - self.stats.hp;
            self.stats.hp = newHp;
            return {
                attackResult: AttackResult.Hit,
                damage: {amount: deltaHp, type: DamageType.Healing},
                cost: 0,
                reaction: DamageReaction.NONE,
                position: self.position
            };
        },
        [StatusEffectHook.OnDamageTaken]: (self: Combatant, target: Combatant, damage: Damage) => {
            if(damage.amount >= 1 && (damage.type  === DamageType.Fire || damage.type === DamageType.Blight)) {
                self.removeStatusEffect(StatusEffectType.TROLL_REGENERATION);
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class ReloadStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.RELOAD;
    description = `The tower is reloading its cannon, and can't use a certain skill until it's done reloading.`;
    applicationHooks = {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class PhysDuplicateStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.PHYS_DUPLICATE;
    description = `Upon taking physical damage, this combatant duplicates itself to both left and right of itself, if possible.`;
    applicationHooks = {
        [StatusEffectHook.OnDamageTaken]: (self: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {

            if(damage.amount <= 0 || 
                (damage.type !== DamageType.Crush &&
                damage.type !== DamageType.Pierce && 
                damage.type !== DamageType.Slash)) {
                return;
            }

            const leftPosition = board.isValidPosition({x: self.position.x - 1, y: self.position.y}) &&
             board.isPositionEmpty({x: self.position.x - 1, y: self.position.y}) ? {x: self.position.x - 1, y: self.position.y} : null;
            const rightPosition = board.isValidPosition({x: self.position.x + 1, y: self.position.y}) &&
             board.isPositionEmpty({x: self.position.x + 1, y: self.position.y}) ? {x: self.position.x + 1, y: self.position.y} : null;
            
            if(leftPosition) {
                const name = getNewCombatantName(CombatantType.OozeGolem, self.team.getAliveCombatants().map(c => c.name));
                const oozeGolem = getCombatantByType(CombatantType.OozeGolem, self.team);
                oozeGolem.position = leftPosition;
                oozeGolem.name = name;
                self.team.addCombatant(oozeGolem);
                board.placeCombatant(oozeGolem, leftPosition);
            }

            if(rightPosition) {
                const name = getNewCombatantName(CombatantType.OozeGolem, self.team.getAliveCombatants().map(c => c.name));
                const oozeGolem = getCombatantByType(CombatantType.OozeGolem, self.team);
                oozeGolem.position = rightPosition;
                oozeGolem.name = name;
                self.team.addCombatant(oozeGolem);
                board.placeCombatant(oozeGolem, rightPosition);
            }
            
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

// function createOozeGolem(position: Position, team: Team, board: Board) {
//     console.log(position);
     
//     const name = getNewCombatantName(CombatantType.OozeGolem, team.getAliveCombatants().map(c => c.name));
//     const name = "fooo";
//     const oozeGolem = new OozeGolem(name, position, team);
//     team.addCombatant(oozeGolem);
//     board.placeCombatant(oozeGolem, position);
// }


export class WeaveEatingStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.WEAVE_EATING;
    description = `Magic damage dealt to this combatant will charge it with eldritch energy.`;
    applicationHooks = {
        [StatusEffectHook.OnDamageTaken]: (self: Combatant, target: Combatant, damage: Damage, amount: number, board: Board) => {
            if(damage.amount <= 0 || 
                damage.type === DamageType.Crush || 
                damage.type === DamageType.Pierce ||  
                damage.type === DamageType.Slash ||
                damage.type === DamageType.Unstoppable) {
                return;
            }

            self.applyStatusEffect({
                name: StatusEffectType.REGENERATING,
                duration: 3,
            });

            if(!self.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING)) {
                self.applyStatusEffect({
                    name: StatusEffectType.ARCANE_CHANNELING,
                    duration: Number.POSITIVE_INFINITY,
                });
                emitter.emit('trigger-method', getStatusEffectActionResult(StatusEffectType.ARCANE_CHANNELING, self.position, 1));
            } else {
                self.applyStatusEffect({
                    name: StatusEffectType.ARCANE_OVERCHARGE,
                    duration: Number.POSITIVE_INFINITY,
                });
                emitter.emit('trigger-method', getStatusEffectActionResult(StatusEffectType.ARCANE_OVERCHARGE, self.position, 1));
            }
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class AlwaysBlockStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ALWAYS_BLOCK;
    description = `This combatant will always block all incoming damage.`;
    isVisible?: boolean = false;
    applicationHooks = {
        [StatusEffectHook.OnBeingAttacked]: (self: Combatant, defender: Combatant, damage: Damage, attackCost: number) => {
            return {attackResult: AttackResult.Blocked, damage: {amount: 0, type: DamageType.Unstoppable}, cost: 2, reaction: DamageReaction.IMMUNITY, position: self.position};
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class AlwaysBeCritStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ALWAYS_BE_CRIT;
    description = `This combatant will always be hit with a critical.`;
    isVisible?: boolean = false;
    applicationHooks = {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class AlwaysByHitStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.ALWAYS_BY_HIT;
    description = `This combatant will always be hit normally.`;
    isVisible?: boolean = false;
    applicationHooks = {
        [StatusEffectHook.OnBeingAttacked]: (self: Combatant, attacker: Combatant, damage: Damage, attackCost: number) => {
            if(self.isDefending()) {
                return ;
            }
            const delta = attacker.stats.attackPower - self.stats.defensePower;
            const baseDamage = {amount: damage.amount * (delta * 0.01 + 1), type: damage.type};
            const isWeakTo = self.resistances.find((r) => r.type === baseDamage.type)?.reaction === DamageReaction.WEAKNESS;
            const finalDamageAmount = isWeakTo ? baseDamage.amount * 1.25 : baseDamage.amount;
            self.takeDamage({ amount: finalDamageAmount, type: damage.type });
            return {attackResult: AttackResult.Hit, damage: { amount: finalDamageAmount, type: damage.type }, cost: isWeakTo ? 0.5 : 1,
                 reaction: isWeakTo ? DamageReaction.WEAKNESS : DamageReaction.NONE, position: self.position};
        }
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class DrillSergeantStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DRILL_SERGEANT;
    description = `This is your drill sergeant. God have mercy on your soul if you piss him off.`;
    applicationHooks = {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Permanent;
}

export class DivineMiracleUsedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DIVINE_MIRACLE_USED;
    description = `This combatant has used their divine miracle.`;
    isVisible?: boolean = false;
    applicationHooks = {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}

export class DivineAlacrityStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.DIVINE_ALACRITY;
    description = `This combatant gains an additional action point every round.`;
    applicationHooks = {
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Neutral;
}
