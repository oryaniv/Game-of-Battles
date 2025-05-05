import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Board } from '../../src/logic/Board';
import { Combatant } from '../../src/logic/Combatant';
import { Position } from '@/logic/Position';
import { DamageReaction, DamageType } from '@/logic/Damage';
import { Militia } from '@/logic/Combatants/Militia';
import { Team } from '@/logic/Team';
import { Game } from '@/logic/Game';
import { StatusEffectType } from '@/logic/StatusEffect';
import { CombatMaster } from '@/logic/CombatMaster';
import { AttackResult } from '@/logic/attackResult';
import { theATeam, theBTeam } from '@/boardSetups';
import { RookieAIAgent, ToddlerAIAgent, KidAIAgent, TeenagerAIAgent } from '@/logic/AI/DeterministicAgents';

let errorCount = 0;
describe('RoboArenta', () => {

    it('Ai Agent match 1', () => {
        let roundCounts = [];
        for(let i = 0; i < 100; i++) {
            const roundCount = exampleMatch();
            roundCounts.push(roundCount);
        }
        console.log(`round count average is ${roundCounts.reduce((a, b) => a + b, 0) / roundCounts.length}`);
        console.log(`error count is ${errorCount}`);
            expect(true).toBe(true);
    });
    
    
});

function exampleMatch() {
    const team1 = new Team('Team 1', 0, new RookieAIAgent());
    const team2 = new Team('Team 2', 1, new RookieAIAgent());
    let board = new Board(10, 10);
    
    theATeam(team1);
    theBTeam(team2);
    const game = new Game([team1, team2], board);

    try {
        while(!game.isGameOver()) {
            const currentCombatant = game.getCurrentCombatant();
            currentCombatant.getAiAgent()?.playTurn(currentCombatant, game, board);
            game.nextTurn();
            const deadCombatants = board.getAllCombatants().filter((combatant) => combatant.stats.hp <= 0);
                deadCombatants.forEach((combatant) => {
                board.removeCombatant(combatant);
            });
        }
    } catch (error) {
        errorCount++;
        console.log('an Error was thrown', error);
    }
    
    const winner = game.getWinner();
    console.log(`%cwinning team is ${winner?.getName()}`, 'color: red');
    return game.getRoundCount();
}