

  // board.ts
import { Combatant } from "./Combatant";
import { Position } from "./Position";
import { RangeCalculator } from "./RangeCalculator";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType } from "./SpecialMove";

export class Board {
  private grid: (Combatant | null)[][];
  private rangeCalculator: RangeCalculator;

  constructor(public width: number, public height: number) {
    this.grid = Array(height)
      .fill(null)
      .map(() => Array(width).fill(null));
    this.rangeCalculator = new RangeCalculator();
  }

  placeCombatant(combatant: Combatant, position: Position): void {
    if (this.isValidPosition(position)) {
      this.grid[position.y][position.x] = combatant;
      combatant.position = position;
    } else {
      // console.error("Invalid position");
    }
  }

  removeCombatant(combatant: Combatant): void {
    const position = combatant.position;
    if (this.isValidPosition(position)) {
      this.grid[position.y][position.x] = null;
    }
  }

  getAllCombatants(): Combatant[] {
    return this.grid.flat().filter((combatant) => combatant !== null) as Combatant[];
  }

  getCombatantAtPosition(position: Position): Combatant | null {
    if (this.isValidPosition(position)) {
      return this.grid[position.y][position.x];
    }
    return null;
  }

  

  private hasEnemy(combatant: Combatant, position: Position): boolean {
    const target = this.getCombatantAtPosition(position);
    return !!target && target.team.getName() !== combatant.team.getName();
  }

  // note how this is only straight line attacks, for now
  getValidAttacks(combatant: Combatant): Position[] {
    return this.rangeCalculator.getValidTargetPositions(combatant, 
      {
           type: SpecialMoveRangeType.Straight,
           align: SpecialMoveAlignment.Enemy,
           areaOfEffect: SpecialMoveAreaOfEffect.Single,
           range: combatant.stats.range
      }, this);
  }

  getValidMoves(combatant: Combatant): Position[] {
    const validMoves: Position[] = [];
    const { x, y } = combatant.position;
    const speed = combatant.stats.movementSpeed;

    const visited: { [key: string]: boolean } = {}; // Track visited positions
    const queue: { position: Position; distance: number }[] = [{ position: { x, y }, distance: 0 }];

    while (queue.length > 0) {
      const { position, distance } = queue.shift()!;
      const { x: currentX, y: currentY } = position;
      const key = `${currentX},${currentY}`;

      if (visited[key]) {
        continue;
      }
      visited[key] = true;

      if (distance > 0) {
        validMoves.push(position);
      }

      if (distance < speed) {
        const neighbors = [
          { x: currentX, y: currentY - 1 }, // Up
          { x: currentX, y: currentY + 1 }, // Down
          { x: currentX - 1, y: currentY }, // Left
          { x: currentX + 1, y: currentY }, // Right
        ];

        neighbors.forEach((neighbor) => {
          if (this.isValidPosition(neighbor) && !this.getCombatantAtPosition(neighbor)) {
            queue.push({ position: neighbor, distance: distance + 1 });
          }
        });
      }
    }

    return validMoves;
  }

  getValidTargetsForSkill(combatant: Combatant, skillRange: SpecialMoveRange): Position[] {
    const validTargets =  this.rangeCalculator.getValidTargetPositions(combatant, skillRange, this);
    return validTargets;
  }

  getAreaOfEffectPositions(caster: Combatant,
    targetPosition: Position,
    aoe: SpecialMoveAreaOfEffect,
    range: number): Position[] {
    const validTargets =  this.rangeCalculator.getAreaOfEffectPositions(caster, targetPosition, aoe, range, this);
    return validTargets;
  }

  getChainTargets(
    caster: Combatant,
    targetPosition: Position,
    jumps: number,
    jumpRange: number): Position[] {
    const validTargets =  this.rangeCalculator.getChainTargets(caster, targetPosition, jumps, jumpRange, this);
    return validTargets;
  }

  isValidPosition(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.width &&
      position.y >= 0 &&
      position.y < this.height
    );
  }

  isValidMove(from: Position, to: Position, maxDistance: number): boolean {
    const dx = Math.abs(to.x - from.x);
      const dy = Math.abs(to.y - from.y);
      const distance = dx + dy;

      if(distance > maxDistance){
          return false;
      }

      if(dx > 0 && dy > 0){
          return false;
      }

      if(!this.isValidPosition(to)){
          return false;
      }

      if(this.getCombatantAtPosition(to)){
          return false;
      }
      return true;
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