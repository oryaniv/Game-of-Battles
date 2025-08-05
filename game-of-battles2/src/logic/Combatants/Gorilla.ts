import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { GorillaSmash } from "../SpecialMoves/Singular/Offensive";

export class Gorilla extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 450,
          stamina: 20,
          attackPower: 100,
          defensePower: 80,
          initiative: 1,
          movementSpeed: 5,
          range: 1,
          agility: 7,
          luck: 1,
        },
        position,
        [
            {type: DamageType.Crush, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Fire, reaction: DamageReaction.NONE},
            {type: DamageType.Ice, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.NONE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
          new GorillaSmash()
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.Gorilla;
    }
  
    basicAttack(): Damage {
        return { amount: 60, type: DamageType.Crush };
    }
  }