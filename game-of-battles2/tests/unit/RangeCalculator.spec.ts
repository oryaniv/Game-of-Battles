import { describe, it, expect, beforeEach } from '@jest/globals';
import { RangeCalculator } from '../../src/logic/RangeCalculator';
import { Position } from '../../src/logic/Position';
import { Board } from '../../src/logic/Board';
import { Militia } from '../../src/logic/Combatants/Militia';
import { Team } from '../../src/logic/Team';
import { SpecialMoveRange, SpecialMoveRangeType, SpecialMoveAlignment, SpecialMoveAreaOfEffect } from '../../src/logic/SpecialMove';

describe('RangeCalculator', () => {
  let rangeCalculator: RangeCalculator;
  let board: Board;
  let team1: Team;
  let team2: Team;

  beforeEach(() => {
    rangeCalculator = new RangeCalculator();
    board = new Board(10, 10); // Create a 10x10 board
    team1 = new Team('Test Team1', 0);
    team2 = new Team('Test Team2', 1);
  });

  it('Straight line test, find enemies', () => {
    const caster = new Militia('Test Fighter', { x: 5, y: 5 }, team1);

    const target1 = new Militia('Test Fighter', { x: 7, y: 5 }, team2);
    const target2 = new Militia('Test Fighter', { x: 5, y: 7 }, team2);
    const target3 = new Militia('Test Fighter', { x: 5, y: 3 }, team2);
    const target4 = new Militia('Test Fighter', { x: 3, y: 5 }, team2);

    const target5 = new Militia('Test Fighter', { x: 9, y: 5 }, team2);
    board.placeCombatant(caster, caster.position);
    board.placeCombatant(target1, target1.position);
    board.placeCombatant(target2, target2.position);
    board.placeCombatant(target3, target3.position);
    board.placeCombatant(target4, target4.position);
    board.placeCombatant(target5, target5.position);

    const range: SpecialMoveRange = {
      type: SpecialMoveRangeType.Straight,
      align: SpecialMoveAlignment.Enemy,
      areaOfEffect: SpecialMoveAreaOfEffect.Single,
      range: 5
    };
    const validPositions = rangeCalculator.getValidTargetPositions(caster, range, board);
    

    expect(validPositions).toHaveLength(4);
    expect(validPositions).toContainEqual({ x: 7, y: 5 });
    expect(validPositions).toContainEqual({ x: 5, y: 7 });
    expect(validPositions).toContainEqual({ x: 5, y: 3 });
    expect(validPositions).toContainEqual({ x: 7, y: 5 });
  });


  it('should return positions within larger range', () => {
    const caster = new Militia('Test Fighter', { x: 5, y: 5 }, team1);

    const target1 = new Militia('Test Fighter', { x: 3, y: 6 }, team2);
    const target2 = new Militia('Test Fighter', { x: 8, y: 5 }, team2);
    const target3 = new Militia('Test Fighter', { x: 5, y: 2 }, team2);
    const target4 = new Militia('Test Fighter', { x: 5, y: 7 }, team2);

    board.placeCombatant(caster, caster.position);
    board.placeCombatant(target1, target1.position);
    board.placeCombatant(target2, target2.position);
    board.placeCombatant(target3, target3.position);
    board.placeCombatant(target4, target4.position);

    const range: SpecialMoveRange = {
      type: SpecialMoveRangeType.Straight,
      align: SpecialMoveAlignment.Enemy,
      areaOfEffect: SpecialMoveAreaOfEffect.Single,
      range: 2
    };
    const validPositions = rangeCalculator.getValidTargetPositions(caster, range, board);
    
    // Should include positions up to two steps away

    expect(validPositions).toHaveLength(1);
    expect(validPositions).toContainEqual({ x: 5, y: 7 });
  });

  it('should return positions for curve range type', () => {
    const caster = new Militia('Test Fighter', { x: 5, y: 5 }, team1);

    const target1 = new Militia('Test Fighter', { x: 4, y: 4 }, team2);
    const target2 = new Militia('Test Fighter', { x: 6, y: 4 }, team2);
    const target3 = new Militia('Test Fighter', { x: 4, y: 6 }, team2);
    const target4 = new Militia('Test Fighter', { x: 6, y: 6 }, team2);

    board.placeCombatant(caster, caster.position);
    board.placeCombatant(target1, target1.position);
    board.placeCombatant(target2, target2.position);
    board.placeCombatant(target3, target3.position);
    board.placeCombatant(target4, target4.position);

    const range: SpecialMoveRange = {
      type: SpecialMoveRangeType.Curve,
      align: SpecialMoveAlignment.Enemy,
      areaOfEffect: SpecialMoveAreaOfEffect.Single,
      range: 2
    };
    const validPositions = rangeCalculator.getValidTargetPositions(caster, range, board);

    expect(validPositions).toHaveLength(4);
    expect(validPositions).toContainEqual({ x: 4, y: 4 });
    expect(validPositions).toContainEqual({ x: 6, y: 4 });
    expect(validPositions).toContainEqual({ x: 4, y: 6 });
    expect(validPositions).toContainEqual({ x: 6, y: 6 });
  });

  it('should return positions for AOE targeting', () => {
    const caster = new Militia('Test Fighter', { x: 5, y: 5 }, team1);

    board.placeCombatant(caster, caster.position);

    const range: SpecialMoveRange = {
      type: SpecialMoveRangeType.Straight,
      align: SpecialMoveAlignment.Enemy,
      areaOfEffect: SpecialMoveAreaOfEffect.Nova,
      range: 3
    };
    const validPositions = rangeCalculator.getValidTargetPositions(caster, range, board);

    // Should include empty positions since it's AOE
    expect(validPositions.length).toBeGreaterThan(0);
    expect(validPositions).toContainEqual({ x: 5, y: 4 });
    expect(validPositions).toContainEqual({ x: 5, y: 6 });
    expect(validPositions).toContainEqual({ x: 4, y: 5 });
    expect(validPositions).toContainEqual({ x: 6, y: 5 });
  });


  it('self skills target only self', () => {
    const caster = new Militia('Test Fighter', { x: 5, y: 5 }, team1);
    const ally = new Militia('Ally Fighter', { x: 6, y: 5 }, team1);
    const enemy = new Militia('Enemy Fighter', { x: 4, y: 5 }, team2);

    board.placeCombatant(caster, caster.position);
    board.placeCombatant(ally, ally.position);
    board.placeCombatant(enemy, enemy.position);

    const range: SpecialMoveRange = {
      type: SpecialMoveRangeType.Self,
      align: SpecialMoveAlignment.Self,
      areaOfEffect: SpecialMoveAreaOfEffect.Single,
      range: 5 // Range should be ignored for self targeting
    };

    const validPositions = rangeCalculator.getValidTargetPositions(caster, range, board);

    expect(validPositions).toHaveLength(1);
    expect(validPositions).toContainEqual(caster.position);

  });

  it('melee skills target only in melee no matter the range', () => {
    const caster = new Militia('Test Fighter', { x: 5, y: 5 }, team1);
    const adjacentEnemy = new Militia('Enemy Fighter', { x: 6, y: 5 }, team2);
    const farEnemy = new Militia('Far Enemy', { x: 7, y: 5 }, team2);

    board.placeCombatant(caster, caster.position);
    board.placeCombatant(adjacentEnemy, adjacentEnemy.position);
    board.placeCombatant(farEnemy, farEnemy.position);

    const range: SpecialMoveRange = {
      type: SpecialMoveRangeType.Melee,
      align: SpecialMoveAlignment.Enemy,
      areaOfEffect: SpecialMoveAreaOfEffect.Single,
      range: 5 // Range should be ignored for melee targeting
    };

    const validPositions = rangeCalculator.getValidTargetPositions(caster, range, board);

    expect(validPositions).toHaveLength(1);
    expect(validPositions).toContainEqual(adjacentEnemy.position);
    expect(validPositions).not.toContainEqual(farEnemy.position);
  });

  it('ally skills only target allies', () => {
    const caster = new Militia('Test Fighter', { x: 5, y: 5 }, team1);
    const ally = new Militia('Ally Fighter', { x: 6, y: 5 }, team1);
    const enemy = new Militia('Enemy Fighter', { x: 4, y: 5 }, team2);

    board.placeCombatant(caster, caster.position);
    board.placeCombatant(ally, ally.position);
    board.placeCombatant(enemy, enemy.position);

    const range: SpecialMoveRange = {
      type: SpecialMoveRangeType.Straight,
      align: SpecialMoveAlignment.Ally,
      areaOfEffect: SpecialMoveAreaOfEffect.Single,
      range: 3
    };

    const validPositions = rangeCalculator.getValidTargetPositions(caster, range, board);

    expect(validPositions).toHaveLength(1);
    expect(validPositions).toContainEqual(ally.position);
    expect(validPositions).not.toContainEqual(enemy.position);
    expect(validPositions).not.toContainEqual(caster.position);
  });

  it('ally and self skills also target the self', () => {
    const caster = new Militia('Test Fighter', { x: 5, y: 5 }, team1);
    const ally = new Militia('Ally Fighter', { x: 6, y: 5 }, team1);
    const enemy = new Militia('Enemy Fighter', { x: 4, y: 5 }, team2);

    board.placeCombatant(caster, caster.position);
    board.placeCombatant(ally, ally.position);
    board.placeCombatant(enemy, enemy.position);

    const range: SpecialMoveRange = {
      type: SpecialMoveRangeType.Straight,
      align: SpecialMoveAlignment.SelfAndAlly,
      areaOfEffect: SpecialMoveAreaOfEffect.Single,
      range: 3
    };

    const validPositions = rangeCalculator.getValidTargetPositions(caster, range, board);

    expect(validPositions).toHaveLength(2);
    expect(validPositions).toContainEqual(ally.position);
    expect(validPositions).toContainEqual(caster.position);
    expect(validPositions).not.toContainEqual(enemy.position);
    expect(true).toBe(true);
  });
});






