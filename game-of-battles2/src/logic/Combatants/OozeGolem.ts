import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { GooSpit, Crush } from "../SpecialMoves/Singular/Offensive";
import { PhysDuplicate } from "../SpecialMoves/Singular/Passives";


export class OozeGolem extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 70,
          attackPower: 60,
          defensePower: 60,
          stamina: 25,
          initiative: 3,
          movementSpeed: 3,
          range: 1,
          agility: 5,
          luck: 4,
        },
        position,
        [
            {type: DamageType.Crush, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Fire, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Ice, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Blight, reaction: DamageReaction.IMMUNITY},
            {type: DamageType.Lightning, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
           new GooSpit(),
           new Crush(),
           new PhysDuplicate()
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.OozeGolem;
    }

    isOrganic(): boolean {
        return false;
    }
  
    basicAttack(): Damage {
        return { amount: 20, type: DamageType.Blight };
    }
  }