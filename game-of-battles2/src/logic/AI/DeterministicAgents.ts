import { ActionResult, getStandardActionResult } from "../attackResult";
import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Game } from "../Game";
import { Position } from "../Position";
import { SpecialMoveAlignment } from "../SpecialMove";
import { AIAgent } from "./AIAgent";
import { getClosestEnemy, getValidAttacks, getValidAttackWithSkillsIncluded, getValidAttackWithSkillsIncludedOptimal, getValidBasicAttackWithOptimalTarget, getValidMovePositions, getValidSupportSkills, isBasicAttackTargetingBetter, isSkillTargetingBetter, mergeDeep, moveTowards, shuffleArray } from "./AIUtils";


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
        const validAttacks = getValidAttacks(combatant, board);
        // can attack without moving
        if(validAttacks.length > 0) {
            const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
            return game.executeBasicAttack(combatant, randomTarget, board);
        } else {
            const validNewPositions = getValidMovePositions(combatant, board);
            for (let i = 0; i < validNewPositions.length; i++) {
                const position = validNewPositions[i];
                // can attack from new position
                const validAttacks = getValidAttacks(Object.assign({}, combatant, { position, hasStatusEffect: combatant.hasStatusEffect }), board);
                if(validAttacks.length > 0) {
                    combatant.move(position, board);
                    const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
                    return game.executeBasicAttack(combatant, randomTarget, board);
                }
            }
        }
        const closestEnemyPosition = getClosestEnemy(combatant, game, board);
        moveTowards(combatant, closestEnemyPosition, board);
        game.executeSkipTurn();
        return getStandardActionResult();
    }
}


export class TauntedAIAgent implements AIAgent {
    private offender: Combatant;

    constructor(offender: Combatant) {
        this.offender = offender;
    }

    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        const actionResult = this.chaseTheOffender(combatant, game, board, this.offender);
        return actionResult;
    }

    private chaseTheOffender(combatant: Combatant, game: Game, board: Board, offender: Combatant): ActionResult {
        const validAttacks = getValidAttacks(combatant, board);
        if(validAttacks.length > 0 && validAttacks.some((attack) => attack.x === offender.position.x && attack.y === offender.position.y)) {
            return game.executeBasicAttack(combatant, offender.position, board);
        } else {
            const validNewPositions = getValidMovePositions(combatant, board);
            for (let i = 0; i < validNewPositions.length; i++) {
                const position = validNewPositions[i];
                // can attack from new position
                const validAttacks = getValidAttacks(Object.assign({}, combatant, { position, hasStatusEffect: combatant.hasStatusEffect }), board);
                if(validAttacks.length > 0 && validAttacks.some((attack) => attack.x === offender.position.x && attack.y === offender.position.y)) {
                    combatant.move(position, board);
                    return game.executeBasicAttack(combatant, offender.position, board);
                }
            }
        }
        moveTowards(combatant, offender.position, board);
        game.executeSkipTurn();
        return getStandardActionResult();
    }       
}


export class KidAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        const actionResult = this.searchAndDestroy(combatant, game, board);
        return actionResult;
    }

    private searchAndDestroy(combatant: Combatant, game: Game, board: Board): ActionResult[] {
        const skillAttacks = getValidAttackWithSkillsIncluded(combatant, board);
        if(skillAttacks) {
            const randomTarget = skillAttacks.targets[Math.floor(Math.random() * skillAttacks.targets.length)];
            return game.executeSkill(skillAttacks.skill, combatant, randomTarget, board);
        }
        const validAttacks = getValidAttacks(combatant, board);
        // can attack without moving
        if(validAttacks.length > 0) {
            const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
            return [game.executeBasicAttack(combatant, randomTarget, board)];
        } else {
            const validNewPositions = getValidMovePositions(combatant, board);
            for (let i = 0; i < validNewPositions.length; i++) {
                const position = validNewPositions[i];
                // can attack from new position
                const skillAttacks = getValidAttackWithSkillsIncluded(Object.assign({}, combatant, { position, hasStatusEffect: combatant.hasStatusEffect }), board);
                if(skillAttacks) {
                    combatant.move(position, board);
                    const randomTarget = skillAttacks.targets[Math.floor(Math.random() * skillAttacks.targets.length)];
                    return game.executeSkill(skillAttacks.skill, combatant, randomTarget, board);
                }

                const validAttacks = getValidAttacks(Object.assign({}, combatant, { position }), board);
                if(validAttacks.length > 0) {
                    combatant.move(position, board);
                    const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
                    return [game.executeBasicAttack(combatant, randomTarget, board)];
                }
            }
        }
        const closestEnemyPosition = getClosestEnemy(combatant, game, board);
        moveTowards(combatant, closestEnemyPosition, board);
        game.executeSkipTurn();
        return [getStandardActionResult()];
    }
}

export class TeenagerAIAgent implements AIAgent {

    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        const actionResult = this.searchAndDestroyOrBuff(combatant, game, board);
        return actionResult;
    }

    private searchAndDestroyOrBuff(combatant: Combatant, game: Game, board: Board): ActionResult[] {
        const skillAttacks = getValidAttackWithSkillsIncluded(combatant, board);
        if(skillAttacks) {
            const randomTarget = skillAttacks.targets[Math.floor(Math.random() * skillAttacks.targets.length)];
            return game.executeSkill(skillAttacks.skill, combatant, randomTarget, board);
        }

        const validAttacks = getValidAttacks(combatant, board);
        // can attack without moving
        if(validAttacks.length > 0) {
            const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
            return [game.executeBasicAttack(combatant, randomTarget, board)];
        } else {
            const validNewPositions = getValidMovePositions(combatant, board);
            for (let i = 0; i < validNewPositions.length; i++) {
                const position = validNewPositions[i];
                // can attack from new position
                const skillAttacks = getValidAttackWithSkillsIncluded(Object.assign({}, combatant, { position, hasStatusEffect: combatant.hasStatusEffect }), board);
                if(skillAttacks) {
                    combatant.move(position, board);
                    const randomTarget = skillAttacks.targets[Math.floor(Math.random() * skillAttacks.targets.length)];
                    return game.executeSkill(skillAttacks.skill, combatant, randomTarget, board);
                }

                const validAttacks = getValidAttacks(Object.assign({}, combatant, { position, hasStatusEffect: combatant.hasStatusEffect }), board);
                if(validAttacks.length > 0) {
                    combatant.move(position, board);
                    const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
                    return [game.executeBasicAttack(combatant, randomTarget, board)];
                }
            }
        }

        const closestEnemyPosition = getClosestEnemy(combatant, game, board);
        moveTowards(combatant, closestEnemyPosition, board);

        // Try to use a self/ally skill instead of just skipping turn
        const supportSkills = getValidSupportSkills(combatant, board);
        if(supportSkills) {
            return game.executeSkill(supportSkills.skill, combatant, combatant.position, board);
        } else {
            game.executeSkipTurn();
        }
        return [getStandardActionResult()];
    }
}

export class RookieAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        const actionResult = this.searchAndDestroyCleverlyOrBuff(combatant, game, board);
        return actionResult;
    }

    private searchAndDestroyCleverlyOrBuff(combatant: Combatant, game: Game, board: Board): ActionResult[] {
        const skillAttacksOptimizedWithoutMove = getValidAttackWithSkillsIncludedOptimal(combatant, board);
        const validNewPositions = getValidMovePositions(combatant, board);
        const skillAttacksOptimizedAfterMove = [];
        for (let i = 0; i < validNewPositions.length; i++) {
            const position = validNewPositions[i];
            // can attack from new position
            const skillAttacksOptimizedAfterCurrentPosition = getValidAttackWithSkillsIncludedOptimal(Object.assign({}, combatant, { position, hasStatusEffect: combatant.hasStatusEffect }), board);
            if(skillAttacksOptimizedAfterCurrentPosition) {
                skillAttacksOptimizedAfterMove.push(
                    skillAttacksOptimizedAfterCurrentPosition
                );
            }
        }

        const bestOfTheBest = skillAttacksOptimizedAfterMove.reduce((best, current) => {
            return isSkillTargetingBetter(best, current);
        }, skillAttacksOptimizedAfterMove[0]);

        const bestOfTheBestOfTheBest = isSkillTargetingBetter(skillAttacksOptimizedWithoutMove || bestOfTheBest, bestOfTheBest);
        if(bestOfTheBestOfTheBest) {
            combatant.position !== bestOfTheBestOfTheBest.position && combatant.move(bestOfTheBestOfTheBest.position, board);
            return game.executeSkill(bestOfTheBestOfTheBest.skill, combatant, bestOfTheBestOfTheBest.targets[0], board);
        }


        const bestBasicAttack = getValidBasicAttackWithOptimalTarget(combatant, board);
        const basicAttackAttacksOptimizedAfterMove = [];
        for (let i = 0; i < validNewPositions.length; i++) {
            const position = validNewPositions[i];
            const basicAttackAttacksOptimizedAfterCurrentPosition = getValidBasicAttackWithOptimalTarget(mergeDeep(combatant, { position, basicAttack: combatant.basicAttack }), board);
            if(basicAttackAttacksOptimizedAfterCurrentPosition) {
                basicAttackAttacksOptimizedAfterMove.push(
                    basicAttackAttacksOptimizedAfterCurrentPosition
                );
            }
        }

        const bestOfTheBesttBasicAttack = basicAttackAttacksOptimizedAfterMove.reduce((best, current) => {
            if (!best) return current;
            if (current.priority > best.priority) return current;
            if (current.priority === best.priority && current.targetHp < best.targetHp) return current;
            return best;
        }, basicAttackAttacksOptimizedAfterMove[0]);

        const bestOfTheBestOfTheBestBasicAttack = isBasicAttackTargetingBetter(bestBasicAttack || bestOfTheBesttBasicAttack, bestOfTheBesttBasicAttack);

        if(bestOfTheBestOfTheBestBasicAttack) {
            combatant.position !== bestOfTheBestOfTheBestBasicAttack.position && combatant.move(bestOfTheBestOfTheBestBasicAttack.position, board);
            return [game.executeBasicAttack(combatant, bestOfTheBestOfTheBestBasicAttack.targets[0], board)];
        }
        
        const closestEnemyPosition = getClosestEnemy(combatant, game, board);
        moveTowards(combatant, closestEnemyPosition, board);
        
        // Try to use a self/ally skill instead of just skipping turn
        const supportSkills = getValidSupportSkills(combatant, board);
        if(supportSkills) {
            return game.executeSkill(supportSkills.skill, combatant, combatant.position, board);
        } else {
            game.executeSkipTurn();
        }
        return [getStandardActionResult()];
    }
}

export class VeteranAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        return getStandardActionResult();
    }
}
