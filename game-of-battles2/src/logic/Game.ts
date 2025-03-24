import { Board } from "./Board";
import { Combatant } from "./Combatant";
import { Team } from "./Team";

export class Game {
    private currentTeamIndex: number = 0;
    private currentCombatantIndex: number = 0;
    private actionsRemaining: number = 0;
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

    getActionsRemaining(): number {
      return this.actionsRemaining;
    }
  
    nextTurn(turnCost: number = 0.5): void {

        this.actionsRemaining -= turnCost;
        if (this.actionsRemaining <= 0) {
          this.currentTeamIndex = 1 - this.currentTeamIndex;
          this.actionsRemaining = this.teams[this.currentTeamIndex].combatants.length;
        }

        // pick next combatant
        const aliveCombatants = this.teams[this.currentTeamIndex].getAliveCombatants();
        if(this.currentCombatantIndex < aliveCombatants.length - 1) {
          this.currentCombatantIndex++;
        } else {
          this.currentCombatantIndex = 0;
        }
        
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