import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { GapingStab, HaftStrike, Skewer } from "../SpecialMoves/Singular/Offensive";
import { FirstStrike } from "../SpecialMoves/Singular/Passives";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";

export class Pikeman extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 80,
          attackPower: 20,
          defensePower: 20,
          stamina: 25,
          initiative: 4,
          movementSpeed: 3,
          range: 2,
          agility: 5,
          luck: 5,
        },
        position,
        [
            {type: DamageType.Crush, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Fire, reaction: DamageReaction.NONE},
            {type: DamageType.Ice, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Blight, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
          new Skewer(),
          new GapingStab(),
          new HaftStrike(),
          new FirstStrike(),
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.Pikeman;
    }
  
    basicAttack(): Damage {
        return { amount: 25, type: DamageType.Pierce };
    }
  }