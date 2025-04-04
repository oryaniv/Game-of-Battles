import { Board } from "./Board";
import { Combatant } from "./Combatant";
import { Position } from "./Position";
import { SpecialMoveAlignment, SpecialMoveAreaOfEffect, SpecialMoveRange, SpecialMoveRangeType } from "./SpecialMove";

export class RangeCalculator {

  getValidTargetPositions(
    caster: Combatant,
    range: SpecialMoveRange,
    board: Board
  ): Position[] {
    // eslint-disable-next-line
    // debugger;
    switch (range.type) {
      case SpecialMoveRangeType.Self:
        return this.getSelfTargetPositions(caster, board);
      case SpecialMoveRangeType.Melee:
        return this.getMeleeTargetPositions(caster, range.align, board);
      case SpecialMoveRangeType.Straight:
        return this.getStraightTargetPositions(caster, range, board);
      case SpecialMoveRangeType.Curve:
        return this.getCurveTargetPositions(caster, range, board);
      case SpecialMoveRangeType.None:
        return []; // No target required
      default:
        return [];
    }
  }

  private getSelfTargetPositions(caster: Combatant, board: Board): Position[] {
    return [caster.position];
  }

  private getMeleeTargetPositions(caster: Combatant, align: SpecialMoveAlignment, board: Board): Position[] {
    const targets: Position[] = [];
    const { x, y } = caster.position;

    const adjacentPositions = [
      { x: x, y: y - 1 },
      { x: x, y: y + 1 },
      { x: x - 1, y: y },
      { x: x + 1, y: y },
    ];

    adjacentPositions.forEach((pos) => {
      if (board.isValidPosition(pos)) {
        const target = board.getCombatantAtPosition(pos);
        if (target) {
          if (
            (align === SpecialMoveAlignment.Enemy && target.team !== caster.team) ||
            (align === SpecialMoveAlignment.Ally && target.team === caster.team) ||
            align === SpecialMoveAlignment.All
          ) {
            targets.push(pos);
          }
        }
      }
    });

    return targets;
  }

  private getStraightTargetPositions(
    caster: Combatant,
    range: SpecialMoveRange,
    board: Board
  ): Position[] {
    const targets: Position[] = [];
    const { x, y } = caster.position;
    const { align, range: maxRange } = range;

    const directions = [
      { dx: 0, dy: -1 }, // Up
      { dx: 0, dy: 1 },  // Down
      { dx: -1, dy: 0 }, // Left
      { dx: 1, dy: 0 },  // Right
    ];

    directions.forEach((dir) => {
      for (let i = 1; i <= maxRange; i++) {
        const targetPos = { x: x + dir.dx * i, y: y + dir.dy * i };

        if (!board.isValidPosition(targetPos)) {
          break; // Stop if out of bounds
        }

        const target = board.getCombatantAtPosition(targetPos);
        if (target) {
          if (
            (align === SpecialMoveAlignment.Enemy && target.team !== caster.team) ||
            ((align === SpecialMoveAlignment.SelfAndAlly || align === SpecialMoveAlignment.Self) && target.team === caster.team) ||
            align === SpecialMoveAlignment.All
          ) {
            targets.push(targetPos);
          }
          break; // Stop if a combatant is in the way
        }

        // should Add even empty tiles?
        if(range.areaOfEffect === SpecialMoveAreaOfEffect.Nova || 
          range.areaOfEffect === SpecialMoveAreaOfEffect.Line || 
          range.areaOfEffect === SpecialMoveAreaOfEffect.Cross || 
          range.areaOfEffect === SpecialMoveAreaOfEffect.Cone) {
          targets.push(targetPos); 
        }
      }
    });

    if (align === SpecialMoveAlignment.SelfAndAlly || align === SpecialMoveAlignment.Self) {
      targets.push(caster.position);
    }

    return targets;
  }

  private getCurveTargetPositions(
    caster: Combatant,
    range: SpecialMoveRange,
    board: Board
  ): Position[] {
    const targets: Position[] = [];
    const { x, y } = caster.position;

    const visited: { [key: string]: boolean } = {};
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
        //
        if (board.isValidPosition(position)) {
          const target = board.getCombatantAtPosition(position);
          // if there is a combatant at the position, check if it is an enemy or ally
          if (target) {
            if (
              (range.align === SpecialMoveAlignment.Enemy && target.team !== caster.team) ||
              ((range.align === SpecialMoveAlignment.SelfAndAlly || range.align === SpecialMoveAlignment.Self) && target.team === caster.team) ||
              range.align === SpecialMoveAlignment.All
            ) {
              targets.push(position);
            }
            // allow for AOE targeting
          } else if(range.areaOfEffect === SpecialMoveAreaOfEffect.Nova || 
            range.areaOfEffect === SpecialMoveAreaOfEffect.Line || 
            range.areaOfEffect === SpecialMoveAreaOfEffect.Cross || 
            range.areaOfEffect === SpecialMoveAreaOfEffect.Cone) {
            targets.push(position);
          }
        }
      }

      if (distance < range.range) {
        const neighbors = [
          { x: currentX, y: currentY - 1 }, // Up
          { x: currentX, y: currentY + 1 }, // Down
          { x: currentX - 1, y: currentY }, // Left
          { x: currentX + 1, y: currentY }, // Right
        ];

        neighbors.forEach((neighbor) => {
          if (board.isValidPosition(neighbor)) {
            queue.push({ position: neighbor, distance: distance + 1 });
          }
        });
      }
    }

    if (range.align === SpecialMoveAlignment.SelfAndAlly || range.align === SpecialMoveAlignment.Self) {
      targets.push(caster.position);
    }

    return targets;
  }
}