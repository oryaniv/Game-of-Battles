

  // board.ts
import { Combatant } from "./Combatant";
import { Position } from "./Position";
import { RangeCalculator } from "./RangeCalculator";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType } from "./SpecialMove";
import { StatusEffectType } from "./StatusEffect";

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
      alert("invalid position " + position.x + " " + position.y);
    }
  }

  placeCombatantWherePossible(combatant: Combatant, newPosition: Position): void {
    const possiblePositions = [
      {x: newPosition.x - 1, y: newPosition.y},
      {x: newPosition.x + 1, y: newPosition.y},
      {x: newPosition.x, y: newPosition.y - 1},
      {x: newPosition.x, y: newPosition.y + 1},
    ].filter(position => this.isValidPosition(position))
     .filter(position => this.isPositionEmpty(position));


    const closestPositionToCombatant = possiblePositions.reduce((closest, position) => {
      const distance = this.getDistanceBetweenPositions(combatant.position, position);
      const closestDistance = this.getDistanceBetweenPositions(combatant.position, closest);
      return distance < closestDistance ? position : closest;
    }, possiblePositions[0]);
    
    this.placeCombatant(combatant, closestPositionToCombatant);
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

  getVisibleCombatantAtPosition(position: Position, teamIndex: number): Combatant | null {
    const combatant = this.getCombatantAtPosition(position);
    if(!combatant) return null;
    if(!combatant.isCloaked()) return combatant;
    if(combatant.team.index === teamIndex) return combatant;
    return null;
  }

  isPositionEmpty(position: Position): boolean {
    return this.grid[position.y][position.x] === null;
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
          if (
            this.isValidPosition(neighbor) && 
            // !this.getCombatantAtPosition(neighbor)
            !this.getVisibleCombatantAtPosition(neighbor, combatant.team.index)
          ) 
          {
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
    range: SpecialMoveAlignment): Position[] {
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

  getMovingAttackEndPosition(caster: Combatant, targetPosition: Position, maxDistance: number): Position {
    // Get all positions adjacent to target
    const adjacentPositions = [
      { x: targetPosition.x, y: targetPosition.y - 1 }, // Up
      { x: targetPosition.x, y: targetPosition.y + 1 }, // Down 
      { x: targetPosition.x - 1, y: targetPosition.y }, // Left
      { x: targetPosition.x + 1, y: targetPosition.y }, // Right
    ];

    // Filter to only valid unoccupied positions
    const validPositions = adjacentPositions.filter(pos => 
      this.isValidPosition(pos) && !this.getCombatantAtPosition(pos)
    );

    if (validPositions.length === 0) {
      return caster.position; // Return current position if no valid spots
    }

    // Find position closest to caster
    return validPositions.reduce((closest, current) => {
      const currentDist = this.getDistanceBetweenPositions(caster.position, current);
      const closestDist = this.getDistanceBetweenPositions(caster.position, closest);
      return currentDist < closestDist ? current : closest;
    });
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
  

  getDistanceBetweenPositions(position1: Position, position2: Position): number {
    return Math.abs(position1.x - position2.x) + Math.abs(position1.y - position2.y);
  }

  hasLineOfSight(position1: Position, position2: Position, combatant?: Combatant): boolean {
    const inStraightLine = checkInStraightLine(position1, position2);
    return inStraightLine && this.nothingInTheWayBetween(position1, position2, combatant);

    function checkInStraightLine(position1: Position, position2: Position): boolean {
      return position1.x === position2.x || position1.y === position2.y;
    }
  }

  nothingInTheWayBetween(position1: Position, position2: Position, combatant?: Combatant): boolean {
    if(position1.x === position2.x){
      const minY = Math.min(position1.y, position2.y);
      const maxY = Math.max(position1.y, position2.y);
      for(let y = minY + 1; y < maxY; y++){
        const target = this.getCombatantAtPosition({x: position1.x, y});
        if(target && target.name !== combatant?.name){
          return false;
        }
      }
      return true;
    }

    if(position1.y === position2.y){
      const minX = Math.min(position1.x, position2.x);
      const maxX = Math.max(position1.x, position2.x);
      for(let x = minX + 1; x < maxX; x++){
        const target = this.getCombatantAtPosition({x, y: position1.y});
        if(target && target.name !== combatant?.name){
          return false;
        }
      }
      return true;
    }

    return false;
  }

  isCoveredFromEnemy(position: Position, enemy: Combatant): boolean {
     const isYAxisCover = Math.abs(position.x - enemy.position.x) < Math.abs(position.y - enemy.position.y);
     if(isYAxisCover){
      for(let i=0; i < this.width; i++){
        const currentEnemyCheckPosition = {x: i, y: enemy.position.y};
        if(this.hasLineOfSight(position, currentEnemyCheckPosition)){
          return false;
        }
      }
     } else {
      for(let i=0; i < this.height; i++){
        const currentEnemyCheckPosition = {x: enemy.position.x, y: i};
        if(this.hasLineOfSight(position, currentEnemyCheckPosition)){
          return false;
        }
      }
     }
     return true;
  }

  isPositionBetweenPositions(position1: Position, position2: Position, position3: Position): boolean {
    // Check if points are collinear (in a straight line)
    if (position1.x === position2.x) {
      // Vertical line
      return position3.x === position1.x && 
             position3.y >= Math.min(position1.y, position2.y) &&
             position3.y <= Math.max(position1.y, position2.y);
    }
    
    if (position1.y === position2.y) {
      // Horizontal line  
      return position3.y === position1.y &&
             position3.x >= Math.min(position1.x, position2.x) &&
             position3.x <= Math.max(position1.x, position2.x);
    }

    return false;
  }

  getPushResult(caster: Combatant, target: Combatant, range: number){
    const pushResult = this.rangeCalculator.getPushResult(caster, target, range, this);
    return pushResult;
  }

  getPullResult(caster: Combatant, target: Combatant, range: number){
    const pullResult = this.rangeCalculator.getPullResult(caster, target, range, this);
    return pullResult;
  }

  isFlanked(combatant: Combatant): boolean {
    const adjacentCombatants = this.getAdjacentCombatants(combatant, 1);
    return adjacentCombatants.filter(c => c.team.getName() !== combatant.team.getName()).length > 1;
  }

  isInMeleeRange(caster: Combatant, target: Combatant): boolean {
    return this.rangeCalculator.areInMeleeRange(caster, target);
  }

}