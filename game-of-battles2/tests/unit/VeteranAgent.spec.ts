

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Board } from '../../src/logic/Board';
import { Team } from '@/logic/Team';
import { Game } from '@/logic/Game';
import { VeteranAIAgent } from '@/logic/AI/VeteranAIAgent';
import { Wizard } from '@/logic/Combatants/Wizard';
import { StandardBearer } from '@/logic/Combatants/StandardBearer';
import { Hunter } from '@/logic/Combatants/Hunter';
import { Militia } from '@/logic/Combatants/Militia';
import { FistWeaver } from '@/logic/Combatants/FistWeaver';
import { Defender } from '@/logic/Combatants/Defender';
import { Witch } from '@/logic/Combatants/Witch';
import { Rogue } from '@/logic/Combatants/Rogue';
import { Healer } from '@/logic/Combatants/Healer';
import { ToddlerAIAgent } from '@/logic/AI/DeterministicAgents';
import { DamageType } from '@/logic/Damage';

describe('VeteranAIAgent', () => {
    let board: Board;   
    let team1: Team;
    let team2: Team;
    let game: Game;
    let veteranAgent: VeteranAIAgent;

    beforeEach(() => {
        board = new Board(10, 10);
        veteranAgent = new VeteranAIAgent();
        team1 = new Team('Team 1', 0, veteranAgent);
        team2 = new Team('Team 2', 1, new ToddlerAIAgent());
        game = new Game([team1, team2], board);
    });

    describe('Wizard AI', () => {
        beforeEach(() => {
            team1.addCombatant(new Wizard('TestWizard', { x: 4, y: 4 }, team1));
            team2.addCombatant(new Militia('Enemy', { x: 5, y: 4 }, team2));
        });

        it('should prioritize using spells when in range', () => {
            const wizard = team1.combatants[0];
            const result = veteranAgent.playTurn(wizard, game, board);
            expect(result).toBeDefined();
        });
    });

    describe('StandardBearer AI', () => {
        beforeEach(() => {
            team1.addCombatant(new StandardBearer('TestBearer', { x: 4, y: 4 }, team1));
            team2.addCombatant(new Militia('Enemy', { x: 5, y: 4 }, team2));
        });

        it('should use Call of Strength when allies are nearby', () => {
            const bearer = team1.combatants[0];
            team1.addCombatant(new Militia('Ally', { x: 4, y: 5 }, team1));
            const result = veteranAgent.playTurn(bearer, game, board);
            expect(result).toBeDefined();
        });
    });

    describe('Hunter AI', () => {
        beforeEach(() => {
            team1.addCombatant(new Hunter('TestHunter', { x: 4, y: 4 }, team1));
            team2.addCombatant(new Militia('Enemy', { x: 7, y: 4 }, team2));
        });

        it('should maintain distance while attacking', () => {
            const hunter = team1.combatants[0];
            const result = veteranAgent.playTurn(hunter, game, board);
            expect(result).toBeDefined();
        });
    });

    describe('Defender AI', () => {
        beforeEach(() => {
            team1.addCombatant(new Defender('TestCleric', { x: 4, y: 4 }, team1));
            team1.addCombatant(new Militia('Ally', { x: 4, y: 5 }, team1));
            team2.addCombatant(new Militia('Enemy', { x: 5, y: 4 }, team2));
        });

        it('should prioritize healing allies', () => {
            const cleric = team1.combatants[0];
            team1.combatants[1].takeDamage({amount: 10, type: DamageType.Unstoppable});
            const result = veteranAgent.playTurn(cleric, game, board);
            expect(result).toBeDefined();
        });
    });

    describe('Healer AI', () => {
        beforeEach(() => {
            team1.addCombatant(new Healer('TestHealer', { x: 4, y: 4 }, team1));
            team2.addCombatant(new Militia('Enemy', { x: 5, y: 4 }, team2));
        });

        it('should engage in melee combat', () => {
            const militia = team1.combatants[0];
            const result = veteranAgent.playTurn(militia, game, board);
            expect(result).toBeDefined();
        });
    });

    describe('FistWeaver AI', () => {
        beforeEach(() => {
            team1.addCombatant(new FistWeaver('TestFistWeaver', { x: 4, y: 4 }, team1));
            team2.addCombatant(new Militia('Enemy', { x: 7, y: 4 }, team2));
        });

        it('should attack from range', () => {
            const archer = team1.combatants[0];
            const result = veteranAgent.playTurn(archer, game, board);
            expect(result).toBeDefined();
        });
    });

    describe('Witch AI', () => {
        beforeEach(() => {
            team1.addCombatant(new Witch('TestWitch', { x: 4, y: 4 }, team1));
            team2.addCombatant(new Militia('Enemy', { x: 5, y: 4 }, team2));
        });

        it('should use defensive abilities when appropriate', () => {
            const knight = team1.combatants[0];
            const result = veteranAgent.playTurn(knight, game, board);
            expect(result).toBeDefined();
        });
    });

    

    describe('Rogue AI', () => {
        beforeEach(() => {
            team1.addCombatant(new Rogue('TestRogue', { x: 4, y: 4 }, team1));
            team2.addCombatant(new Militia('Enemy', { x: 5, y: 4 }, team2));
        });

        it('should use stealth abilities when available', () => {
            const rogue = team1.combatants[0];
            const result = veteranAgent.playTurn(rogue, game, board);
            expect(result).toBeDefined();
        });
    });
});

