import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { UnitedWeStand } from "../SpecialMoves/Coop/BuffCoop";
import { StrikeAsOne } from "../SpecialMoves/Coop/OffensiveCoop";
import { LastStandOfHeroes, RenewedStrength } from "../SpecialMoves/Coop/SupportCoop";
import { CallOfStrength, CallOfVigor, Encourage } from "../SpecialMoves/Singular/Buffs";
import { InspiringKiller } from "../SpecialMoves/Singular/Passives";
import { RallyToTheBanner } from "../SpecialMoves/Singular/Support";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { HEALTH_INCREASE_AMOUNT, HEALTH_INCREASE_ENABLED, STAMINA_INCREASE_AMOUNT, STAMINA_INCREASE_ENABLED, STAT_BUFF_INCREASE_ENABLED } from "../LogicFlags";

export class StandardBearer extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: HEALTH_INCREASE_ENABLED ? 75 + HEALTH_INCREASE_AMOUNT : 75,
          stamina: STAMINA_INCREASE_ENABLED ? 35 + STAMINA_INCREASE_AMOUNT : 35,
          attackPower: STAT_BUFF_INCREASE_ENABLED ? 65 : 15,
          defensePower: STAT_BUFF_INCREASE_ENABLED ? 75 : 25,
          initiative: 5,
          movementSpeed: 3,
          range: 1,
          agility: 6,
          luck: 6,
        },
        position,
        [
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Crush, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Fire, reaction: DamageReaction.NONE},
            {type: DamageType.Ice, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.WEAKNESS},
        ],
        [
          new InspiringKiller(),
          new CallOfStrength(),
          new CallOfVigor(),
          new Encourage(),
          new RallyToTheBanner(),

          // supers
          new StrikeAsOne(),
          new RenewedStrength(),
          new UnitedWeStand(),
          new LastStandOfHeroes(),
          
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.StandardBearer;
    }
  
    basicAttack(): Damage {
        return { amount: 20, type: DamageType.Crush };
    }
  }