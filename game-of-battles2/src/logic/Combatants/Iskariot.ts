import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { SneakAttack } from "../SpecialMoves/Singular/Offensive";
import { BlockingStance, ShadowStep } from "../SpecialMoves/Singular/Self";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";

export class Iskariot extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 80,
          attackPower: 35,
          defensePower: 20,
          stamina: 40,
          initiative: 8,
          movementSpeed: 5,
          range: 1,
          agility: 10,
          luck: 4,
        },
        position,
        [
            
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Crush, reaction: DamageReaction.NONE},          
            {type: DamageType.Fire, reaction: DamageReaction.NONE},
            {type: DamageType.Ice, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Dark, reaction: DamageReaction.IMMUNITY},
        ],
        [
            new ShadowStep(),
            // new BayonetBarrage()
            new SneakAttack(),
            // new GodsAssassinsMark(),
            // new ILikeKillingThingsBecauseItsFun()
            // new AutoRegeneration()

            // supers
            
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.Iskariot;
    }
  
    basicAttack(): Damage {
        return { amount: 25, type: DamageType.Slash };
    }
  }