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

       it('true should be true', () => {
        expect(true).toBe(true);
       })
    
      it('skip turn costs only 0.5 actions', () => {
          expect(game.getCurrentTeam()).toBe(team1);
          game.nextTurn();
          expect(game.getCurrentTeam()).toBe(team2);
          game.nextTurn();
          expect(game.getCurrentTeam()).toBe(team1);
      });

      it('skipt turn costs 1 whenn only 1 combatant is alive', () => {
        
      });


      it('defend costs 1 action', () => {

      });

      it('team turn order starts from the next combatant who needs to act', () => {

      });


        // it('should handle round counting', () => {
        //   expect(game.getCurrentRound()).toBe(1);
        //   game.nextTurn(); // Team 2's turn
        //   expect(game.getCurrentRound()).toBe(1);
        //   game.nextTurn(); // Back to Team 1, new round
        //   expect(game.getCurrentRound()).toBe(2);
        // });
  });

 

 

  
});



