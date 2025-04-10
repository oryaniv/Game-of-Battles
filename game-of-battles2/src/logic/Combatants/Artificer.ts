import { StatusEffect } from "../StatusEffect";

import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";

export class Artificer extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 60,
          attackPower: 10,
          defensePower: 15,
          stamina: 40,
          initiative: 4,
          movementSpeed: 2,
          range: 1,
          agility: 4,
          luck: 5,
        },
        position,
        [
          {type: DamageType.Slash, reaction: DamageReaction.NONE},
          {type: DamageType.Pierce, reaction: DamageReaction.NONE},
          {type: DamageType.Crush, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Fire, reaction: DamageReaction.RESISTANCE},
          {type: DamageType.Ice, reaction: DamageReaction.NONE},
          {type: DamageType.Lightning, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Blight, reaction: DamageReaction.RESISTANCE},
          {type: DamageType.Holy, reaction: DamageReaction.NONE},
          {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
        ], team
      );
    }

    basicAttack(): Damage {
      return { amount: 10, type: DamageType.Crush };
    }

    getCombatantType(): CombatantType {
        return CombatantType.Artificer;
      }
  }