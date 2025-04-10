import { ActionResult, getStandardActionResult } from "../attackResult";
import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Game } from "../Game";
import { Position } from "../Position";
import { AIAgent } from "./AIAgent";

export class DummyAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        game.executeSkipTurn();
        return getStandardActionResult();
    }
}

export class BunkerDummyAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        game.executeDefend();
        return getStandardActionResult();
    }
}

export class ToddlerAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        const actionResult = this.searchAndDestroy(combatant, game, board);
        return actionResult;
    }

    private searchAndDestroy(combatant: Combatant, game: Game, board: Board): ActionResult {
        const validAttacks = this.getValidAttacks(combatant, board);
        // can attack without moving
        if(validAttacks.length > 0) {
            const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
            return game.executeBasicAttack(combatant, randomTarget, board);
        } else {
            const validNewPositions = this.getValidMovePositions(combatant, board);
            validNewPositions.forEach(position => {
                // can attack from new position
                const validAttacks = this.getValidAttacks(Object.assign({}, combatant, { position }), board);
                if(validAttacks.length > 0) {
                    combatant.move(position, board);
                    const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
                    return game.executeBasicAttack(combatant, randomTarget, board);
                }
            });
        }
        const closestEnemyPosition = this.getClosestEnemy(combatant, game, board);
        this.moveTowards(combatant, closestEnemyPosition, board);
        game.executeSkipTurn();
        return getStandardActionResult();
    }

    private getValidMovePositions(combatant: Combatant, board: Board): Position[] {
        const validNewPositions = board.getValidMoves(combatant);
        return validNewPositions;
    }

    private getValidAttacks(combatant: Combatant, board: Board): Position[] {
        const validAttacks = board.getValidAttacks(combatant);
        return validAttacks;
    }

    private getClosestEnemy(combatant: Combatant, game: Game, board: Board): Position {
        const enemyTeam = game.teams.find(team => team.index !== combatant.team.index);
        const closestEnemy = enemyTeam?.combatants.reduce((closest, enemy) => {
            if (enemy.isKnockedOut()) return closest;
            const distanceToEnemy = Math.sqrt(
                Math.pow(enemy.position.x - combatant.position.x, 2) + 
                Math.pow(enemy.position.y - combatant.position.y, 2)
            );
            const distanceToClosest = closest ? Math.sqrt(
                Math.pow(closest.position.x - combatant.position.x, 2) + 
                Math.pow(closest.position.y - combatant.position.y, 2)
            ) : Infinity;
            return distanceToEnemy < distanceToClosest ? enemy : closest;
        }, null as Combatant | null);
        return closestEnemy?.position || combatant.position;
    }

    private moveTowards(combatant: Combatant, position: Position, board: Board): void {
        const validMoves = this.getValidMovePositions(combatant, board);
        if (validMoves.length === 0) return;

        const closestPosition = validMoves.reduce((closest, move) => {
            const distanceToTarget = Math.sqrt(
                Math.pow(move.x - position.x, 2) + 
                Math.pow(move.y - position.y, 2)
            );
            const distanceToClosest = closest ? Math.sqrt(
                Math.pow(closest.x - position.x, 2) + 
                Math.pow(closest.y - position.y, 2)
            ) : Infinity;
            return distanceToTarget < distanceToClosest ? move : closest;
        }, null as Position | null);

        if (closestPosition) {
            combatant.move(closestPosition, board);
        }
    }
}



