export interface Position {
    x: number;
    y: number;
}

export function isSamePosition(position1: Position, position2: Position): boolean {
    return position1.x === position2.x && position1.y === position2.y;
}
  