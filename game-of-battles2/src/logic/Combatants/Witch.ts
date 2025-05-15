import { StatusEffect } from "../StatusEffect";

import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { GraspOfZirash, SacredFlame } from "../SpecialMoves/Singular/Offensive";
import { EvilEye, SiphonEnergy, Slow, Weaken } from "../SpecialMoves/Singular/Debuffs";

export class Witch extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 55,
          attackPower: 15,
          defensePower: 5,
          stamina: 40,
          initiative: 3,
          movementSpeed: 3,
          range: 1,
          agility: 4,
          luck: 9,
        },
        position,
        [
          {type: DamageType.Slash, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Pierce, reaction: DamageReaction.NONE},
          {type: DamageType.Crush, reaction: DamageReaction.NONE},
          {type: DamageType.Fire, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Ice, reaction: DamageReaction.RESISTANCE},
          {type: DamageType.Lightning, reaction: DamageReaction.NONE},
          {type: DamageType.Blight, reaction: DamageReaction.RESISTANCE},
          {type: DamageType.Holy, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Dark, reaction: DamageReaction.IMMUNITY},
        ],
        [
          new Weaken(),
          new EvilEye(),
          new Slow(),
          new GraspOfZirash(),
          new SiphonEnergy(),

          // supers
          // new DevourDivinity()
          // new HungerOfZirash()
          // new UltimateCurse()
        ], team
      );
    }

    basicAttack(): Damage {
      return { amount: 15, type: DamageType.Dark };
    }

    getCombatantType(): CombatantType {
        return CombatantType.Witch;
      }
  }