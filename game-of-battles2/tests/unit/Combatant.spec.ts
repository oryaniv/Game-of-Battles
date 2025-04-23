import { Team } from '../../src/logic/Team';
import { Combatant } from '../../src/logic/Combatant';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Militia } from '../../src/logic/Combatants/Militia';
import { Position } from '../../src/logic/Position';
import { Board } from '@/logic/Board';
import { Defender } from '../../src/logic/Combatants/Defender';
import { Wizard } from '../../src/logic/Combatants/Wizard';
import { Hunter } from '../../src/logic/Combatants/Hunter';
import { Healer } from '../../src/logic/Combatants/Healer';


describe('Combatant - Militia', () => {
  let team: Team;
  let combatant: Militia;

  beforeEach(() => {
    team = new Team('Test Team', 1);
    combatant = new Militia('Test Fighter', { x: 0, y: 0 }, team);
    team.addCombatant(combatant);
  });

  it('should initialize with correct stats', () => {
    expect(combatant.stats.attackPower).toBe(10);
    expect(combatant.stats.defensePower).toBe(10);
    expect(combatant.stats.stamina).toBe(20);
    expect(combatant.stats.initiative).toBe(1);
    expect(combatant.stats.movementSpeed).toBe(3);
    expect(combatant.stats.range).toBe(1);
    expect(combatant.stats.agility).toBe(5);
    expect(combatant.stats.luck).toBe(3);
  });

  it('should perform basic attack', () => {
    const attack = combatant.basicAttack();
    expect(attack.amount).toBe(20);
  });

  it('should handle defending status', () => {
    expect(combatant.isDefending()).toBe(false);
    combatant.defend();
    expect(combatant.isDefending()).toBe(true);
  });

  it('should remove defending status at start of turn', () => {
    combatant.defend();
    expect(combatant.isDefending()).toBe(true);
    combatant.startTurn();
    expect(combatant.isDefending()).toBe(false);
  });

  it('should check if knocked out', () => {
    expect(combatant.isKnockedOut()).toBe(false);
    combatant.stats.hp = 0;
    expect(combatant.isKnockedOut()).toBe(true);
  });

  it('should take damage', () => {
    const initialHp = combatant.stats.hp;
    combatant.takeDamage(5);
    expect(combatant.stats.hp).toBe(initialHp - 5);
  });

  it('should update position when moving', () => {
    const newPosition: Position = { x: 1, y: 1 };
    const mockBoard = {
      removeCombatant: jest.fn(),
      placeCombatant: jest.fn()
    };
    
    combatant.move(newPosition, mockBoard as unknown as Board);
    
    expect(mockBoard.removeCombatant).toHaveBeenCalledWith(combatant);
    expect(mockBoard.placeCombatant).toHaveBeenCalledWith(combatant, newPosition);
  });
});


describe('Defender', () => {
  let defender: Defender;
  let team: Team;

  beforeEach(() => {
    team = new Team('Test Team', 0);
    defender = new Defender('Test Defender', { x: 0, y: 0 }, team);
  });


  it('should have correct special moves', () => {
    const moves = defender.getSpecialMoves();
    const moveNames = moves.map(move => move.name);
    expect(moveNames).toContain('Marching Defense');
    expect(moveNames).toContain('Blocking Stance');
    expect(moveNames).toContain('Defensive Strike');
  });
});

describe('Wizard', () => {
  let wizard: Wizard;
  let team: Team;

  beforeEach(() => {
    team = new Team('Test Team', 0);
    wizard = new Wizard('Test Wizard', { x: 0, y: 0 }, team);
  });


  it('should have correct special moves', () => {
    const moves = wizard.getSpecialMoves();
    const moveNames = moves.map(move => move.name);
    expect(moveNames).toContain('Fireball');
    expect(moveNames).toContain('Flame');
    expect(moveNames).toContain('Chain Lightning');
    expect(moveNames).toContain('Arcane Chanelling');
    expect(moveNames).toContain('Icicle');
    expect(moveNames).toContain('Frozen Burst');
  });
});

describe('Hunter', () => {
  let hunter: Hunter;
  let team: Team;

  beforeEach(() => {
    team = new Team('Test Team', 0);
    hunter = new Hunter('Test Hunter', { x: 0, y: 0 }, team);
  });


  it('should have correct special moves', () => {
    const moves = hunter.getSpecialMoves();
    const moveNames = moves.map(move => move.name);
    expect(moveNames).toContain('Focus Aim');
    expect(moveNames).toContain('Pin Down');
    expect(moveNames).toContain('Ricochet');
  });
});

describe('Healer', () => {
  let healer: Healer;
  let team: Team;

  beforeEach(() => {
    team = new Team('Test Team', 0);
    healer = new Healer('Test Healer', { x: 0, y: 0 }, team);
  });


  it('should have correct special moves', () => {
    const moves = healer.getSpecialMoves();
    const moveNames = moves.map(move => move.name);
    expect(moveNames).toContain('Heal');
    expect(moveNames).toContain('Purify');
    expect(moveNames).toContain('Sacred Flame');
    expect(moveNames).toContain('Purify');
  });
});

