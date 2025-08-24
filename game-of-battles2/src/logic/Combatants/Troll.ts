import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { VenomousSpit, Horns, Claws, TrollKick } from "../SpecialMoves/Singular/Offensive";
import { TrollRegeneration, BeastRage } from "../SpecialMoves/Singular/Self";

export class Troll extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 500,
          stamina: 100,
          attackPower: 110,
          defensePower: 90,
          initiative: 2,
          movementSpeed: 4,
          range: 1,
          agility: 5,
          luck: 2,
        },
        position,
        [
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Crush, reaction: DamageReaction.NONE},
            {type: DamageType.Fire, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Ice, reaction: DamageReaction.NONE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
          new VenomousSpit(),
          new Horns(),
          new Claws(),
          new TrollKick(),
          new TrollRegeneration(),
          new BeastRage(),
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.Troll;
    }
  
    basicAttack(): Damage {
        return { amount: 50, type: DamageType.Crush };
    }
  }