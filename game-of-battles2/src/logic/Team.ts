import { Combatant } from "./Combatant";
import { AIAgent } from "./AI/AIAgent";

export class Team {
    public combatants: Combatant[] = [];
    public turnOrderIndex: number = 0;
    constructor(public name: string, public index: number, public aiAgent: AIAgent | undefined = undefined) {}

    addCombatant(combatant: Combatant) {
        this.combatants.push(combatant);
        if(this.aiAgent) {
            combatant.insertAiAgent(this.aiAgent);
        }
        this.combatants.sort((a, b) => b.stats.initiative - a.stats.initiative);
    }

    getName(): string {
        return this.name;
    }

    getIndex(): number {
        return this.index;
    }

    getTurnOrderIndex(): number {
        return this.turnOrderIndex;
    }

    setTurnOrderIndex(index: number) {
        this.turnOrderIndex = index;
    }
  
    getAverageInitiative(): number {
      if (this.combatants.length === 0) return 0;
      const totalInitiative = this.combatants.reduce(
        (sum, combatant) => sum + combatant.stats.initiative,
        0
      );
      return totalInitiative / this.combatants.length;
    }
  
    isDefeated(): boolean {
      return this.combatants.filter((combatant) => !combatant.isExpendable())
                            .every((combatant) => combatant.isKnockedOut());
    }
  
    getAliveCombatants(): Combatant[] {
      return this.combatants.filter(combatant => !combatant.isKnockedOut())
    }

    rotateCombatants(): void {
        if (this.combatants.length <= 1) return;
        const firstCombatant = this.combatants.shift();
        if (firstCombatant) {
            this.combatants.push(firstCombatant);
        }
    }

    updateStatusEffects(): void {
        this.combatants.forEach((combatant) => {
            combatant.updateStatusEffects();
        });
    }

    isHumanPlayerTeam(): boolean {
        return this.aiAgent === undefined;
    }

  }