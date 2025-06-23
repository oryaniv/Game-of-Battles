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
import { LifeDrinker } from "../SpecialMoves/Singular/Passives";
import { DevourDivinity, UltimateCurse } from "../SpecialMoves/Coop/DebuffCoop";
import { HungerOfZirash, SoulScythe } from "../SpecialMoves/Coop/OffensiveCoop";
import { HEALTH_INCREASE_AMOUNT, HEALTH_INCREASE_ENABLED, STAMINA_INCREASE_AMOUNT, STAMINA_INCREASE_ENABLED, STAT_BUFF_INCREASE_ENABLED } from "../LogicFlags";

export class Witch extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: HEALTH_INCREASE_ENABLED ? 55 + HEALTH_INCREASE_AMOUNT : 55,
          stamina: STAMINA_INCREASE_ENABLED ? 40 + STAMINA_INCREASE_AMOUNT : 40,
          attackPower: STAT_BUFF_INCREASE_ENABLED ? 75 : 15,
          defensePower: STAT_BUFF_INCREASE_ENABLED ? 50  : 10,
          initiative: 3,
          movementSpeed: 3,
          range: 1,
          agility: 5,
          luck: 9,
        },
        position,
        [
          {type: DamageType.Slash, reaction: DamageReaction.NONE},
          {type: DamageType.Pierce, reaction: DamageReaction.NONE},
          {type: DamageType.Crush, reaction: DamageReaction.NONE},
          {type: DamageType.Fire, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Ice, reaction: DamageReaction.NONE},
          {type: DamageType.Lightning, reaction: DamageReaction.NONE},
          {type: DamageType.Blight, reaction: DamageReaction.RESISTANCE},
          {type: DamageType.Holy, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Dark, reaction: DamageReaction.RESISTANCE},
        ],
        [
          new Weaken(),
          new EvilEye(),
          new Slow(),
          new GraspOfZirash(),
          new SiphonEnergy(),
          new LifeDrinker(),

          // supers
          new SoulScythe(),
          new DevourDivinity(),
          new UltimateCurse(),
          new HungerOfZirash() 
          
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