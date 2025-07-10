import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { MindLash, WeaveBurst, ChainWeaveBurst } from "../SpecialMoves/Singular/Offensive";
import { WeaveEating } from "../SpecialMoves/Singular/Passives";


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
            {type: DamageType.Fire, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Ice, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Blight, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Lightning, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Holy, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Dark, reaction: DamageReaction.RESISTANCE},
        ],
        [
           new WeaveBurst(),
           new MindLash(),
           new WeaveEating(),
           new ChainWeaveBurst()
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