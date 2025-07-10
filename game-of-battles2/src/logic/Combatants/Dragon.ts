import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { DragonBreath, DragonFireBall, Claws, DieMortal } from "../SpecialMoves/Singular/Offensive";

export class Dragon extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 500,
          stamina: 2000,
          attackPower: 100,
          defensePower: 100,
          initiative: 1,
          movementSpeed: 5,
          range: 1,
          agility: 8,
          luck: 18,
        },
        position,
        [
            {type: DamageType.Crush, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Fire, reaction: DamageReaction.NONE},
            {type: DamageType.Ice, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Blight, reaction: DamageReaction.NONE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
          // new AdditionaTurns1(),
          new DragonBreath(),
          new DragonFireBall(),
          new Claws(),
          // new DragonRage(),
          new DieMortal(),
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.Dragon;
    }
  
    basicAttack(): Damage {
        return { amount: 50, type: DamageType.Slash };
    }
  }