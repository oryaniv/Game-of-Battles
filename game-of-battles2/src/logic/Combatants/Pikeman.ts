import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { ShatterSteel } from "../SpecialMoves/Coop/DebuffCoop";
import { ColdEdge, SkeweringHarppon, DiamondHook } from "../SpecialMoves/Coop/OffensiveCoop";
import { DiamondSupremacy } from "../SpecialMoves/Coop/SelfCoop";
import { GapingStab, HaftStrike, Skewer } from "../SpecialMoves/Singular/Offensive";
import { FirstStrike } from "../SpecialMoves/Singular/Passives";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { HEALTH_INCREASE_AMOUNT, HEALTH_INCREASE_ENABLED, STAMINA_INCREASE_AMOUNT, STAMINA_INCREASE_ENABLED, STAT_BUFF_INCREASE_ENABLED } from "../LogicFlags";

export class Pikeman extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: HEALTH_INCREASE_ENABLED ? 70 + HEALTH_INCREASE_AMOUNT : 70,
          stamina: STAMINA_INCREASE_ENABLED ? 25 + STAMINA_INCREASE_AMOUNT : 25,
          attackPower: STAT_BUFF_INCREASE_ENABLED ? 70 : 20,
          defensePower: STAT_BUFF_INCREASE_ENABLED ? 70 : 20,
          initiative: 3,
          movementSpeed: 3,
          range: 2,
          agility: 5,
          luck: 5,
        },
        position,
        [
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Crush, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Fire, reaction: DamageReaction.NONE},
            {type: DamageType.Ice, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
          new Skewer(),
          new GapingStab(),
          new HaftStrike(),
          new FirstStrike(),

          // supers
          new ColdEdge(),
          new ShatterSteel(),
          new SkeweringHarppon(),
          new DiamondHook(),
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.Pikeman;
    }
  
    basicAttack(): Damage {
        return { amount: 25, type: DamageType.Pierce };
    }
  }