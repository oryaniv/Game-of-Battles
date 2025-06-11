import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { DanceOfDaggers, KarithrasBoon, RuptureTendons } from "../SpecialMoves/Coop/OffensiveCoop";
import { BloodRite } from "../SpecialMoves/Coop/SupportCoop";
import { AssassinsMark } from "../SpecialMoves/Singular/Debuffs";
import { SneakAttack, VipersKiss } from "../SpecialMoves/Singular/Offensive";
import { Sadist } from "../SpecialMoves/Singular/Passives";
import { ShadowStep } from "../SpecialMoves/Singular/Self";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";


export class Rogue extends Combatant {
    constructor(name: string, position: Position, team: Team) {
        super(
          name,
          {
            hp: 50,
            attackPower: 25,
            defensePower: 15,
            stamina: 30,
            initiative: 7,
            movementSpeed: 4,
            range: 1,
            agility: 9,
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
            new RuptureTendons(),
            new DanceOfDaggers(),
            new KarithrasBoon(),
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