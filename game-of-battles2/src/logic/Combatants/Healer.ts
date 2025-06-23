import { StatusEffect } from "../StatusEffect";

import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { SacredFlame } from "../SpecialMoves/Singular/Offensive";
import { Heal, Purify, Regenerate } from "../SpecialMoves/Singular/Support";
import { DivineMircale } from "../SpecialMoves/Singular/Passives";
import { RainOfGrace, Sanctuary } from "../SpecialMoves/Coop/SupportCoop";
import { QueensWrathMothersLove } from "../SpecialMoves/Coop/OffensiveCoop";
import { DivineRetribution } from "../SpecialMoves/Coop/DebuffCoop";
import { HEALTH_INCREASE_AMOUNT, HEALTH_INCREASE_ENABLED, STAMINA_INCREASE_AMOUNT, STAMINA_INCREASE_ENABLED, STAT_BUFF_INCREASE_ENABLED } from "../LogicFlags";

export class Healer extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: HEALTH_INCREASE_ENABLED ? 50 + HEALTH_INCREASE_AMOUNT : 50,
          stamina: STAMINA_INCREASE_ENABLED ? 50 + STAMINA_INCREASE_AMOUNT : 50,
          attackPower: STAT_BUFF_INCREASE_ENABLED ? 40 : 10 ,
          defensePower: STAT_BUFF_INCREASE_ENABLED ? 70 : 15,
          initiative: 2,
          movementSpeed: 3,
          range: 1,
          agility: 4,
          luck: 8,
        },
        position,
        [
          {type: DamageType.Slash, reaction: DamageReaction.NONE},
          {type: DamageType.Pierce, reaction: DamageReaction.NONE},
          {type: DamageType.Crush, reaction: DamageReaction.NONE},
          {type: DamageType.Fire, reaction: DamageReaction.NONE},
          {type: DamageType.Ice, reaction: DamageReaction.NONE},
          {type: DamageType.Lightning, reaction: DamageReaction.NONE},
          {type: DamageType.Blight, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Holy, reaction: DamageReaction.RESISTANCE},
          {type: DamageType.Dark, reaction: DamageReaction.WEAKNESS},
        ],
        [
          new Heal(),
          new Regenerate(),
          new Purify(),
          new SacredFlame(),
          new DivineMircale(),

          // supers
          new Sanctuary(),
          new DivineRetribution(),
          new RainOfGrace(),
          new QueensWrathMothersLove()
        ], team
      );
    }

    basicAttack(): Damage {
      return { amount: 10, type: DamageType.Holy };
    }

    getCombatantType(): CombatantType {
        return CombatantType.Healer;
      }
  }