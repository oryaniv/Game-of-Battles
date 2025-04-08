import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Board } from '../../src/logic/Board';
import { Combatant } from '../../src/logic/Combatant';
import { Position } from '@/logic/Position';
import { DamageType } from '@/logic/Damage';
import { Militia } from '@/logic/Combatants/Militia';
import { Team } from '@/logic/Team';
import { Game } from '@/logic/Game';

describe('Game suite', () => {
  let game: Game;
  let team1: Team;
  let team2: Team;
  let board: Board;
  let militia1: Militia;
  let militia2: Militia;

  beforeEach(() => {
    board = new Board(5, 5);
    team1 = new Team('Team 1', 0);
    team2 = new Team('Team 2', 1);
    militia1 = new Militia('Fighter 1', { x: 0, y: 0 }, team1);
    militia2 = new Militia('Fighter 2', { x: 4, y: 4 }, team2);

    team1.addCombatant(militia1);
    team2.addCombatant(militia2);

    board.placeCombatant(militia1, militia1.position);
    board.placeCombatant(militia2, militia2.position);

    game = new Game([team1, team2], board);
  });

  function addCombatant(team: Team, position: Position, name: string) {
    const militia = new Militia(name, position, team);
    team.addCombatant(militia);
    board.placeCombatant(militia, militia.position);
  }

  describe('basic tests', () => {
      it('should initialize with correct teams and board', () => {
        expect(game.teams).toHaveLength(2);
        expect(game.teams[0]).toBe(team1);
        expect(game.teams[1]).toBe(team2);
        expect(game.board).toBe(board);
      });

      it('should detect when game is over', () => {
        expect(true).toBe(true);
        expect(game.isGameOver()).toBe(false);
        
        militia1.stats.hp = 0;
        expect(game.isGameOver()).toBe(true);
        expect(game.getWinner()).toBe(team2);
      });
  })

  describe('Game turn order', () => {
    
      it('skip turn costs only 0.5 actions', () => {
          addCombatant(team1, { x: 0, y: 0 }, 'Fighter 3');

          expect(game.getCurrentTeam()).toBe(team1);
          game.executeSkipTurn();
          game.nextTurn();
          expect(game.getCurrentTeam()).toBe(team1);
          game.executeSkipTurn();
          game.nextTurn();
          expect(game.getCurrentTeam()).toBe(team2);
      });

      it('skipt turn costs 1 when only 1 combatant is alive', () => {
        expect(game.getCurrentTeam()).toBe(team1);
        game.executeSkipTurn();
        game.nextTurn();
        expect(game.getCurrentTeam()).toBe(team2);
        game.executeSkipTurn();
        game.nextTurn();
        expect(game.getCurrentTeam()).toBe(team1);
      });


      it('defend costs 1 action', () => {
        addCombatant(team1, { x: 0, y: 0 }, 'Fighter 3');

        expect(game.getCurrentTeam()).toBe(team1);
        game.executeDefend();
        game.nextTurn();
        expect(game.getCurrentTeam()).toBe(team2);
        game.executeDefend();
        game.nextTurn();
        expect(game.getCurrentTeam()).toBe(team1);
      });

      it('team turn order starts from the next combatant who needs to act', () => {
        addCombatant(team1, { x: 5, y: 5 }, 'Fighter 3');
        addCombatant(team1, { x: 6, y: 6 }, 'Fighter 4');
        addCombatant(team2, { x: 7, y: 7 }, 'Fighter 5');
        addCombatant(team2, { x: 8, y: 8 }, 'Fighter 6');

        // do team 1 turns
        game.executeDefend();
        game.nextTurn();

        game.executeSkipTurn();
        game.nextTurn();

        game.executeDefend();
        game.nextTurn();
        
        game.executeSkipTurn();
        game.nextTurn();

        expect(game.getCurrentTeam()).toBe(team2);

         // do team 2 turns
        game.executeDefend();
        game.nextTurn();

        game.executeDefend();
        game.nextTurn();

        game.executeDefend();
        game.nextTurn();

        expect(game.getCurrentTeam()).toBe(team1);

        expect(game.getCurrentCombatant().name).toBe('Fighter 3');
      });


        it('should handle round counting', () => {
          expect(game.getCurrentRound()).toBe(1);
          game.executeSkipTurn();
          game.nextTurn(); // Team 2's turn
          expect(game.getCurrentRound()).toBe(1);
          game.executeSkipTurn();
          game.nextTurn(); // Back to Team 1, new round
          expect(game.getCurrentRound()).toBe(2);
        });

        it('combatants lose defend mode when their turn start', () => {
          // set up initial state
          const combatant1 = game.getCurrentCombatant();
          const combatant2 = team2.combatants[0];

          // have both combatants defend
          game.executeDefend();
          game.nextTurn();
          game.executeDefend();

          // verify both are defending
          expect(combatant1.isDefending()).toBe(true);
          expect(combatant2.isDefending()).toBe(true);

          // start next round
          game.nextTurn();

          // verify first combatant is no longer defending but second still is
          expect(combatant1.isDefending()).toBe(false);
          expect(combatant2.isDefending()).toBe(true);

          // next turn
          game.executeSkipTurn();
          game.nextTurn();

          // verify second combatant is no longer defending
          expect(combatant2.isDefending()).toBe(false);
          
        });
  });

  describe('Game status effects test', () => {
    it('status effects are removed after certain amount of rounds', () => {
      
    });

    it('status effects are removed after their own conditions are met', () => {
      
    });
  });

  describe('turn cost tests', () => {
    it('turn cost is according the the correct rules', () => {
      
    });
  });

  describe('execute attack tests', () => {
    
  });


  
});



