import { ActionResult } from "./attackResult";
import { Combatant, CombatantStats } from "./Combatant";
import { DamageType, Damage } from "./Damage";
import { BlockingStance } from "./SpecialMoves/Singular/Self";
import { FrozenStatusEffect, ImmobilizedStatusEffect, LuckDowngradeStatusEffect, SlowStatusEffect, StrengthDowngradeStatusEffect, PoisonedStatusEffect, BleedingStatusEffect } from "./StatusEffects.ts/NegativeEffects";
import { EnergyAbsorbStatusEffect, InspiringKillerStatusEffect } from "./StatusEffects.ts/NeutralEffects";
import { ArcaneChannelingStatusEffect, BlockingStanceStatusEffect, EncouragedStatusEffect, FocusAimStatusEffect, FortifiedStatusEffect, MobilityBoostStatusEffect, RalliedStatusEffect, RegeneratingStatusEffect, StrengthBoostStatusEffect } from "./StatusEffects.ts/PositiveEffects";

export enum StatusEffectType {
    DEFENDING,
    BLOCKING_STANCE,
    ARCANE_CHANNELING,
    FOCUS_AIM,
    FORTIFIED,
    IMMOBILIZED,
    REGENERATING,
    FROZEN,
    POISONED,
    STRENGTH_BOOST,
    MOBILITY_BOOST,
    ENCOURAGED,
    RALLIED,
    INSPIRING_KILLER,
    STRENGTH_DOWNGRADE,
    LUCK_DOWNGRADE,
    SLOW, 
    ENERGY_ABOSORB,
    BLEEDING
}

  export enum StatusEffectHook {
    // for affects to happen when the status effect is applied - like attack up
    OnApply = "OnApply",
    // for affects to happen when the status effect is removed - like remove attack up
    OnRemove = "OnRemove",
    // for affects to happen when the turn starts - like sleep or confusion
    OnTurnStart = "OnTurnStart",
    // for affects to happen when the turn ends - like poison damage
    OnTurnEnd = "OnTurnEnd",
    // for affects to happen when the combatant is being attacked, like blocking stance
    OnBeingAttacked = "OnBeingAttacked",
    // for affects to happen when the combatant takes damage, like ???
    OnDamageTaken = "OnDamageTaken",
    OnAfterCalculateDamage = "OnAfterCalculateDamage",
    OnAdjacentEnemyEnter = "OnAdjacentEnemyEnter",
    // for affects to happen when the combatant is knocked out like last stand
    OnKnockOut = "OnKnockOut",
    // for affects to happen when the combatant is attacking - like remove blocking stance
    OnAttacking = "OnAttacking",
    // for affects to happen when the combatant finishes attacking - like remove Focus Aim
    OnAfterAttacking = "OnAfterAttacking",
    OnDefending = "OnDefending",
    // for affects to happen when the combatant uses a skill - like remove blocking stance
    OnSkillUsed = "OnSkillUsed",
    // for affects to happen when the combatant moves - like remove blocking stance
    OnMoving = "OnMoving",
    OnKilling = "OnKilling"
  }

  export enum StatusEffectAlignment {
    Positive,
    Negative,
    Neutral
  }

  export interface StatusEffectApplication {
    name: StatusEffectType;
    duration: number;
  }
  
  export interface StatusEffect {
    name: StatusEffectType;
    applicationHooks: {
      [key in StatusEffectHook]?: (combatant: Combatant, ...args: any[]) => any;
    };
    alignment: StatusEffectAlignment;
  }

  interface StatusEffects {
    [key: number]: StatusEffect | undefined; // Or StatusEffect | null, depending on your needs
  }

  const StatusEffectsTable: StatusEffects = {
    [StatusEffectType.BLOCKING_STANCE]: new BlockingStanceStatusEffect(),
    [StatusEffectType.ARCANE_CHANNELING]: new ArcaneChannelingStatusEffect(),
    [StatusEffectType.FOCUS_AIM]: new FocusAimStatusEffect(),
    [StatusEffectType.IMMOBILIZED]: new ImmobilizedStatusEffect(),
    [StatusEffectType.REGENERATING]: new RegeneratingStatusEffect(),
    [StatusEffectType.FROZEN]: new FrozenStatusEffect(),
    [StatusEffectType.POISONED]: new PoisonedStatusEffect(), 
    [StatusEffectType.BLEEDING]: new BleedingStatusEffect(),
    [StatusEffectType.FORTIFIED]: new FortifiedStatusEffect(),
    [StatusEffectType.STRENGTH_BOOST]: new StrengthBoostStatusEffect(),
    [StatusEffectType.MOBILITY_BOOST]: new MobilityBoostStatusEffect(),
    [StatusEffectType.ENCOURAGED]: new EncouragedStatusEffect(),
    [StatusEffectType.RALLIED]: new RalliedStatusEffect(),
    [StatusEffectType.INSPIRING_KILLER]: new InspiringKillerStatusEffect(),
    [StatusEffectType.STRENGTH_DOWNGRADE]: new StrengthDowngradeStatusEffect(),
    [StatusEffectType.LUCK_DOWNGRADE]: new LuckDowngradeStatusEffect(),
    [StatusEffectType.SLOW]: new SlowStatusEffect(),
    [StatusEffectType.ENERGY_ABOSORB]: new EnergyAbsorbStatusEffect()
  };

  export function getStatusEffect(name: StatusEffectType) : StatusEffect | undefined {
    return StatusEffectsTable[name];
  }

  export function getResultsForStatusEffectHook(invoker: Combatant, hookType: StatusEffectHook, target?: Combatant, damage?: Damage, amount?: number): ActionResult[] {
    const correspondingToTypeHooks: StatusEffect[] = invoker.getStatusEffectsOfHook(hookType);
    const correspondingToTypeHooksResults: ActionResult[] = correspondingToTypeHooks
    .map((hook) => hook.applicationHooks[hookType]!(invoker, target, damage, 1))
    .filter((result) => result !== undefined) as ActionResult[];

    return correspondingToTypeHooksResults;
  }
