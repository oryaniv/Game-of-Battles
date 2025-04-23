import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Position } from "../Position";
import { Game } from "../Game";
import { SpecialMoveAlignment } from "../SpecialMove";

export function getClosestEnemy(combatant: Combatant, game: Game, board: Board): Position {
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


export function getValidMovePositions(combatant: Combatant, board: Board): Position[] {
    const validNewPositions = board.getValidMoves(combatant);
    return validNewPositions;
}

export function getValidAttacks(combatant: Combatant, board: Board): Position[] {
    const validAttacks = board.getValidAttacks(combatant);
    return validAttacks;
}


export function moveTowards(combatant: Combatant, position: Position, board: Board): void {
    const validMoves = getValidMovePositions(combatant, board);
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

export function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function getValidAttackWithSkillsIncluded(combatant: Combatant, board: Board) {

    let allCombatantOffensiveSkills = combatant.specialMoves.filter(
        (move) => move.range.align === SpecialMoveAlignment.Enemy &&
        (move.checkRequirements === undefined || move.checkRequirements(combatant))
    );
    allCombatantOffensiveSkills = shuffleArray(allCombatantOffensiveSkills);
    // const possibleAttacksObject:any = {'basicAttack': validAttacks};
    
    for (let i = 0; i < allCombatantOffensiveSkills.length; i++) {
        const skill = allCombatantOffensiveSkills[i];
        const validTargets = board.getValidTargetsForSkill(combatant, skill.range);
        if(validTargets.length > 0) {
            return {skill, targets: validTargets};
        }
    }
    return null;
}