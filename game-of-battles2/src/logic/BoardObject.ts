import { CombatantStats } from "./Combatant";
import { Position } from "./Position";
import { Team } from "./Team";

export interface BoardPiece {
}

export class BoardObject implements BoardPiece {
    constructor(public position: Position, public baseStats: CombatantStats, public team: Team) {
    }
}

export class Construct extends BoardObject {
    constructor(public position: Position, public baseStats: CombatantStats, public team: Team) {
        super(position, baseStats, team);
    }
}

