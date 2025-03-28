import { ActionResult } from "./attackResult";
import { Board } from "./Board";
import { Combatant } from "./Combatant";
import { CombatMaster } from "./CombatMaster";
import { Position } from "./Position";
import { Team } from "./Team";

export class Game {
    private currentTeamIndex: number = 0;
    private currentCombatantIndex: number = 0;
    private actionsRemaining: number = 0;
    private roundCount: number = 1;
    private combatMaster: CombatMaster;

    public getRoundCount(): number {
      return this.roundCount;
    }

    public getCurrentTeamIndex(): number {
        return this.currentTeamIndex;
    }

    constructor(
      public teams: Team[],
      public board: Board
    ) {
      this.setupCombatants();
      this.determineStartingTeam();
      this.actionsRemaining = this.teams[this.currentTeamIndex].combatants.length;
      this.combatMaster = new CombatMaster();
    }
  
    private setupCombatants(): void {
      this.teams.forEach((team, teamIndex) => {
        team.combatants.forEach((combatant, combatantIndex) => {
          this.board.placeCombatant(combatant, combatant.position);
        });
      });
    }
  
    private determineStartingTeam(): void {
      if (this.teams.length === 2) {
        if (this.teams[0].getAverageInitiative() < this.teams[1].getAverageInitiative()) {
          this.currentTeamIndex = 1;
        }
      }
    }
  
    getCurrentCombatant(): Combatant {
      const aliveCombatants = this.teams[this.currentTeamIndex].getAliveCombatants();
      return aliveCombatants[this.currentCombatantIndex];
    }

    getCurrentTeam(): Team {
      return this.teams[this.currentTeamIndex];
    }

    getActionsRemaining(): number {
      return this.actionsRemaining;
    }

    executeAttack(attacker: Combatant, position: Position, board: Board): ActionResult {
      const actionResult = this.combatMaster.executeAttack(attacker, position, board);
      this.actionsRemaining -= actionResult.cost;
      return actionResult;
    }
    
    executeDefend(): void {
      const currentCombatant = this.getCurrentCombatant();
      this.combatMaster.defend(currentCombatant);
      this.actionsRemaining -= 1;
    }

    executeSkipTurn(): void {
      this.actionsRemaining -= (this.getCurrentTeam().getAliveCombatants().length === 1 ? 1 : 0.5);
    }
  
    nextTurn(): void {
      if(this.isGameOver()) {
        return;
      }

      // next team
      if (this.actionsRemaining <= 0) {
          this.currentTeamIndex = 1 - this.currentTeamIndex;
          this.actionsRemaining = this.teams[this.currentTeamIndex].getAliveCombatants().length;
          // next round
          if (this.currentTeamIndex === 0) {
            this.nextRound();
          }
        }

        // pick next combatant
        const aliveCombatants = this.teams[this.currentTeamIndex].getAliveCombatants();
        if(this.currentCombatantIndex < aliveCombatants.length - 1) {
          this.currentCombatantIndex++;
        } else {
          this.currentCombatantIndex = 0;
        }
        // this.teams[this.currentTeamIndex].rotateCombatants();
        this.getCurrentCombatant().startTurn();
    }

    nextRound(): void {
      this.roundCount++;
    }

    getCurrentRound(): number {
      return this.roundCount;
    }

    updateStatusEffects(): void {
      this.teams.forEach((team) => {
        team.combatants.forEach((combatant) => {
          combatant.updateStatusEffects(this.roundCount);
        });
      });
    }
  
    isGameOver(): boolean {
      return this.teams.some((team) => team.isDefeated());
    }
  
    getWinner(): Team | null {
      if (this.isGameOver()) {
        return this.teams.find((team) => !team.isDefeated()) || null;
      }
      return null;
    }
  }