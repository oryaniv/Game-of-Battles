import { ActionResult, getStandardActionResult } from "./attackResult";
import { Board } from "./Board";
import { Combatant } from "./Combatant";
import { CombatMaster } from "./CombatMaster";
import { Damage } from "./Damage";
import { Position } from "./Position";
import { SpecialMove } from "./SpecialMove";
import { StatusEffectHook } from "./StatusEffect";
import { getResultsForStatusEffectHook } from "./StatusEffect";
import { Team } from "./Team";
import { emitter } from '../eventBus';
import { EventLogger } from '../eventLogger';

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
      
      const eventLogger = EventLogger.getInstance();
      eventLogger.logEvent(`Round ${this.roundCount} begins`);
      eventLogger.addBreak();
      eventLogger.logEvent(`${this.teams[this.currentTeamIndex].name}'s Turn`);
      eventLogger.logEvent(`${this.getCurrentCombatant().name} the ${this.getCurrentCombatant().getCombatantType()} acts`);
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
      // return aliveCombatants[this.currentCombatantIndex];
      const turnOrderIndex = this.teams[this.currentTeamIndex].getTurnOrderIndex();
      if(turnOrderIndex >= aliveCombatants.length) {
        this.teams[this.currentTeamIndex].setTurnOrderIndex(aliveCombatants.length - 1);
      }
      return aliveCombatants[this.teams[this.currentTeamIndex].getTurnOrderIndex()];
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
      const eventLogger = EventLogger.getInstance();
      eventLogger.logEvent(`${attacker.name} uses basic attack`);
      const damage = attacker.basicAttack();
      const actionResult = this.executeAttack(attacker, position, board, damage);
      this.spendActionPoints(actionResult.cost);
      return actionResult;
    }

    executeSkill(skill: SpecialMove, invoker: Combatant, target: Position, board: Board): ActionResult[] {
      if(!skill.effect) {
        return [getStandardActionResult()]; 
      }
      const eventLogger = EventLogger.getInstance();
      eventLogger.logEvent(`${invoker.name} uses ${skill.name}`);
      invoker.stats.stamina -= skill.cost;
      getResultsForStatusEffectHook(invoker, StatusEffectHook.OnSkillUsed);
      const actionResult: ActionResult | ActionResult[] = skill.effect(invoker, target, board); 
      let maxCost:number = 0;
      if(Array.isArray(actionResult)) {
        maxCost = this.determineCostOfManyActions(actionResult);
      } else {
        maxCost = actionResult.cost;
      }
      this.spendActionPoints(maxCost);
      return Array.isArray(actionResult) ? actionResult : [actionResult];
    }
    
    executeDefend(): void {
      const currentCombatant = this.getCurrentCombatant();
      this.combatMaster.defend(currentCombatant);
      const eventLogger = EventLogger.getInstance();
      eventLogger.logEvent(`${currentCombatant.name} defends`);
      this.spendActionPoints(1);
    }

    executeSkipTurn(): void {
      const eventLogger = EventLogger.getInstance();
      const currentCombatant = this.getCurrentCombatant();
      eventLogger.logEvent(`${currentCombatant.name}  skips their turn`);
      this.spendActionPoints(currentCombatant.hasMoved || this.getCurrentTeam().getAliveCombatants().length === 1 ? 1 : 0.5);
      //this.spendActionPoints(this.getCurrentTeam().getAliveCombatants().length === 1 ? 1 : 0.5);
    }

    executePassTurn(): void {
      this.spendActionPoints(1);
    }

    spendActionPoints(amount: number): void {
      this.actionsRemaining -= amount;
    }
  
    nextTurn(): void {

      // end turn hook application
      const turnEndHookResults: ActionResult[] = this.getCurrentCombatant()?.endTurn(this.board);
      if(turnEndHookResults && turnEndHookResults.length > 0) {
        const cost = this.determineCostOfManyActions(turnEndHookResults);
        if(cost !== 0) {
          this.spendActionPoints(cost);
        }
      }

      // if game over, return
      if(this.isGameOver()) {
        const eventLogger = EventLogger.getInstance();
        eventLogger.logEvent(`Game Over`);
        return;
      }

      // should we switch teams?
      if (this.actionsRemaining <= 0) {
        // pick next combatant from current playing team
          
          this.teamNextCombatant();
          this.nextTeam();
          
          // not just next turn, but also next round
          if (this.currentTeamIndex === 0) {
            this.nextRound();
          }
        } else {
          this.teamNextCombatant();
        }

        const currentCombatant = this.getCurrentCombatant();

        // start turn hook application
        const turnStartHookResults: ActionResult[] = currentCombatant?.startTurn();
        if(turnStartHookResults && turnStartHookResults.length > 0) {
          const cost = this.determineCostOfManyActions(turnStartHookResults);
          if(cost !== 0) {
            this.spendActionPoints(cost);
            this.nextTurn();
          }
        }
    }

    private nextTeam(): void {
      this.currentTeamIndex = 1 - this.currentTeamIndex;
      this.actionsRemaining = this.teams[this.currentTeamIndex].getAliveCombatants().length;
      const eventLogger = EventLogger.getInstance();
      eventLogger.addBreak();
      eventLogger.logEvent(`${this.getCurrentTeam().name}'s Turn`);
    }

    private teamNextCombatant(): void {
      const aliveCombatants = this.teams[this.currentTeamIndex].getAliveCombatants();
      if(this.teams[this.currentTeamIndex].getTurnOrderIndex() < aliveCombatants.length - 1) {
        this.teams[this.currentTeamIndex].setTurnOrderIndex(this.teams[this.currentTeamIndex].getTurnOrderIndex() + 1);
      } else {
        this.teams[this.currentTeamIndex].setTurnOrderIndex(0);
      }
    }

    nextRound(): void {
      this.roundCount++;
      const eventLogger = EventLogger.getInstance();
      eventLogger.addBreak();
      eventLogger.logEvent(`Round ${this.roundCount} begins`);
      eventLogger.addBreak();
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

    determineCostOfManyActions(actions: ActionResult[]): number {
      if(actions.length === 0) {
        return 0;
      }
      if(actions.some((action) => action.cost === 2)) {
        return 2;
      } else if(actions.some((action) => action.cost === 0.5)) {
        return 0.5;
      } else if(actions.some((action) => action.cost === 0)) {
        return 0;
      } else if(actions.some((action) => action.cost === -1)) {
        return -1;
      }
      return 1;
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

    getLoser(): Team | null {
      if (this.isGameOver()) {
        return this.teams.find((team) => team.isDefeated()) || null;
      }
      return null;
    } 
  }