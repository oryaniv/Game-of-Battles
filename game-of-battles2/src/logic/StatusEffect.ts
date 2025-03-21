import { Combatant, CombatantStats } from "./Combatant";
export enum StatusEffectType {
    DEFENDING,
    POISONED,
    SLEEP,
    BLOCKING_STANCE,
    SENTINEL
}

  export enum StatusEffectHook {
    OnApply = "OnApply",
    OnRemove = "OnRemove",
    OnTurnStart = "OnTurnStart",
    OnTurnEnd = "OnTurnEnd",
    OnDamageTaken = "OnDamageTaken",
    OnActionAttempt = "OnActionAttempt",
    OnCalculateDamage = "OnCalculateDamage",
    OnAdjacentEnemyEnter = "OnAdjacentEnemyEnter",
    OnKnockOut = "OnKnockOut"
  }
  
  export interface StatusEffect {
    name: StatusEffectType;
    duration: number;
    hooks: {
      [key in StatusEffectHook]?: (combatant: Combatant, ...args: any[]) => any;
    };
    modifyStats?: (stats: CombatantStats) => CombatantStats;
  }