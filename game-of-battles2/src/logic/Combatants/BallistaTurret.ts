import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { BlockingStance } from "../SpecialMoves/Singular/Self";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";

export class BallistaTurret extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 60,
          attackPower: 30,
          defensePower: 15,
          stamina: 15,
          initiative: 1,
          movementSpeed: Number.NEGATIVE_INFINITY,
          range: 7,
          agility: 5,
          luck: 3,
        },
        position,
        [
            {type: DamageType.Crush, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Pierce, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Fire, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Ice, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.NONE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
            // new ScorpionBolt(),
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.BallistaTurret;
    }
  
    basicAttack(): Damage {
        return { amount: 30, type: DamageType.Pierce };
    }
  }