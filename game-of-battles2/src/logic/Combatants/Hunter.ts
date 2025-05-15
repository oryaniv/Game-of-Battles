import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { PinDown, Ricochet, ToxicArrow } from "../SpecialMoves/Singular/Offensive";
import { FocusAim } from "../SpecialMoves/Singular/Self";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";


export class Hunter extends Combatant {
    constructor(name: string, position: Position, team: Team) {
        super(
          name,
          {
            hp: 60,
            attackPower: 25,
            defensePower: 10,
            stamina: 30,
            initiative: 5,
            movementSpeed: 3,
            range: 8,
            agility: 8,
            luck: 5,
          },
          position,
          [
            {type: DamageType.Slash, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Crush, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Fire, reaction: DamageReaction.NONE},
            {type: DamageType.Ice, reaction: DamageReaction.NONE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
          ],
          [
            new FocusAim(),
            new PinDown(),
            new Ricochet(),
            new ToxicArrow(),

            // supers
            // new ArrowRain()
            // new BrimstoneRain()
            // new SniperShot()
          ], team
        );
      }

      getCombatantType(): CombatantType {
        return CombatantType.Hunter;
      }

      basicAttack(): Damage {
        return { amount: 25, type: DamageType.Pierce };
      }
      
      
}