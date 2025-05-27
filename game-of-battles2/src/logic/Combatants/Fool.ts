import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { BlowAKiss, CircusDiabolique, StandUpComedyGoneWrong } from "../SpecialMoves/Coop/AilmentCoop";
import { LookeyHere, SmellIt, StupidestCrapEver, YoMama } from "../SpecialMoves/Singular/Ailments";
import { FoolsLuck } from "../SpecialMoves/Singular/Passives";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";


export class Fool extends Combatant {
    constructor(name: string, position: Position, team: Team) {
        super(
          name,
          {
            hp: 50,
            attackPower: 1,
            defensePower: 10,
            stamina: 40,
            initiative: 4,
            movementSpeed: 3,
            range: 2,
            agility: 7,
            luck: 10,
          },
          position,
          [
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Crush, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Fire, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Ice, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
          ],
          [
            new YoMama(),
            new StupidestCrapEver(),
            new SmellIt(),
            new LookeyHere(),
            new FoolsLuck(),

            // supers
            // new NastyNastyDolly(),
            new BlowAKiss(),
            new StandUpComedyGoneWrong(),
            new CircusDiabolique(),
            
          ], team
        );
      }

      getCombatantType(): CombatantType {
        return CombatantType.Fool;
      }

      basicAttack(): Damage {
        return { amount: 1, type: DamageType.Unstoppable };
      }
      
      
}