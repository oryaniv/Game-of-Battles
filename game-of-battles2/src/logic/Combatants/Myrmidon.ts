import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { DefensiveStrike, Skewer } from "../SpecialMoves/Singular/Offensive";
import { FirstStrike, MarchingDefense } from "../SpecialMoves/Singular/Passives";
import { BlockingStance } from "../SpecialMoves/Singular/Self";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";

export class Myrmidon extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 120,
          attackPower: 20,
          defensePower: 30,
          stamina: 30,
          initiative: 4,
          movementSpeed: 3,
          range: 2,
          agility: 6,
          luck: 6,
        },
        position,
        [
            
            {type: DamageType.Slash, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Crush, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Fire, reaction: DamageReaction.NONE},
            {type: DamageType.Ice, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Lightning, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
            new MarchingDefense(),
            // new ImprovedBlockingStance(),
            new DefensiveStrike(),
            new FirstStrike(),
            new Skewer(),
            // new ImprovedShieldBash(),

            // supers
            // new ThunderLance()
            // new SheildWall()
            // new ArcaneShieldWall()
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.Myrmidon;
    }
  
    basicAttack(): Damage {
        return { amount: 25, type: DamageType.Pierce };
    }
  }