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
import { BuildWalls, BoomBoomJack, ReinforceConstruct } from "../SpecialMoves/Singular/Support";
import { FlameThrower } from "../SpecialMoves/Coop/OffensiveCoop";
import { BuildBallistaTurret, BuildBabyBabel, IngeniousUpgrade } from "../SpecialMoves/Coop/BuffCoop";
import { HEALTH_INCREASE_AMOUNT, HEALTH_INCREASE_ENABLED, STAMINA_INCREASE_AMOUNT, STAMINA_INCREASE_ENABLED, STAT_BUFF_INCREASE_ENABLED } from "../LogicFlags";

export class Artificer extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: HEALTH_INCREASE_ENABLED ? 55 + HEALTH_INCREASE_AMOUNT : 55,
          stamina: STAMINA_INCREASE_ENABLED ? 50 + STAMINA_INCREASE_AMOUNT : 50,
          attackPower: STAT_BUFF_INCREASE_ENABLED ? 60 : 10,
          defensePower: STAT_BUFF_INCREASE_ENABLED ? 65 : 15,
          
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
          new BuildWalls(),
          new BoomBoomJack(),
          new ShockingGauntlet(),
          new FullMetalJacket(),
          new ReinforceConstruct(),

          // supers
          new BuildBallistaTurret(),
          new FlameThrower(),
          new IngeniousUpgrade(),
          new BuildBabyBabel()
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