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

export class Healer extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 50,
          attackPower: 10,
          defensePower: 10,
          stamina: 50,
          initiative: 2,
          movementSpeed: 4,
          range: 1,
          agility: 5,
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
          {type: DamageType.Holy, reaction: DamageReaction.IMMUNITY},
          {type: DamageType.Dark, reaction: DamageReaction.WEAKNESS},
        ],
        [
          new Heal(),
          new Regenerate(),
          new Purify(),
          new SacredFlame(),
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