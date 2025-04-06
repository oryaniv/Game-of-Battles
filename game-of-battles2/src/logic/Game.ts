import { ActionResult, getEmptyActionResult } from "./attackResult";
import { Board } from "./Board";
import { Combatant } from "./Combatant";
import { CombatMaster } from "./CombatMaster";
import { Damage } from "./Damage";
import { Position } from "./Position";
import { SpecialMove } from "./SpecialMove";
import { StatusEffectHook } from "./StatusEffect";
import { getResultsForStatusEffectHook } from "./StatusEffect";
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
      this.combatMaster = CombatMaster.getInstance(); // new CombatMaster();
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

    

    executeAttack(attacker: Combatant, position: Position, board: Board, damage?: Damage): ActionResult {
      damage = damage || attacker.basicAttack();
      const actionResult = this.combatMaster.executeAttack(attacker, position, board, damage);
      return actionResult;
    }

    executeBasicAttack(attacker: Combatant, position: Position, board: Board): ActionResult {
      const damage = attacker.basicAttack();
      const actionResult = this.executeAttack(attacker, position, board, damage);
      this.spendActionPoints(actionResult.cost);
      return actionResult;
    }

    executeSkill(skill: SpecialMove, invoker: Combatant, target: Position, board: Board): ActionResult[] {
      if(!skill.effect) {
        return [getEmptyActionResult()]; 
      }
      invoker.stats.stamina -= skill.cost;
      getResultsForStatusEffectHook(invoker, StatusEffectHook.OnSkillUsed);
      const actionResult: ActionResult | ActionResult[] = skill.effect(invoker, target, board); 
      let maxCost:number = 0;
      if(Array.isArray(actionResult)) {
        maxCost = actionResult.reduce((maxCost, result) => Math.max(maxCost, result.cost), 0);
      } else {
        maxCost = actionResult.cost;
      }
      this.spendActionPoints(maxCost);
      return Array.isArray(actionResult) ? actionResult : [actionResult];
    }
    
    executeDefend(): void {
      const currentCombatant = this.getCurrentCombatant();
      this.combatMaster.defend(currentCombatant);
      this.spendActionPoints(1);
    }

    executeSkipTurn(): void {
      this.spendActionPoints(this.getCurrentTeam().getAliveCombatants().length === 1 ? 1 : 0.5);
    }

    spendActionPoints(amount: number): void {
      this.actionsRemaining -= amount;
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

        const turnStartHookResults: ActionResult[] = this.getCurrentCombatant().startTurn();
        // // eslint-disable-next-line
        // debugger;
        if(turnStartHookResults.length > 0) {
            const mostRelevantResult = turnStartHookResults.reduce((mostRelevant, current) => {            
              return current.cost > mostRelevant.cost ? current : mostRelevant;
          }, turnStartHookResults[0]);
          
          if(mostRelevantResult.cost > 0) {
            this.spendActionPoints(mostRelevantResult.cost);
            this.nextTurn();
          }
        }
        
    }

    nextRound(): void {
      this.roundCount++;
      this.updateStatusEffects();
    }

    getCurrentRound(): number {
      return this.roundCount;
    }

    updateStatusEffects(): void {
      this.teams.forEach((team) => {
        team.combatants.forEach((combatant) => {
          combatant.updateStatusEffects();
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