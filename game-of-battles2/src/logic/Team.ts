import { Combatant } from "./Combatant";

export class Team {
    constructor(public name: string, public combatants: Combatant[]) {}
  
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