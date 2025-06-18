import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { DanceOfDaggers, KarithrasBoon, ForbiddenArt } from "../SpecialMoves/Coop/OffensiveCoop";
import { BloodRite } from "../SpecialMoves/Coop/SupportCoop";
import { AssassinsMark } from "../SpecialMoves/Singular/Debuffs";
import { SneakAttack, VipersKiss } from "../SpecialMoves/Singular/Offensive";
import { Sadist } from "../SpecialMoves/Singular/Passives";
import { ShadowStep } from "../SpecialMoves/Singular/Self";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { SleepingDart } from "../SpecialMoves/Coop/AilmentCoop";
import { HEALTH_INCREASE_AMOUNT, HEALTH_INCREASE_ENABLED, STAMINA_INCREASE_AMOUNT, STAMINA_INCREASE_ENABLED, STAT_BUFF_INCREASE_ENABLED } from "../LogicFlags";


export class Rogue extends Combatant {
    constructor(name: string, position: Position, team: Team) {
        super(
          name,
          {
            hp: HEALTH_INCREASE_ENABLED ? 50 + HEALTH_INCREASE_AMOUNT : 50,
            attackPower: STAT_BUFF_INCREASE_ENABLED ? 80 : 25,
            defensePower: STAT_BUFF_INCREASE_ENABLED ? 50 : 15,
            stamina: STAMINA_INCREASE_ENABLED ? 30 + STAMINA_INCREASE_AMOUNT : 30,
            initiative: 7,
            movementSpeed: 4,
            range: 1,
            agility: STAT_BUFF_INCREASE_ENABLED ? 12 : 9,
            luck: 5,
          },
          position,
          [
            {type: DamageType.Slash, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Crush, reaction: DamageReaction.NONE},
            {type: DamageType.Fire, reaction: DamageReaction.NONE},
            {type: DamageType.Ice, reaction: DamageReaction.NONE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Holy, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Dark, reaction: DamageReaction.RESISTANCE},
          ],
          [
            new ShadowStep(),
            new VipersKiss(),
            new SneakAttack(),
            new AssassinsMark(),
            new Sadist(),

            // supers
            new BloodRite(),
            // new AllayunOverdose(),
            new ForbiddenArt(),
            new SleepingDart(),
            new KarithrasBoon(),
            // new DanceOfDaggers(),
            // new ForbiddenArt(),
            
          ], team
        );
      }

      getCombatantType(): CombatantType {
        return CombatantType.Rogue;
      }

      basicAttack(): Damage {
        return { amount: 20, type: DamageType.Slash };
      }
      
      
}