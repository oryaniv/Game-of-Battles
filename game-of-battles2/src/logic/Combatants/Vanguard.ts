import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Position } from "../Position";
import { HellScream } from "../SpecialMoves/Coop/AilmentCoop";
import { SkySovereignsWrath, WhirlwindAttack } from "../SpecialMoves/Coop/OffensiveCoop";
import { Frenzy } from "../SpecialMoves/Coop/SelfCoop";
import { FeralSwing, ShieldBreaker as ShieldBreaker, Rampage, UnstoppableCharge } from "../SpecialMoves/Singular/Offensive";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { HEALTH_INCREASE_AMOUNT, HEALTH_INCREASE_ENABLED, STAMINA_INCREASE_AMOUNT, STAMINA_INCREASE_ENABLED } from "../LogicFlags";

export class Vanguard extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: HEALTH_INCREASE_ENABLED ? 90 + HEALTH_INCREASE_AMOUNT : 90,
          attackPower: 35,
          defensePower: 10,
          stamina: STAMINA_INCREASE_ENABLED ? 25 + STAMINA_INCREASE_AMOUNT : 25,
          initiative: 6,
          movementSpeed: 5,
          range: 1,
          agility: 3,
          luck: 4,
        },
        position,
        [
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Crush, reaction: DamageReaction.NONE},
            {type: DamageType.Fire, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Ice, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Blight, reaction: DamageReaction.NONE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
          new UnstoppableCharge(),
          new FeralSwing(),
          new ShieldBreaker(),
          new Rampage(),

          // supers
          new SkySovereignsWrath(),
          new WhirlwindAttack(),
          new Frenzy(),
          new HellScream()
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