import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { FeralSwing, GuardBreaker, Rampage } from "../SpecialMoves/Singular/Offensive";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";

export class Vanguard extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 90,
          attackPower: 35,
          defensePower: 10,
          stamina: 25,
          initiative: 6,
          movementSpeed: 5,
          range: 1,
          agility: 4,
          luck: 4,
        },
        position,
        [
            {type: DamageType.Crush, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Fire, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Ice, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Blight, reaction: DamageReaction.NONE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
          // new UnstoppableCharge(),
          new FeralSwing(),
          new GuardBreaker(),
          new Rampage(),
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.Vanguard;
    }
  
    basicAttack(): Damage {
        return { amount: 35, type: DamageType.Slash };
    }
  }