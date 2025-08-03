import { ActionResult } from "./attackResult";
import { Board } from "./Board";
import { Combatant, CombatantStats } from "./Combatant";
import { DamageType, Damage } from "./Damage";
import { BlockingStance } from "./SpecialMoves/Singular/Self";
import { FrozenStatusEffect, ImmobilizedStatusEffect, LuckDowngradeStatusEffect, SlowStatusEffect, StrengthDowngradeStatusEffect, PoisonedStatusEffect, BleedingStatusEffect, TauntedStatusEffect, StupefiedStatusEffect, NauseatedStatusEffect, MesmerizedStatusEffect, StaggeredStatusEffect, DefenseDowngradeStatusEffect, MarkedForPainStatusEffect, 
  MarkedForOblivionStatusEffect, MarkedForExecutionStatusEffect, PanickedStatusEffect, CharmedStatusEffect, NightmareLockedStatusEffect, ForbiddenAfflictionStatusEffect,
   DivineRetributionStatusEffect, PlaguedStatusEffect, BurningStatusEffect, DiamondHookedStatusEffect, SleepingStatusEffect } from "./StatusEffects.ts/NegativeEffects";
import { StruckFirstStatusEffect, DrillSergeantStatusEffect, WeaveEatingStatusEffect, PhysDuplicateStatusEffect, DefendingStatusEffect, EnergyAbsorbStatusEffect, FirstStrikeStatusEffect, FoolsLuckStatusEffect, InspiringKillerStatusEffect, MarchingDefenseStatusEffect, RiposteStatusEffect, SadistStatusEffect, GoingOffStatusEffect, DivineMiracleStatusEffect, LifeDrinkerStatusEffect, LastStandUsedStatusEffect, DecoyStatusEffect, SurpriseBoomStatusEffect, TrollRegenerationStatusEffect, ReloadStatusEffect, AlwaysByHitStatusEffect, AlwaysBeCritStatusEffect, AlwaysBlockStatusEffect } from "./StatusEffects.ts/NeutralEffects";
import { ArcaneBarrierStatusEffect, ArcaneChannelingStatusEffect, ArcaneConduitStatusEffect, ArcaneOverchargeStatusEffect, ArcaneShieldWallProtectedStatusEffect, ArcaneShieldWallStatusEffect, BlockingStanceStatusEffect, CircusDiaboliqueStatusEffect, CloakedStatusEffect, DiamondSupremacyStatusEffect, EncouragedStatusEffect, FocusAimStatusEffect, FortifiedStatusEffect, FrenzyStatusEffect, FullMetalJacketStatusEffect, GuardianProtectedStatusEffect, GuardianStatusEffect, IdaiNoHadouStatusEffect, MesmerizingStatusEffect, MobilityBoostStatusEffect, RalliedStatusEffect, RegeneratingStatusEffect, SanctuaryStatusEffect, ShieldWallProtectedStatusEffect, ShieldWallStatusEffect, StrengthBoostStatusEffect, DiamondHookedHoldingStatusEffect, IngeniousUpgradeStatusEffect } from "./StatusEffects.ts/PositiveEffects";
import { SpecialMove } from "./SpecialMove";

export enum 
StatusEffectType {
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
    // 42
    PANICKED, 
    // 43
    DIAMOND_SUPREMACY,
    // 44
    CHARMED,
    // 45
    CIRCUS_DIABOLIQUE,
    // 46
    NIGHTMARE_LOCKED,
    // 47
    LAST_STAND_USED,
    // 48
    SHIELD_WALL,
    // 49
    SHIELD_WALL_PROTECTED,
    // 50
    ARCANE_SHIELD_WALL,
    // 51
    ARCANE_SHIELD_WALL_PROTECTED,
    // 52
    FRENZY,
    // 53
    FORBIDDEN_AFFLICTION,
    // 54
    SANCTUARY,
    // 55
    DIVINE_RETRIBUTION,
    // 56
    DECOY,
    // 57
    SURPRISE_BOOM,
    // 58
    PLAGUED,
    // 59
    BURNING,
    // 60
    ARCANE_OVERCHARGE,
    // 61
    ARCANE_BARRIER,
    // 62
    ARCANE_CONDUIT,
    // 63
    GUARDIAN,
    // 64
    GUARDIAN_PROTECTED,
    // 65
    DIAMOND_HOOKED,
    // 66
    DIAMOND_HOOKED_HOLDING,
    // 67
    TROLL_REGENERATION,
    // 68
    INGENIOUS_UPGRADE,
    // 69
    RELOAD,
    // 70
    SLEEPING,
    // 71
    PHYS_DUPLICATE,
    // 72
    WEAVE_EATING,
    // 73
    ALWAYS_BLOCK,
    // 74
    ALWAYS_BE_CRIT,
    // 75
    ALWAYS_BY_HIT,
    // 76
    DRILL_SERGEANT
}

/* 
PHYS_DUPLICATE, WEAVE_EATING
*/

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
    isVisible?: boolean;
    description: string;
    applicationHooks: {
      [key in StatusEffectHook]?: (combatant: Combatant, ...args: any[]) => any;
    };
    alignment: StatusEffectAlignment;
  }

  interface StatusEffects {
    [key: number]: StatusEffect | undefined; // Or StatusEffect | null, depending on your needs
  }

  const StatusEffectsTable: StatusEffects = {
    [StatusEffectType.DEFENDING]: new DefendingStatusEffect(),
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
    [StatusEffectType.IDAI_NO_HADOU]: new IdaiNoHadouStatusEffect(),
    [StatusEffectType.PANICKED]: new PanickedStatusEffect(),
    [StatusEffectType.CHARMED]: new CharmedStatusEffect(),
    [StatusEffectType.CIRCUS_DIABOLIQUE]: new CircusDiaboliqueStatusEffect(),
    [StatusEffectType.NIGHTMARE_LOCKED]: new NightmareLockedStatusEffect(),
    [StatusEffectType.LAST_STAND_USED]: new LastStandUsedStatusEffect(),
    [StatusEffectType.SHIELD_WALL]: new ShieldWallStatusEffect(),
    [StatusEffectType.SHIELD_WALL_PROTECTED]: new ShieldWallProtectedStatusEffect(),
    [StatusEffectType.ARCANE_SHIELD_WALL]: new ArcaneShieldWallStatusEffect(),
    [StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED]: new ArcaneShieldWallProtectedStatusEffect(),
    [StatusEffectType.FORBIDDEN_AFFLICTION]: new ForbiddenAfflictionStatusEffect(),
    [StatusEffectType.SANCTUARY]: new SanctuaryStatusEffect(),
    [StatusEffectType.DIVINE_RETRIBUTION]: new DivineRetributionStatusEffect(),
    [StatusEffectType.DECOY]: new DecoyStatusEffect(),
    [StatusEffectType.SURPRISE_BOOM]: new SurpriseBoomStatusEffect(),
    [StatusEffectType.PLAGUED]: new PlaguedStatusEffect(),
    [StatusEffectType.BURNING]: new BurningStatusEffect(),
    [StatusEffectType.FRENZY]: new FrenzyStatusEffect(),
    [StatusEffectType.ARCANE_OVERCHARGE]: new ArcaneOverchargeStatusEffect(),
    [StatusEffectType.ARCANE_BARRIER]: new ArcaneBarrierStatusEffect(),
    [StatusEffectType.ARCANE_CONDUIT]: new ArcaneConduitStatusEffect(),
    [StatusEffectType.DIAMOND_SUPREMACY]: new DiamondSupremacyStatusEffect(),
    [StatusEffectType.GUARDIAN]: new GuardianStatusEffect(),
    [StatusEffectType.GUARDIAN_PROTECTED]: new GuardianProtectedStatusEffect(),
    [StatusEffectType.DIAMOND_HOOKED]: new DiamondHookedStatusEffect(),
    [StatusEffectType.DIAMOND_HOOKED_HOLDING]: new DiamondHookedHoldingStatusEffect(),
    [StatusEffectType.TROLL_REGENERATION]: new TrollRegenerationStatusEffect(),
    [StatusEffectType.INGENIOUS_UPGRADE]: new IngeniousUpgradeStatusEffect(),
    [StatusEffectType.RELOAD]: new ReloadStatusEffect(),
    [StatusEffectType.SLEEPING]: new SleepingStatusEffect(),
    [StatusEffectType.PHYS_DUPLICATE]: new PhysDuplicateStatusEffect(),
    [StatusEffectType.WEAVE_EATING]: new WeaveEatingStatusEffect(),
    [StatusEffectType.ALWAYS_BLOCK]: new AlwaysBlockStatusEffect(),
    [StatusEffectType.ALWAYS_BE_CRIT]: new AlwaysBeCritStatusEffect(),
    [StatusEffectType.ALWAYS_BY_HIT]: new AlwaysByHitStatusEffect(),
    [StatusEffectType.DRILL_SERGEANT]: new DrillSergeantStatusEffect(),
    [StatusEffectType.STRUCK_FIRST]: new StruckFirstStatusEffect(),
  };

  export function getStatusEffect(name: StatusEffectType) : StatusEffect | undefined {
    return StatusEffectsTable[name];
  }

  export function getResultsForStatusEffectHook(invoker: Combatant, hookType: StatusEffectHook, target?: Combatant, damage?: Damage, amount?: number, board?: Board, skill?: SpecialMove): ActionResult[] {
    const correspondingToTypeHooks: StatusEffect[] = invoker.getStatusEffectsOfHook(hookType);
    const correspondingToTypeHooksResults: ActionResult[] = correspondingToTypeHooks
    .map((hook) => hook.applicationHooks[hookType]!(invoker, target, damage, amount, board, skill))
    .filter((result) => result !== undefined) as ActionResult[];

    return correspondingToTypeHooksResults;
  }
