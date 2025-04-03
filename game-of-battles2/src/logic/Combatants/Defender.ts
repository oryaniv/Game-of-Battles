import { StatusEffect } from "../StatusEffect";
import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { MarchingDefense } from "../SpecialMoves/Singular/Passives";
import { BlockingStance } from "../SpecialMoves/Singular/Self";
import { DefensiveStrike } from "../SpecialMoves/Singular/Offensive";
export class Defender extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 100,
          attackPower: 10,
          defensePower: 30,
          stamina: 20,
          initiative: 4,
          movementSpeed: 3,
          range: 1,
          agility: 5,
          luck: 3,
        },
        position,
        [
          {type: DamageType.Slash, reaction: DamageReaction.RESISTANCE},
          {type: DamageType.Pierce, reaction: DamageReaction.RESISTANCE},
          {type: DamageType.Crush, reaction: DamageReaction.NONE},
          {type: DamageType.Fire, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Ice, reaction: DamageReaction.NONE},
          {type: DamageType.Lightning, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Blight, reaction: DamageReaction.NONE},
          {type: DamageType.Holy, reaction: DamageReaction.NONE},
          {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
          new MarchingDefense(),
          new BlockingStance(),
          new DefensiveStrike(),
        ], team 
      );
    }

    basicAttack(): Damage {
      return { amount: 15, type: DamageType.Slash };
    }

    getCombatantType(): CombatantType {
      return CombatantType.Defender;
    }
  }