import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { BrimstoneRain, PlagueArrow, RainOfArrows, SnipeShot } from "../SpecialMoves/Coop/OffensiveCoop";
import { PinDown, Ricochet, ToxicArrow } from "../SpecialMoves/Singular/Offensive";
import { FocusAim } from "../SpecialMoves/Singular/Self";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { HEALTH_INCREASE_AMOUNT, HEALTH_INCREASE_ENABLED, STAMINA_INCREASE_AMOUNT, STAMINA_INCREASE_ENABLED, STAT_BUFF_INCREASE_ENABLED } from "../LogicFlags";

export class Hunter extends Combatant {
    constructor(name: string, position: Position, team: Team) {
        super(
          name,
          { 
            hp: HEALTH_INCREASE_ENABLED ? 60 + HEALTH_INCREASE_AMOUNT : 60,
            stamina: STAMINA_INCREASE_ENABLED ? 30 + STAMINA_INCREASE_AMOUNT : 30,
            attackPower: STAT_BUFF_INCREASE_ENABLED ? 75 : 25,
            defensePower: STAT_BUFF_INCREASE_ENABLED ? 50 : 10,
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
             new PlagueArrow(),
             new SnipeShot(),
             new RainOfArrows(),
             new BrimstoneRain()
          ], team
        );
      }

      getCombatantType(): CombatantType {
        return CombatantType.Hunter;
      }

      basicAttack(): Damage {
        return { amount: 20, type: DamageType.Pierce };
      }
      
      
}