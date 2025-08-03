import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { HEALTH_INCREASE_AMOUNT, HEALTH_INCREASE_ENABLED, STAMINA_INCREASE_AMOUNT, STAMINA_INCREASE_ENABLED, STAT_BUFF_INCREASE_ENABLED } from "../LogicFlags";
import { Position } from "../Position";
import { BlowAKiss, CircusDiabolique, StandUpComedyGoneWrong } from "../SpecialMoves/Coop/AilmentCoop";
import { NastyNastyDolly } from "../SpecialMoves/Coop/SelfCoop";
import { LookeyHere, SmellIt, StupidestCrapEver, YoMama } from "../SpecialMoves/Singular/Ailments";
import { Decoy, FoolsLuck, SurpriseBoom } from "../SpecialMoves/Singular/Passives";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";


export class Fool extends Combatant {
    constructor(name: string, position: Position, team: Team) {
        super(
          name,
          {
            hp: HEALTH_INCREASE_ENABLED ? 50 + HEALTH_INCREASE_AMOUNT : 50,
            stamina: STAMINA_INCREASE_ENABLED ? 40 + STAMINA_INCREASE_AMOUNT : 40,
            attackPower: STAT_BUFF_INCREASE_ENABLED ? 1 : 1,
            defensePower: STAT_BUFF_INCREASE_ENABLED ? 40 : 10,
            initiative: 4,
            movementSpeed: 4,
            range: 2,
            agility: 7,
            luck: STAT_BUFF_INCREASE_ENABLED ? -15 : 10,
          },
          position,
          [
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Crush, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Fire, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Ice, reaction: DamageReaction.RESISTANCE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
          ],
          [
            new YoMama(),
            new StupidestCrapEver(),
            new SmellIt(),
            new LookeyHere(),
            new FoolsLuck(),

            // supers
            new NastyNastyDolly(),
            new BlowAKiss(),
            new StandUpComedyGoneWrong(),
            new CircusDiabolique(),
            
          ], team
        );
      }

      getCombatantType(): CombatantType {
        return CombatantType.Fool;
      }

      basicAttack(): Damage {
        return { amount: 1, type: DamageType.Unstoppable };
      }
}

export class Doll extends Combatant {
  constructor(name: string, position: Position, team: Team) {
    super(
      name,
      {
        hp: 10,
        stamina: 0,
        attackPower: 15,
        defensePower: 0,
        
        initiative: 1,
        movementSpeed: Number.NEGATIVE_INFINITY,
        range: 1,
        agility: 5,
        luck: 10,
      },
      position,
      [
        {type: DamageType.Slash, reaction: DamageReaction.NONE},
        {type: DamageType.Pierce, reaction: DamageReaction.NONE},
        {type: DamageType.Crush, reaction: DamageReaction.NONE},
        {type: DamageType.Fire, reaction: DamageReaction.NONE},
        {type: DamageType.Ice, reaction: DamageReaction.NONE},
        {type: DamageType.Lightning, reaction: DamageReaction.NONE},
        {type: DamageType.Blight, reaction: DamageReaction.NONE},
        {type: DamageType.Holy, reaction: DamageReaction.NONE},
        {type: DamageType.Dark, reaction: DamageReaction.NONE},
      ],
      [
        new SurpriseBoom(),
        new Decoy(),
        
      ], team
    );
  }

  getCombatantType(): CombatantType {
    return CombatantType.Doll;
  }

  isExpendable(): boolean {
    return true;
  }

  isConstruct(): boolean {
    return true;
  }

  isOrganic(): boolean {
    return false;
  }

  basicAttack(): Damage {
    return { amount: 1, type: DamageType.Unstoppable };
  }
}


const foolLogo = 
{
  'general': 'a game logo shaped as the head of A chaotic female trickster - flamboyant, colorful, and jovial',
  'size': '500x500',
  'colors': `white, black, and gold`,
  'background': 'none, transparent',
  'angle': '70 degrees to the left',
  'head-details': {
    'hair': {
      style: 'pigtails',
      pigtails: [
        {color: 'blonde'},
        {color: 'raven-black'}
      ]
    },
    'face-makeup': {
      'left-half': {
        'color': 'white'
      },
      'right-half': {
        'color': 'black'
      }
    },
    'eyes': {
      'left-eye': {
        'tattoo-painted-on-eye': 'black crescent moon.',
        'active': 'squinting'
      },
      'right-eye': {
        'color': 'blue',
        'tattoo-painted-on-eye': 'a black hexagon inside a white circle.',
        'action': 'open'
      },
    },
    'horns': {
      'left-horn': {
        'color': 'black'
      },
      'right-horn': {
        'color': 'gold'
      }
    },
    'mouth': 'lipstick-red, tender lips, closed, smiling mischeivously',
    'nose': 'small, straight, cute',
  }
}