import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { HEALTH_INCREASE_AMOUNT, HEALTH_INCREASE_ENABLED, STAMINA_INCREASE_AMOUNT, STAMINA_INCREASE_ENABLED, STAT_BUFF_INCREASE_ENABLED } from "../LogicFlags";
import { Position } from "../Position";
import { LightningKicks, MoonBeam } from "../SpecialMoves/Coop/OffensiveCoop";
import { IdaiNoHadou } from "../SpecialMoves/Coop/SelfCoop";
import { SwappingGale } from "../SpecialMoves/Coop/SupportCoop";
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
          hp: HEALTH_INCREASE_ENABLED ? 75 + HEALTH_INCREASE_AMOUNT : 75,
          stamina: STAMINA_INCREASE_ENABLED ? 35 + STAMINA_INCREASE_AMOUNT : 35,
          attackPower: STAT_BUFF_INCREASE_ENABLED ? 80 : 25,
          defensePower: STAT_BUFF_INCREASE_ENABLED ? 60 : 15,
          initiative: 5,
          movementSpeed: 4,
          range: 1,
          agility: STAT_BUFF_INCREASE_ENABLED ? 9 : 7,
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
          new Riposte(),

          // supers
          new SwappingGale(),
          new MoonBeam(),
          new LightningKicks(),
          new IdaiNoHadou()
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