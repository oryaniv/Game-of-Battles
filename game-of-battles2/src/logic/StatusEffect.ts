import { ActionResult } from "./attackResult";
import { Combatant, CombatantStats } from "./Combatant";
import { DamageType } from "./Damage";
import { BlockingStance } from "./SpecialMoves/Singular/Self";
import { ArcaneChannelingStatusEffect, BlockingStanceStatusEffect } from "./StatusEffects.ts/PositiveEffects";

export enum StatusEffectType {
    DEFENDING,
    BLOCKING_STANCE,
    ARCANE_CHANNELING,
    FOCUS_AIM,
    FORTIFIED,
    IMMOBILIZED
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
    OnCalculateDamage = "OnCalculateDamage",
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
    OnMoving = "OnMoving"
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
    [StatusEffectType.ARCANE_CHANNELING]: new ArcaneChannelingStatusEffect()
  };

  export function getStatusEffect(name: StatusEffectType) : StatusEffect | undefined {
    return StatusEffectsTable[name];
  }

  export function getResultsForStatusEffectHook(invoker: Combatant, hookType: StatusEffectHook, target?: Combatant, damageType?: DamageType, amount?: number): ActionResult[] {
    const correspondingToTypeHooks: StatusEffect[] = invoker.getStatusEffectsOfHook(hookType);
    const correspondingToTypeHooksResults: ActionResult[] = correspondingToTypeHooks
    .map((hook) => hook.applicationHooks[hookType]!(invoker, target, damageType, 1))
    .filter((result) => result !== undefined) as ActionResult[];

    return correspondingToTypeHooksResults;
  }
