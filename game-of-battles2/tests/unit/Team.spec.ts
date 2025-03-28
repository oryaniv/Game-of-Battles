import { Team } from '../../src/logic/Team';
import { Combatant } from '../../src/logic/Combatant';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { Militia } from '../../src/logic/Combatants/Militia';
import { Position } from '../../src/logic/Position';

describe('Team', () => {
  let team: Team;

  beforeEach(() => {
    team = new Team('Test Team', 1);
  });

  it('should create a team with name and index', () => {
    expect(team.getName()).toBe('Test Team');
    expect(team.getIndex()).toBe(1);
  });

  it('should add combatants to the team', () => {
    const combatant = new Militia('Test Fighter', { x: 0, y: 0 }, team);
    team.addCombatant(combatant);
    expect(team.combatants).toContain(combatant);
  });

  it('should calculate average initiative correctly', () => {
    const combatant1 = new Militia('Test Fighter', { x: 0, y: 0 }, team);
    const combatant2 = new Militia('Test Fighter', { x: 1, y: 0 }, team);
    combatant1.stats.initiative = 10;
    combatant2.stats.initiative = 20;
    
    team.addCombatant(combatant1);
    team.addCombatant(combatant2);

    expect(team.getAverageInitiative()).toBe(15);
  });

  it('should return 0 for average initiative when team is empty', () => {
    expect(team.getAverageInitiative()).toBe(0);
  });

  it('should check if team is defeated', () => {
    const combatant1 = new Militia('Test Fighter', { x: 0, y: 0 }, team);
    const combatant2 = new Militia('Test Fighter', { x: 1, y: 0 }, team);
    
    team.addCombatant(combatant1);
    team.addCombatant(combatant2);

    expect(team.isDefeated()).toBe(false);

    combatant1.stats.hp = 0;
    combatant2.stats.hp = 0;

    expect(team.isDefeated()).toBe(true);
  });

  it('should get alive combatants', () => {
    const combatant1 = new Militia('Test Fighter', { x: 0, y: 0 }, team);
    const combatant2 = new Militia('Test Fighter', { x: 1, y: 0 }, team);
    const combatant3 = new Militia('Test Fighter', { x: 2, y: 0 }, team);
    
    combatant2.stats.hp = 0;

    team.addCombatant(combatant1);
    team.addCombatant(combatant2);
    team.addCombatant(combatant3);

    const aliveCombatants = team.getAliveCombatants();
    expect(aliveCombatants).toHaveLength(2);
    expect(aliveCombatants).toContain(combatant1);
    expect(aliveCombatants).toContain(combatant3);
    expect(aliveCombatants).not.toContain(combatant2);
  });

  it('should rotate combatants', () => {
    const combatant1 = new Militia('Test Fighter', { x: 0, y: 0 }, team);
    const combatant2 = new Militia('Test Fighter', { x: 1, y: 0 }, team);
    const combatant3 = new Militia('Test Fighter', { x: 2, y: 0 }, team);

    team.addCombatant(combatant1);
    team.addCombatant(combatant2);
    team.addCombatant(combatant3);

    team.rotateCombatants();

    expect(team.combatants[0]).toBe(combatant2);
    expect(team.combatants[1]).toBe(combatant3);
    expect(team.combatants[2]).toBe(combatant1);
  });

  it('should not rotate with single combatant', () => {
    const combatant1 = new Militia('Test Fighter', { x: 0, y: 0 }, team);
    team.addCombatant(combatant1);

    team.rotateCombatants();

    expect(team.combatants[0]).toBe(combatant1);
    expect(team.combatants).toHaveLength(1);
  });
});
