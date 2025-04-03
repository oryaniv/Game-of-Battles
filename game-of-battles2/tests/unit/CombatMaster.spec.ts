import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Board } from '../../src/logic/Board';
import { Combatant } from '../../src/logic/Combatant';
import { Position } from '@/logic/Position';
import { DamageType } from '@/logic/Damage';
import { Militia } from '@/logic/Combatants/Militia';
import { Team } from '@/logic/Team';
import { Game } from '@/logic/Game';

import { CombatMaster } from '@/logic/CombatMaster';

describe('CombatMaster', () => {
  let combatMaster: CombatMaster;
  let attacker: Militia;
  let defender: Militia;
  let team1: Team;
  let team2: Team;

  beforeEach(() => {
    team1 = new Team('Team 1', 1);
    team2 = new Team('Team 2', 2);
    attacker = new Militia('Attacker', { x: 0, y: 0 }, team1);
    defender = new Militia('Defender', { x: 1, y: 0 }, team2);
    combatMaster = CombatMaster.getInstance(); //new CombatMaster();
  });

  it('aaa',() => {
    expect(true).toBe(true);
  })

//   it('should calculate basic attack damage', () => {
//     const result = combatMaster.resolveAttack(attacker, defender);
//     expect(result.damage).toBeGreaterThan(0);
//     expect(result.hit).toBe(true);
//   });

//   it('should apply damage to defender', () => {
//     const initialHp = defender.stats.hp;
//     const result = combatMaster.resolveAttack(attacker, defender);
//     expect(defender.stats.hp).toBeLessThan(initialHp);
//   });

//   it('should handle defending status', () => {
//     defender.defend();
//     const result = combatMaster.resolveAttack(attacker, defender);
//     expect(result.damage).toBeLessThan(attacker.basicAttack().amount);
//   });

//   it('should handle knockouts', () => {
//     defender.stats.hp = 1;
//     const result = combatMaster.resolveAttack(attacker, defender);
//     expect(defender.isKnockedOut()).toBe(true);
//     expect(result.knockout).toBe(true);
//   });

//   it('should not allow knocked out combatants to attack', () => {
//     attacker.stats.hp = 0;
//     const result = combatMaster.resolveAttack(attacker, defender);
//     expect(result.hit).toBe(false);
//     expect(result.damage).toBe(0);
//   });
});
