import { Combatant } from "../Combatant";
import { Damage, DamageReaction } from "../Damage";
import { DamageType } from "../Damage";
import { Position } from "../Position";
import { Team } from "../Team";
import { CombatantType } from "./CombatantType";
import { AlwaysByHit, AlwaysBeCrit, AlwaysBlock } from "../SpecialMoves/Singular/Passives";


export class NormalTarget extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 10,
          stamina: 1,
          attackPower: 0,
          defensePower: 20,
          initiative: 0,
          movementSpeed: Number.NEGATIVE_INFINITY,
          range: 0,
          agility: 10,
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
            new AlwaysByHit(),
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.NormalTarget;
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

export class CritTarget extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 20,
          stamina: 1,
          attackPower: 0,
          defensePower: 20,
          initiative: 0,
          movementSpeed: Number.NEGATIVE_INFINITY,
          range: 0,
          agility: 10,
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
            new AlwaysBeCrit(),
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.CritTarget;
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


export class BlockTarget extends Combatant {
    constructor(name: string, position: Position, team: Team) {
      super(
        name,
        {
          hp: 20,
          stamina: 1,
          attackPower: 0,
          defensePower: 20,
          initiative: 0,
          movementSpeed: Number.NEGATIVE_INFINITY,
          range: 0,
          agility: 10,
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
            new AlwaysBlock(),
        ],
      team);
    }

    getCombatantType(): CombatantType {
        return CombatantType.BlockTarget;
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

export class IceTarget extends Combatant {
  constructor(name: string, position: Position, team: Team) {
    super(
      name,
      {
        hp: 25,
        stamina: 1,
        attackPower: 0,
        defensePower: 20,
        initiative: 0,
        movementSpeed: Number.NEGATIVE_INFINITY,
        range: 0,
        agility: 10,
        luck: 0,
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
          new AlwaysByHit(),
      ],
    team);
  }

  getCombatantType(): CombatantType {
      return CombatantType.IceTarget;
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

export class FireTarget extends Combatant {
  constructor(name: string, position: Position, team: Team) {
    super(
      name,
      {
        hp: 25,
        stamina: 1,
        attackPower: 0,
        defensePower: 20,
        initiative: 0,
        movementSpeed: Number.NEGATIVE_INFINITY,
        range: 0,
        agility: 10,
        luck: 0,
      },
      position,
      [
          {type: DamageType.Crush, reaction: DamageReaction.NONE},
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
          new AlwaysByHit(),
      ],
    team);
  }

  getCombatantType(): CombatantType {
      return CombatantType.FireTarget;
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


export class LightningTarget extends Combatant {
  constructor(name: string, position: Position, team: Team) {
    super(
      name,
      {
        hp: 25,
        stamina: 1,
        attackPower: 0,
        defensePower: 20,
        initiative: 0,
        movementSpeed: Number.NEGATIVE_INFINITY,
        range: 0,
        agility: 10,
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
          {type: DamageType.Lightning, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Holy, reaction: DamageReaction.NONE},
          {type: DamageType.Dark, reaction: DamageReaction.NONE},
      ],
      [
          new AlwaysByHit(),
      ],
    team);
  }

  getCombatantType(): CombatantType {
      return CombatantType.LightningTarget;
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

export class BlightTarget extends Combatant {
  constructor(name: string, position: Position, team: Team) {
    super(
      name,
      {
        hp: 25,
        stamina: 1,
        attackPower: 0,
        defensePower: 20,
        initiative: 0,
        movementSpeed: Number.NEGATIVE_INFINITY,
        range: 0,
        agility: 10,
        luck: 0,
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
          {type: DamageType.Holy, reaction: DamageReaction.NONE},
          {type: DamageType.Dark, reaction: DamageReaction.NONE},
      ],
      [
          new AlwaysByHit(),
      ],
    team);
  }

  getCombatantType(): CombatantType {
      return CombatantType.BlightTarget;
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

export class PierceTarget extends Combatant {
  constructor(name: string, position: Position, team: Team) {
    super(
      name,
      {
        hp: 25,
        stamina: 1,
        attackPower: 0,
        defensePower: 20,
        initiative: 0,
        movementSpeed: Number.NEGATIVE_INFINITY,
        range: 0,
        agility: 10,
        luck: 0,
      },
      position,
      [
          {type: DamageType.Crush, reaction: DamageReaction.NONE},
          {type: DamageType.Pierce, reaction: DamageReaction.WEAKNESS},
          {type: DamageType.Slash, reaction: DamageReaction.NONE},
          {type: DamageType.Fire, reaction: DamageReaction.NONE},
          {type: DamageType.Ice, reaction: DamageReaction.NONE},
          {type: DamageType.Blight, reaction: DamageReaction.NONE},
          {type: DamageType.Lightning, reaction: DamageReaction.NONE},
          {type: DamageType.Holy, reaction: DamageReaction.NONE},
          {type: DamageType.Dark, reaction: DamageReaction.NONE},
      ],
      [
          new AlwaysByHit(),
      ],
    team);
  }

  getCombatantType(): CombatantType {
      return CombatantType.PierceTarget;
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
