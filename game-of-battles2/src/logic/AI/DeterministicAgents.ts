import { ActionResult, getStandardActionResult } from "../attackResult";
import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { CombatantType } from "../Combatants/CombatantType";
import { Game } from "../Game";
import { Position } from "../Position";
import { SpecialMoveAlignment } from "../SpecialMove";
import { StatusEffectType } from "../StatusEffect";
import { AIAgent, AIAgentType } from "./AIAgent";
import { agentMove, getClosestEnemy, getValidAttacks, getValidAttackWithSkillsIncluded, getValidAttackWithSkillsIncludedOptimal, getValidBasicAttackWithOptimalTarget, getValidMovePositions, getValidSupportSkills, isBasicAttackTargetingBetter, isSkillTargetingBetter, mergeDeep, moveTowards, shuffleArray } from "./AIUtils";
import { getAdjacentEnemies, HeuristicalAIAgent } from "./HeuristicalAgents";


export class HollowAIAgent implements AIAgent {
    async playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        return Promise.resolve(getStandardActionResult());
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.DETERMINISTIC;
    }
}

export class DummyAIAgent implements AIAgent {
    async playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        game.executeSkipTurn();
        return Promise.resolve(getStandardActionResult());
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.PRIMITIVE;
    }
}

export class BunkerDummyAIAgent implements AIAgent {
    async playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        game.executeDefend();
        return Promise.resolve(getStandardActionResult());
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.PRIMITIVE;
    }
}

export class ToddlerAIAgent implements AIAgent {
    async playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const actionResult = this.searchAndDestroy(combatant, game, board);
        return Promise.resolve(actionResult);
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.DETERMINISTIC;
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
                const validAttacks = getValidAttacks(Object.assign({}, combatant, { position, hasStatusEffect: combatant.hasStatusEffect, canUseSkill: combatant.canUseSkill }), board);
                if(validAttacks.length > 0) {
                    combatant.move(position, board);
                    const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
                    return game.executeBasicAttack(combatant, randomTarget, board);
                }
            }
        }
        const closestEnemyPosition = getClosestEnemy(combatant, game, board);
        const movedPosition = moveTowards(combatant, closestEnemyPosition, board);
        if(movedPosition !== undefined) {
            combatant.move(movedPosition, board);
        }
        game.executeSkipTurn();
        return getStandardActionResult();
    }
}





export class KidAIAgent implements AIAgent {
    async playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const actionResult = this.searchAndDestroy(combatant, game, board);
        return Promise.resolve(actionResult);
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.DETERMINISTIC;
    }

    private async searchAndDestroy(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const skillAttacks = getValidAttackWithSkillsIncluded(combatant, board);
        if(skillAttacks) {
            const randomTarget = skillAttacks.targets[Math.floor(Math.random() * skillAttacks.targets.length)];
            return Promise.resolve(game.executeSkill(skillAttacks.skill, combatant, randomTarget, board));
        }
        const validAttacks = getValidAttacks(combatant, board);
        // can attack without moving
        if(validAttacks.length > 0) {
            const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
            return Promise.resolve([game.executeBasicAttack(combatant, randomTarget, board)]);
        } else {
            const validNewPositions = getValidMovePositions(combatant, board);
            for (let i = 0; i < validNewPositions.length; i++) {
                const position = validNewPositions[i];
                // can attack from new position
                const skillAttacks = getValidAttackWithSkillsIncluded(Object.assign({}, combatant, { 
                    position, hasStatusEffect: combatant.hasStatusEffect, hasMoved: true,
                    canUseSkill: combatant.canUseSkill
                }), board);
                if(skillAttacks) {
                    await agentMove(combatant, position, board);
                    const randomTarget = skillAttacks.targets[Math.floor(Math.random() * skillAttacks.targets.length)];
                    return Promise.resolve(game.executeSkill(skillAttacks.skill, combatant, randomTarget, board));
                }

                const validAttacks = getValidAttacks(Object.assign({}, combatant, { position, canUseSkill: combatant.canUseSkill }), board);
                if(validAttacks.length > 0) {
                    await agentMove(combatant, position, board);
                    const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
                    return Promise.resolve([game.executeBasicAttack(combatant, randomTarget, board)]);
                }
            }
        }
        const closestEnemyPosition = getClosestEnemy(combatant, game, board);
        const movedPosition = moveTowards(combatant, closestEnemyPosition, board);
        if(movedPosition !== undefined) {
            await agentMove(combatant, movedPosition, board);
        }
        game.executeSkipTurn();
        return Promise.resolve([getStandardActionResult()]);
    }
}

export class TeenagerAIAgent implements AIAgent {

    async playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const actionResult = this.searchAndDestroyOrBuff(combatant, game, board);
        return Promise.resolve(actionResult);
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.DETERMINISTIC;
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
                const skillAttacks = getValidAttackWithSkillsIncluded(Object.assign({}, combatant, { 
                    position, hasStatusEffect: combatant.hasStatusEffect, hasMoved: true,
                    canUseSkill: combatant.canUseSkill
                }), board);
                if(skillAttacks) {
                    combatant.move(position, board);
                    const randomTarget = skillAttacks.targets[Math.floor(Math.random() * skillAttacks.targets.length)];
                    return game.executeSkill(skillAttacks.skill, combatant, randomTarget, board);
                }

                const validAttacks = getValidAttacks(Object.assign({}, combatant, { position, hasStatusEffect: combatant.hasStatusEffect, canUseSkill: combatant.canUseSkill }), board);
                if(validAttacks.length > 0) {
                    combatant.move(position, board);
                    const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
                    return [game.executeBasicAttack(combatant, randomTarget, board)];
                }
            }
        }

        const closestEnemyPosition = getClosestEnemy(combatant, game, board);
        const movedPosition = moveTowards(combatant, closestEnemyPosition, board);
        if(movedPosition !== undefined) {
            combatant.move(movedPosition, board);
        }

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
    async playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const actionResult = this.searchAndDestroyCleverlyOrBuff(combatant, game, board);
        return Promise.resolve(actionResult);
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.DETERMINISTIC;
    }

    private collectCoop: boolean = true;
    setCollectCoop(collectCoop: boolean) {
        this.collectCoop = collectCoop;
    }

    private async searchAndDestroyCleverlyOrBuff(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const skillAttacksOptimizedWithoutMove = getValidAttackWithSkillsIncludedOptimal(combatant, board, this.collectCoop);
        const validNewPositions = getValidMovePositions(combatant, board);
        const skillAttacksOptimizedAfterMove = [];
        for (let i = 0; i < validNewPositions.length; i++) {
            const position = validNewPositions[i];
            // can attack from new position
            const skillAttacksOptimizedAfterCurrentPosition = getValidAttackWithSkillsIncludedOptimal(Object.assign({}, combatant, { 
                position, hasStatusEffect: combatant.hasStatusEffect, hasMoved: true,
                canUseSkill: combatant.canUseSkill
            }), board, this.collectCoop);
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
            combatant.position !== bestOfTheBestOfTheBest.position && await agentMove(combatant, bestOfTheBestOfTheBest.position, board);
            return await game.executeSkill(bestOfTheBestOfTheBest.skill, combatant, bestOfTheBestOfTheBest.targets[0], board);
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
            return [await game.executeBasicAttack(combatant, bestOfTheBestOfTheBestBasicAttack.targets[0], board)];
        }
        
        const closestEnemyPosition = getClosestEnemy(combatant, game, board);
        const movedPosition = moveTowards(combatant, closestEnemyPosition, board);
        if(movedPosition !== undefined) {
            await agentMove(combatant, movedPosition, board);
        }
        // Try to use a self/ally skill instead of just skipping turn
        const supportSkills = getValidSupportSkills(combatant, board);
        if(supportSkills) {
            return await game.executeSkill(supportSkills.skill, combatant, combatant.position, board);
        } else {
            await game.executeSkipTurn();
        }
        return Promise.resolve([getStandardActionResult()]);
    }
}

export class TrollAIAgent implements AIAgent {

    private baseAgent: RookieAIAgent;
    private beastRaged: boolean = false;

    constructor() {
        this.baseAgent = new RookieAIAgent();
    }

    async playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const actionResult = this.trollRampaging(combatant, game, board);
        return Promise.resolve(actionResult);
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.DETERMINISTIC;
    }

    private async trollRampaging(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const combatRound = game.getCurrentRound();
        const roundsToRage = [2, 5, 10, 15, 20];
        const beastRage = combatant.specialMoves.find(move => move.name === "Beast Rage");
        if(roundsToRage.includes(combatRound) && !this.beastRaged && combatant.canUseSkill(beastRage!)) {
            this.beastRaged = true;
            return Promise.resolve(game.executeSkill(beastRage!, combatant, combatant.position, board));
        }

        if(!roundsToRage.includes(combatRound) && this.beastRaged) {
            this.beastRaged = false;
        }

        return await this.baseAgent.playTurn(combatant, game, board);
    }
}

export class GorillaAIAgent implements AIAgent {
    private baseAgent: KidAIAgent;

    constructor() {
        this.baseAgent = new KidAIAgent();
    }

    async playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const actionResult = await this.gorillaAttacking(combatant, game, board);
        return Promise.resolve(actionResult);
    }

    private async gorillaAttacking(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const adjacentEnemies = getAdjacentEnemies(combatant, board, game);
        const gorillaSmash = combatant.specialMoves.find(move => move.name === "Gorilla Smash!");
        if(adjacentEnemies.length >= 3 && combatant.canUseSkill(gorillaSmash!)) {
            return Promise.resolve(game.executeSkill(gorillaSmash!, combatant, combatant.position, board));
        }

        return await this.baseAgent.playTurn(combatant, game, board);
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.DETERMINISTIC;
    }
}
