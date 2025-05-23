import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { GoOff } from "../SpecialMoves/Singular/Passives";
import { BlockingStance } from "../SpecialMoves/Singular/Self";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";

export class Wall extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 50,
          attackPower: 0,
          defensePower: 20,
          stamina: 1,
          initiative: 0,
          movementSpeed: Number.NEGATIVE_INFINITY,
          range: 0,
          agility: 2,
          luck: 0,
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
            
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.Wall;
    }
  
    basicAttack(): Damage {
        return { amount: 0, type: DamageType.Unstoppable };
    }

    isConstruct(): boolean {
        return true;
    }

    isExpendable(): boolean {
      return true;
    }
}


export class Bomb extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 20,
          attackPower: 0,
          defensePower: 0,
          stamina: 1,
          initiative: 0,
          movementSpeed: Number.NEGATIVE_INFINITY,
          range: 0,
          agility: 0,
          luck: 0,
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
            new GoOff()
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.Bomb;
    }
  
    basicAttack(): Damage {
        return { amount: 0, type: DamageType.Unstoppable };
    }

    isConstruct(): boolean {
        return true;
    }

    isExpendable(): boolean {
        return true;
    }
}