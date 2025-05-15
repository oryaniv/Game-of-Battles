import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { BlockingStance } from "../SpecialMoves/Singular/Self";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";

export class DragonOfChaos extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 250,
          attackPower: 40,
          defensePower: 40,
          stamina: 200,
          initiative: 10,
          movementSpeed: Number.NEGATIVE_INFINITY,
          range: 1,
          agility: 8,
          luck: 12,
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
            // new SoulDevourer(),
            // 
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.DragonOfChaos;
    }
  
    basicAttack(): Damage {
        return { amount: 40, type: DamageType.Unstoppable };
    }
  }