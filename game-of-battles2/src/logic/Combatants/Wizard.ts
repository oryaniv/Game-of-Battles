import { StatusEffect } from "../StatusEffect";

import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { ChainLightning, FireBall, Flame, FrozenBurst, Icicle, LightningBolt } from "../SpecialMoves/Singular/Offensive";
import { ArcaneChanneling } from "../SpecialMoves/Singular/Self";

export class Wizard extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 40,
          attackPower: 20,
          defensePower: 20,
          stamina: 60,
          initiative: 2,
          movementSpeed: 2,
          range: 1,
          agility: 6,
          luck: 7,
        },
        position,
        [
          {type: DamageType.Slash, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Pierce, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Crush, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Fire, reaction: DamageReaction.RESISTANCE},
          {type: DamageType.Ice, reaction: DamageReaction.RESISTANCE},
          {type: DamageType.Lightning, reaction: DamageReaction.RESISTANCE},
          {type: DamageType.Blight, reaction: DamageReaction.NONE},
          {type: DamageType.Holy, reaction: DamageReaction.NONE},
          {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
          new Flame(),
          new LightningBolt(),
          new Icicle(),
          new ArcaneChanneling(),
          new FireBall(),
          new ChainLightning(),
          new FrozenBurst(),
        ], team
      );
    }

    basicAttack(): Damage {
      return { amount: 5, type: DamageType.Crush };
    }

    getCombatantType(): CombatantType {
        return CombatantType.Wizard;
      }
  }