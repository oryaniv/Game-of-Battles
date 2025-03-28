import { Team } from '../../src/logic/Team';
import { Combatant } from '../../src/logic/Combatant';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Militia } from '../../src/logic/Combatants/Militia';
import { Position } from '../../src/logic/Position';
import { Board } from '@/logic/Board';


describe('Combatant - Militia', () => {
  let team: Team;
  let combatant: Militia;

  beforeEach(() => {
    team = new Team('Test Team', 1);
    combatant = new Militia('Test Fighter', { x: 0, y: 0 }, team);
    team.addCombatant(combatant);
  });

  it('should initialize with correct stats', () => {
    // expect(combatant.stats.hp).toBe(15);
    expect(combatant.stats.attackPower).toBe(10);
    expect(combatant.stats.defensePower).toBe(10);
    expect(combatant.stats.stamina).toBe(20);
    expect(combatant.stats.initiative).toBe(4);
    expect(combatant.stats.movementSpeed).toBe(3);
    expect(combatant.stats.range).toBe(1);
    expect(combatant.stats.agility).toBe(8);
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

  it('should handle special moves when none exist', () => {
    const result = combatant.useSpecialMove(combatant, 'NonexistentMove');
    expect(result).toBeNull();
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
