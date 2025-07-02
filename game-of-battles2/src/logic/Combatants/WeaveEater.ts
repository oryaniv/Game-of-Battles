import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { MindLash, WeaveBurst } from "../SpecialMoves/Singular/Offensive";


export class WeaveEater extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 70,
          attackPower: 60,
          defensePower: 60,
          stamina: 35,
          initiative: 3,
          movementSpeed: 3,
          range: 1,
          agility: 5,
          luck: 4,
        },
        position,
        [
            {type: DamageType.Crush, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Pierce, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Slash, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Fire, reaction: DamageReaction.NONE},
            {type: DamageType.Ice, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.NONE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.IMMUNITY},
            {type: DamageType.Dark, reaction: DamageReaction.IMMUNITY},
        ],
        [
           new WeaveBurst(),
           new MindLash(),
           // new ElemDuplicate()
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.WeaveEater;
    }
  
    basicAttack(): Damage {
        return { amount: 20, type: DamageType.Dark };
    }
  }