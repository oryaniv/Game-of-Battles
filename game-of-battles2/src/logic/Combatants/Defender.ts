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
import { Fortify } from "../SpecialMoves/Singular/Buffs";
import { ShieldBash } from "../SpecialMoves/Coop/OffensiveCoop";
import { ArcaneShieldWall, Guardian, ShieldWall } from "../SpecialMoves/Coop/SupportCoop";
import { HEALTH_INCREASE_AMOUNT, HEALTH_INCREASE_ENABLED, STAMINA_INCREASE_AMOUNT, STAMINA_INCREASE_ENABLED } from "../LogicFlags";
export class Defender extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: HEALTH_INCREASE_ENABLED ? 100 + HEALTH_INCREASE_AMOUNT : 100,
          attackPower: 20,
          defensePower: 30,
          stamina: STAMINA_INCREASE_ENABLED ? 25 + STAMINA_INCREASE_AMOUNT : 25,
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
          {type: DamageType.Dark, reaction: DamageReaction.WEAKNESS},
        ],
        [
          new MarchingDefense(),
          new BlockingStance(),
          new DefensiveStrike(),
          new Fortify(),

          // supers
          new ShieldBash(),
          new Guardian(),
          new ShieldWall(),
          new ArcaneShieldWall()
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