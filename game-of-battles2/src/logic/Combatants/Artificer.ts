import { StatusEffect } from "../StatusEffect";

import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { ShockingGauntlet } from "../SpecialMoves/Singular/Offensive";
import { FullMetalJacket } from "../SpecialMoves/Singular/Buffs";
import { ReinforceConstruct } from "../SpecialMoves/Singular/Support";

export class Artificer extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 55,
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
          {type: DamageType.Pierce, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Crush, reaction: DamageReaction.NONE},
          {type: DamageType.Fire, reaction: DamageReaction.RESISTANCE},
          {type: DamageType.Ice, reaction: DamageReaction.NONE},
          {type: DamageType.Lightning, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Blight, reaction: DamageReaction.RESISTANCE},
          {type: DamageType.Holy, reaction: DamageReaction.NONE},
          {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
          // new BuildWalls(),
          // new ExplosiveTrap(),
          new ShockingGauntlet(),
          new FullMetalJacket(),
          new ReinforceConstruct(),

          // supers
          // new BuildBallistaTurret()
          // new FlameThrower()
          // new CreateForceField()
        ],
        team
      );
    }

    basicAttack(): Damage {
      return { amount: 10, type: DamageType.Crush };
    }

    getCombatantType(): CombatantType {
        return CombatantType.Artificer;
      }
  }