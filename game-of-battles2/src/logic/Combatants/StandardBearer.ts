import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { CallOfStrength, CallOfVigor, Encourage } from "../SpecialMoves/Singular/Buffs";
import { InspiringKiller } from "../SpecialMoves/Singular/Passives";
import { RallyToTheBanner } from "../SpecialMoves/Singular/Support";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";

export class StandardBearer extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 75,
          attackPower: 15,
          defensePower: 25,
          stamina: 35,
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
            {type: DamageType.Fire, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Ice, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Blight, reaction: DamageReaction.NONE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
          new InspiringKiller(),
          new CallOfStrength(),
          new CallOfVigor(),
          new Encourage(),
          new RallyToTheBanner(),
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