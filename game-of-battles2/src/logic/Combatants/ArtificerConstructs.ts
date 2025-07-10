import { Combatant } from "../Combatant";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { HEALTH_INCREASE_AMOUNT, HEALTH_INCREASE_ENABLED } from "../LogicFlags";
import { Position } from "../Position";
import { FlameCannon, IceCannon, ThunderDome, ArcBolt, SharpenalShell, ScorpionBolt, TeleportBlast } from "../SpecialMoves/Singular/Offensive";
import { GoOff } from "../SpecialMoves/Singular/Passives";
import { SelfDestruct } from "../SpecialMoves/Singular/Self";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";

export class Wall extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: HEALTH_INCREASE_ENABLED ? 50 + (HEALTH_INCREASE_AMOUNT / 2) : 50,
          stamina: 1,
          attackPower: 0,
          defensePower: 20,
          initiative: 0,
          movementSpeed: Number.NEGATIVE_INFINITY,
          range: 0,
          agility: 2,
          luck: 0,
        },
        position,
        [
            {type: DamageType.Crush, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Fire, reaction: DamageReaction.NONE},
            {type: DamageType.Ice, reaction: DamageReaction.NONE},
            {type: DamageType.Blight, reaction: DamageReaction.NONE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
            
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.Wall;
    }
  
    basicAttack(): Damage {
        return { amount: 0, type: DamageType.Unstoppable };
    }

    isConstruct(): boolean {
        return true;
    }

    isOrganic(): boolean {
        return false;
    }

    isExpendable(): boolean {
      return true;
    }
}


export class Bomb extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 25,
          stamina: 1,
          attackPower: 70,
          defensePower: 20,
          initiative: 1,
          movementSpeed: 3,
          range: 0,
          agility: 5,
          luck: 3,
        },
        position,
        [
            {type: DamageType.Crush, reaction: DamageReaction.NONE},
            {type: DamageType.Pierce, reaction: DamageReaction.NONE},
            {type: DamageType.Slash, reaction: DamageReaction.NONE},
            {type: DamageType.Fire, reaction: DamageReaction.NONE},
            {type: DamageType.Ice, reaction: DamageReaction.WEAKNESS},
            {type: DamageType.Blight, reaction: DamageReaction.NONE},
            {type: DamageType.Lightning, reaction: DamageReaction.NONE},
            {type: DamageType.Holy, reaction: DamageReaction.NONE},
            {type: DamageType.Dark, reaction: DamageReaction.NONE},
        ],
        [
            new GoOff(),
            new SelfDestruct(),
            new TeleportBlast(),
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.Bomb;
    }
  
    basicAttack(): Damage {
        return { amount: 0, type: DamageType.Unstoppable };
    }

    isConstruct(): boolean {
        return true;
    }

    isOrganic(): boolean {
      return false;
    }

    isExpendable(): boolean {
        return true;
    }
}

export class BabyBabel extends Combatant {
  constructor(name: string, position: Position, team: Team) {
    super(
      name,
      {
        hp: HEALTH_INCREASE_ENABLED ? 100 + HEALTH_INCREASE_AMOUNT : 100,
        stamina: 100,
        attackPower: 70,
        defensePower: 90, 
        initiative: 1,
        movementSpeed: Number.NEGATIVE_INFINITY,
        range: 3,
        agility: 5,
        luck: 3,
      },
      position,
      [
          {type: DamageType.Crush, reaction: DamageReaction.NONE},
          {type: DamageType.Pierce, reaction: DamageReaction.NONE},
          {type: DamageType.Slash, reaction: DamageReaction.NONE},
          {type: DamageType.Fire, reaction: DamageReaction.NONE},
          {type: DamageType.Ice, reaction: DamageReaction.NONE},
          {type: DamageType.Blight, reaction: DamageReaction.NONE},
          {type: DamageType.Lightning, reaction: DamageReaction.NONE},
          {type: DamageType.Holy, reaction: DamageReaction.NONE},
          {type: DamageType.Dark, reaction: DamageReaction.NONE},
      ],
      [
          new FlameCannon(),
          new IceCannon(),
          new ThunderDome(),
          new SharpenalShell(),
      ],
    team);
  }

    getCombatantType(): CombatantType {
        return CombatantType.BabyBabel;
    }

    basicAttack(): Damage {
        return { amount: 0, type: DamageType.Unstoppable };
    }

    isConstruct(): boolean {
        return true;
    }

    isOrganic(): boolean {
      return false;
    }

    isExpendable(): boolean {
        return true;
    }
}

export class BallistaTurret extends Combatant {
  constructor(name: string, position: Position, team: Team) {
    super(
      name,
      {
        hp: HEALTH_INCREASE_ENABLED ? 65 + (HEALTH_INCREASE_AMOUNT / 2) : 65,
        stamina: 30,
        attackPower: 80,
        defensePower: 50,
        initiative: 1,
        movementSpeed: Number.NEGATIVE_INFINITY,
        range: 6,
        agility: 6,
        luck: 3,
      },
      position,
      [
          {type: DamageType.Crush, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Pierce, reaction: DamageReaction.NONE},
          {type: DamageType.Slash, reaction: DamageReaction.NONE},
          {type: DamageType.Fire, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Ice, reaction: DamageReaction.NONE},
          {type: DamageType.Blight, reaction: DamageReaction.NONE},
          {type: DamageType.Lightning, reaction: DamageReaction.NONE},
          {type: DamageType.Holy, reaction: DamageReaction.NONE},
          {type: DamageType.Dark, reaction: DamageReaction.NONE},
      ],
      [
          new ArcBolt(),
          new ScorpionBolt()
      ],
    team);
  }

    getCombatantType(): CombatantType {
        return CombatantType.BallistaTurret;
    }

    basicAttack(): Damage {
        return { amount: 25, type: DamageType.Pierce };
    }

    isConstruct(): boolean {
        return true;
    }

    isOrganic(): boolean {
      return false;
    }

    isExpendable(): boolean {
        return true;
    }
}