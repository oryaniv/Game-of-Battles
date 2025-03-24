import { Combatant } from "./Combatant";

export class Team {
    public combatants: Combatant[] = [];
    constructor(public name: string, public index: number) {}

    addCombatant(combatant: Combatant) {
        this.combatants.push(combatant);
    }

    getName(): string {
        return this.name;
    }

    getIndex(): number {
        return this.index;
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
      return this.combatants.every((combatant) => combatant.isKnockedOut());
    }
  
    getAliveCombatants(): Combatant[] {
      return this.combatants.filter(combatant => !combatant.isKnockedOut())
    }
  }