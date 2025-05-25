import { ActionResult } from "./attackResult";
import { Board } from "./Board";
import { Combatant, CombatantStats } from "./Combatant";
import { DamageType, Damage } from "./Damage";
import { BlockingStance } from "./SpecialMoves/Singular/Self";
import { FrozenStatusEffect, ImmobilizedStatusEffect, LuckDowngradeStatusEffect, SlowStatusEffect, StrengthDowngradeStatusEffect, PoisonedStatusEffect, BleedingStatusEffect, TauntedStatusEffect, StupefiedStatusEffect, NauseatedStatusEffect, MesmerizedStatusEffect, StaggeredStatusEffect, DefenseDowngradeStatusEffect, MarkedForPainStatusEffect, MarkedForOblivionStatusEffect, MarkedForExecutionStatusEffect } from "./StatusEffects.ts/NegativeEffects";
import { EnergyAbsorbStatusEffect, FirstStrikeStatusEffect, FoolsLuckStatusEffect, InspiringKillerStatusEffect, MarchingDefenseStatusEffect, RiposteStatusEffect, SadistStatusEffect, GoingOffStatusEffect, DivineMiracleStatusEffect, LifeDrinkerStatusEffect } from "./StatusEffects.ts/NeutralEffects";
import { ArcaneChannelingStatusEffect, BlockingStanceStatusEffect, CloakedStatusEffect, EncouragedStatusEffect, FocusAimStatusEffect, FortifiedStatusEffect, FullMetalJacketStatusEffect, MesmerizingStatusEffect, MobilityBoostStatusEffect, RalliedStatusEffect, RegeneratingStatusEffect, StrengthBoostStatusEffect } from "./StatusEffects.ts/PositiveEffects";

export enum StatusEffectType {
    // 0
    BLOCKING_STANCE,
    // 1
    ARCANE_CHANNELING,
    // 2
    FOCUS_AIM,
    // 3
    FORTIFIED,
    // 4
    IMMOBILIZED,
    // 5
    REGENERATING,
    // 6
    FROZEN,
    // 7
    POISONED,
    // 8
    STRENGTH_BOOST,
    // 9
    MOBILITY_BOOST,
    // 10
    ENCOURAGED,
    // 11
    RALLIED,
    // 12
    STRENGTH_DOWNGRADE,
    // 13
    INSPIRING_KILLER,
    // 14
    LUCK_DOWNGRADE,
    // 15
    SLOW,
    // 16
    ENERGY_ABSORB,
    // 17
    BLEEDING,
    // 18
    TAUNTED,
    // 19
    FOOLS_LUCK,
    // 20
    MESMERIZING,
    // 21
    MESMERIZED,
    // 22
    NAUSEATED,
    // 23
    STUPEFIED,
    // 24
    STAGGERED,
    // 25
    FIRST_STRIKE,
    // 26
    DEFENSE_DOWNGRADE,
    // 27
    IDAI_NO_HADOU,
    // 28
    RIPOSTE,
    // 29
    STRUCK_FIRST,
    // 30
    MARCHING_DEFENSE,
    // 31
    CLOAKED,
    // 32
    SADIST,
    // 33
    MARKED_FOR_PAIN,
    // 34 
    MARKED_FOR_EXECUTION,
    // 35
    MARKED_FOR_OBLIVION,
    // 36
    MARKED_DETONATED,
    // 37
    FULL_METAL_JACKET,
    // 38
    GOING_OFF,
    // 39
    DEFENDING,
    // 40
    DIVINE_MIRACLE,
    // 41
    LIFE_DRINKER,
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
    OnBeingMissed = "OnBeingMissed",
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
    OnInflictingDamage = "OnInflictingDamage",
    OnKilling = "OnKilling",
    OnBeingAilmentInflicted = "OnBeingAilmentInflicted",
    OnBeingSteppedOn = "OnBeingSteppedOn",
    OnDeath = "OnDeath",
  }

  export enum StatusEffectAlignment {
    Negative = 0,
    Positive = 1,
    Neutral = 2,
    Permanent = 3
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
    [StatusEffectType.ENERGY_ABSORB]: new EnergyAbsorbStatusEffect(),
    [StatusEffectType.TAUNTED]: new TauntedStatusEffect(),
    [StatusEffectType.STUPEFIED]: new StupefiedStatusEffect(),
    [StatusEffectType.NAUSEATED]: new NauseatedStatusEffect(),
    [StatusEffectType.MESMERIZED]: new MesmerizedStatusEffect(),
    [StatusEffectType.MESMERIZING]: new MesmerizingStatusEffect(),
    [StatusEffectType.FOOLS_LUCK]: new FoolsLuckStatusEffect(),
    [StatusEffectType.STAGGERED]: new StaggeredStatusEffect(),
    [StatusEffectType.RIPOSTE]: new RiposteStatusEffect(),
    [StatusEffectType.FIRST_STRIKE]: new FirstStrikeStatusEffect(),
    [StatusEffectType.DEFENSE_DOWNGRADE]: new DefenseDowngradeStatusEffect(),
    [StatusEffectType.MARCHING_DEFENSE]: new MarchingDefenseStatusEffect(),
    [StatusEffectType.MARKED_FOR_PAIN]: new MarkedForPainStatusEffect(),
    [StatusEffectType.MARKED_FOR_EXECUTION]: new MarkedForExecutionStatusEffect(),
    [StatusEffectType.MARKED_FOR_OBLIVION]: new MarkedForOblivionStatusEffect(),
    [StatusEffectType.SADIST]: new SadistStatusEffect(),
    [StatusEffectType.CLOAKED]: new CloakedStatusEffect(),
    [StatusEffectType.GOING_OFF]: new GoingOffStatusEffect(),
    [StatusEffectType.FULL_METAL_JACKET]: new FullMetalJacketStatusEffect(),
    [StatusEffectType.DIVINE_MIRACLE]: new DivineMiracleStatusEffect(),
    [StatusEffectType.LIFE_DRINKER]: new LifeDrinkerStatusEffect(),
  };

  export function getStatusEffect(name: StatusEffectType) : StatusEffect | undefined {
    return StatusEffectsTable[name];
  }

  export function getResultsForStatusEffectHook(invoker: Combatant, hookType: StatusEffectHook, target?: Combatant, damage?: Damage, amount?: number, board?: Board): ActionResult[] {
    const correspondingToTypeHooks: StatusEffect[] = invoker.getStatusEffectsOfHook(hookType);
    const correspondingToTypeHooksResults: ActionResult[] = correspondingToTypeHooks
    .map((hook) => hook.applicationHooks[hookType]!(invoker, target, damage, amount, board))
    .filter((result) => result !== undefined) as ActionResult[];

    return correspondingToTypeHooksResults;
  }
