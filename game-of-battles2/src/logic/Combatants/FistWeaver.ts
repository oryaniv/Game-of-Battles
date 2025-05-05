import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { AngelicTouch, TitanicFist, WindRunAssault } from "../SpecialMoves/Singular/Offensive";
import { Riposte } from "../SpecialMoves/Singular/Passives";
import { Meditate } from "../SpecialMoves/Singular/Support";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";

export class FistWeaver extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 70,
          attackPower: 25,
          defensePower: 15,
          stamina: 35,
          initiative: 5,
          movementSpeed: 4,
          range: 1,
          agility: 7,
          luck: 6,
        },
        position,
        [
            {type: DamageType.Crush, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Fire, reaction: DamageReaction.NONE},
            {type: DamageType.Ice, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Dark, reaction: DamageReaction.WEAKNESS},
        ],
        [
          new WindRunAssault(),
          new TitanicFist(),
          new Meditate(),
          new AngelicTouch(),
          new Riposte()
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.FistWeaver;
    }
  
    basicAttack(): Damage {
        return { amount: 25, type: DamageType.Crush };
    }
  }