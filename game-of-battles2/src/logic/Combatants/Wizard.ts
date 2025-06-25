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
import { ArcaneBarrier, ArcaneOvercharge, Teleportation } from "../SpecialMoves/Coop/SelfCoop";
import { CatastrophicCalamity } from "../SpecialMoves/Coop/OffensiveCoop";
import { ArcaneConduit } from "../SpecialMoves/Coop/SupportCoop";
import { HEALTH_INCREASE_AMOUNT, HEALTH_INCREASE_ENABLED, STAMINA_INCREASE_AMOUNT, STAMINA_INCREASE_ENABLED, STAT_BUFF_INCREASE_ENABLED } from "../LogicFlags";

export class Wizard extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: HEALTH_INCREASE_ENABLED ? 40 + HEALTH_INCREASE_AMOUNT : 40,
          attackPower: STAT_BUFF_INCREASE_ENABLED ? 85 : 20,
          defensePower: STAT_BUFF_INCREASE_ENABLED ? 55 : 20,
          stamina: STAMINA_INCREASE_ENABLED ? 60 + STAMINA_INCREASE_AMOUNT : 60,
          initiative: 12,
          movementSpeed: 3,
          range: 1,
          agility: 6,
          luck: 7,
        },
        position,
        [
          {type: DamageType.Slash, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Pierce, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Crush, reaction: DamageReaction.NONE},
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

          // supers
          new ArcaneConduit(),
          new ArcaneOvercharge(),
          new ArcaneBarrier(),
          new Teleportation(),
          new CatastrophicCalamity()
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