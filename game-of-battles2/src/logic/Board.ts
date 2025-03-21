

  // board.ts
import { Combatant } from "./Combatant";
import { Position } from "./Position";

export class Board {
  private grid: (Combatant | null)[][];

  constructor(public width: number, public height: number) {
    this.grid = Array(height)
      .fill(null)
      .map(() => Array(width).fill(null));
  }

  placeCombatant(combatant: Combatant, position: Position): void {
    if (this.isValidPosition(position)) {
      this.grid[position.y][position.x] = combatant;
      combatant.position = position;
    } else {
      console.error("Invalid position");
    }
  }

  getCombatantAtPosition(position: Position): Combatant | null {
    if (this.isValidPosition(position)) {
      return this.grid[position.y][position.x];
    }
    return null;
  }

  isValidPosition(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.width &&
      position.y >= 0 &&
      position.y < this.height
    );
  }

  isValidMove(from: Position, to: Position, speed: number): boolean {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const distance = dx + dy;

    if (!this.isValidPosition(to)) {
      return false;
    }

    if (distance > speed) {
      return false;
    }

    if(this.getCombatantAtPosition(to) !== null){
      return false;
    }

    return true;
  }

  removeCombatant(combatant: Combatant): void {
    const position = combatant.position;
    if (this.isValidPosition(position)) {
      this.grid[position.y][position.x] = null;
    }
  }

  getAdjacentCombatants(combatant:Combatant, range:number): Combatant[] {
    const adjacent: Combatant[] = [];
    for(let y = combatant.position.y - range; y <= combatant.position.y + range; y++){
      for(let x = combatant.position.x - range; x <= combatant.position.x + range; x++){
        if(x === combatant.position.x && y === combatant.position.y) continue;

        const pos : Position = {x,y};
        const target = this.getCombatantAtPosition(pos)
        if(target){
          adjacent.push(target);
        }
      }
    }

    return adjacent;
  }

}