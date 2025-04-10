import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
export class Militia extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 30,
          attackPower: 10,
          defensePower: 10,
          stamina: 20,
          initiative: 1,
          movementSpeed: 3,
          range: 1,
          agility: 5,
          luck: 3,
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
        [],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.Militia;
    }
  
    basicAttack(): Damage {
        return { amount: 20, type: DamageType.Crush };
    }
  }