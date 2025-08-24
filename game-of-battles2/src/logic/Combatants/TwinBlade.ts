import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { ShadowStep } from "../SpecialMoves/Singular/Self";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { SneakAttack, TwinSpin, VipersKiss } from "../SpecialMoves/Singular/Offensive";
import { AssassinsMark , ArakansBane} from "../SpecialMoves/Singular/Debuffs";
import { ReviveTwin } from "../SpecialMoves/Singular/Support";
import { Riposte } from "../SpecialMoves/Singular/Passives";



export class TwinBlade extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 80,
          stamina: 45,
          attackPower: 90,
          defensePower: 60,
          initiative: 5,
          movementSpeed: 4,
          range: 1,
          agility: 10,
          luck: 8,
        },
        position,
        [
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Crush, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Fire, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Ice, reaction: DamageReaction.NONE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.IMMUNITY},
            {type: DamageType.Holy, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Dark, reaction: DamageReaction.RESISTANCE},
        ],
        [
           new Riposte(),
           new ShadowStep(),
           new VipersKiss(),
           new TwinSpin(),
           new ArakansBane(),
           new ReviveTwin(),
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.TwinBlades;
    }
  
    basicAttack(): Damage {
        return { amount: 25, type: DamageType.Slash };
    }
  }