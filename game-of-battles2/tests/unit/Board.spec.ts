import { describe, it, expect, beforeEach, jest, xit } from '@jest/globals';
import { Board } from '../../src/logic/Board';
import { Combatant } from '../../src/logic/Combatant';
import { Position } from '@/logic/Position';
import { DamageType } from '@/logic/Damage';
import { Militia } from '@/logic/Combatants/Militia';
import { Team } from '@/logic/Team';

describe('Board', () => {
  let board: Board;
  let team1: Team;
  let team2: Team;
  let combatant1: Militia;
  let combatant2: Militia;

  beforeEach(() => {
    board = new Board(5, 5);
    team1 = new Team('Team 1', 1);
    team2 = new Team('Team 2', 2);
    combatant1 = new Militia('Fighter 1', { x: 0, y: 0 }, team1);
    combatant2 = new Militia('Fighter 2', { x: 2, y: 2 }, team2);
  });

  it('should create a board with correct dimensions', () => {
    expect(board.width).toBe(5);
    expect(board.height).toBe(5);
  });

  it('should place combatant at valid position', () => {
    const position: Position = { x: 1, y: 1 };
    board.placeCombatant(combatant1, position);
    expect(board.getCombatantAtPosition(position)).toBe(combatant1);
    expect(combatant1.position).toEqual(position);
  });

  it('should remove combatant from position', () => {
    const position: Position = { x: 1, y: 1 };
    board.placeCombatant(combatant1, position);
    board.removeCombatant(combatant1);
    expect(board.getCombatantAtPosition(position)).toBeNull();
  });

  it('should get valid attack positions', () => {
    // Place attacker
    board.placeCombatant(combatant1, { x: 2, y: 2 });
    
    // Place potential targets
    const enemy1 = new Militia('Enemy 1', { x: 2, y: 1 }, team2);
    const enemy2 = new Militia('Enemy 2', { x: 2, y: 3 }, team2);
    const ally = new Militia('Ally', { x: 3, y: 2 }, team1);
    
    board.placeCombatant(enemy1, enemy1.position);
    board.placeCombatant(enemy2, enemy2.position);
    board.placeCombatant(ally, ally.position);

    const validAttacks = board.getValidAttacks(combatant1);

    expect(validAttacks).toHaveLength(2);
    expect(validAttacks).toContainEqual({ x: 2, y: 1 });
    expect(validAttacks).toContainEqual({ x: 2, y: 3 });
  });

  it('should not return invalid positions as attack targets', () => {
    board.placeCombatant(combatant1, { x: 0, y: 0 });
    const validAttacks = board.getValidAttacks(combatant1);
    expect(validAttacks).toHaveLength(0);
  });

  // it('should not allow placement outside board boundaries', () => {
  //   const invalidPosition: Position = { x: 10, y: 10 };
  //   const consoleSpy = jest.spyOn(console, 'error');
    
  //   board.placeCombatant(combatant1, invalidPosition);
    
  //   expect(consoleSpy).toHaveBeenCalledWith('Invalid position');
  //   expect(board.getCombatantAtPosition(invalidPosition)).toBeNull();
    
  //   consoleSpy.mockRestore();
  // });
});
