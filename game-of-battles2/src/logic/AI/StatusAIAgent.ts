import { EventLogger } from "@/eventLogger";
import { ActionResult, getStandardActionResult } from "../attackResult";
import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Game } from "../Game";
import { AIAgentType, AIAgent } from "./AIAgent";
import { agentMove } from "./AIUtils";
import { checkIsSameCombatant, getClosestEnemy, getValidAttacks, getValidAttackWithSkillsIncluded, getValidMovePositions, getValidSupportSkills, moveTowards } from "./AIUtils";
import { Position } from "../Position";
import { Team } from "../Team";
import { off } from "process";
import { StatusEffectType } from "../StatusEffect";
import { PlayActionType } from "./HeuristicalAgents";


export class StunLockedAIAgent implements AIAgent {
    private stunLockCauseMessage: string;

    constructor(stunCauseMessage: string) {
        this.stunLockCauseMessage = stunCauseMessage;
    }

    playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const eventLogger = EventLogger.getInstance();
        eventLogger.logEvent({
            messageBody: `${combatant.name} is `,
            actionPart: `${this.stunLockCauseMessage}!`,
            actionType: PlayActionType.INACTION
        });
        game.executePassTurn();
        return Promise.resolve(getStandardActionResult());
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.STUNLOCKED;
    }
}

export class TauntedAIAgent implements AIAgent {
    private offender: Combatant;

    constructor(offender: Combatant) {
        this.offender = offender;
    }

    playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const actionResult = this.chaseTheOffender(combatant, game, board, this.offender);
        return Promise.resolve(actionResult);
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.TAUNTED;
    }

    private async chaseTheOffender(combatant: Combatant, game: Game, board: Board, offender: Combatant): Promise<ActionResult | ActionResult[]> {

        if(offender.isKnockedOut()) {
            combatant.removeStatusEffect(StatusEffectType.TAUNTED);
            const nextAgent = combatant.getAiAgent();
            if(nextAgent) {
                return await nextAgent.playTurn(combatant, game, board);
            } else {
                return Promise.resolve(getStandardActionResult());
            }
        }

        let offenderTarget = offender;
        
        const offenderDoll = offender.getRelatedCombatants()['doll'];
        if(offenderDoll) {
            offenderTarget = offenderDoll
        }

        const validAttacks = getValidAttacks(combatant, board);
        if(validAttacks.length > 0 && validAttacks.some((attack) => attack.x === offenderTarget.position.x && attack.y === offenderTarget.position.y)) {
            return game.executeBasicAttack(combatant, offenderTarget.position, board);
        } else {
            const validNewPositions = getValidMovePositions(combatant, board);
            for (let i = 0; i < validNewPositions.length; i++) {
                const position = validNewPositions[i];
                // can attack from new position
                const validAttacks = getValidAttacks(Object.assign({}, combatant, { position, hasStatusEffect: combatant.hasStatusEffect }), board);
                if(validAttacks.length > 0 && validAttacks.some((attack) => attack.x === offenderTarget.position.x && attack.y === offenderTarget.position.y)) {
                    await agentMove(combatant, position, board);
                    return game.executeBasicAttack(combatant, offenderTarget.position, board);
                }
            }
        }
        const movedPosition = moveTowards(combatant, offenderTarget.position, board);
        if(movedPosition !== undefined) {
            await agentMove(combatant, movedPosition, board);
        }
        game.executeSkipTurn();
        return getStandardActionResult();
    }       
}

export class PanickedAIAgent implements AIAgent {
    async playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const eventLogger = EventLogger.getInstance();
        eventLogger.logEvent({
            messageBody: `${combatant.name} is`,
            actionPart: 'Panicked!',
            actionType: PlayActionType.INACTION
        });
        const actionResult = this.runAway(combatant, game, board);
        return Promise.resolve(actionResult);
    }

    async runAway(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        // Get the closest enemy position
        const closestEnemyPosition = getClosestEnemy(combatant, game, board);
        
        // Get all valid moves the combatant can make
        const validMoves = getValidMovePositions(combatant, board);
        
        if (validMoves.length === 0) {
            game.executeSkipTurn();
            return getStandardActionResult();
        }

        // Find the position furthest from the closest enemy
        const furthestPosition = validMoves.reduce((furthest, move) => {
            const distanceToEnemy = Math.sqrt(
                Math.pow(move.x - closestEnemyPosition.x, 2) + 
                Math.pow(move.y - closestEnemyPosition.y, 2)
            );
            const furthestDistance = furthest ? Math.sqrt(
                Math.pow(furthest.x - closestEnemyPosition.x, 2) + 
                Math.pow(furthest.y - closestEnemyPosition.y, 2)
            ) : -Infinity;
            
            return distanceToEnemy > furthestDistance ? move : furthest;
        }, null as Position | null);

        if (furthestPosition) {
            await agentMove(combatant, furthestPosition, board);
        }
        
        game.executeSkipTurn();
        return Promise.resolve(getStandardActionResult());
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.PANICKED;
    }
}

export class EnragedAIAgent implements AIAgent {
    async playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const eventLogger = EventLogger.getInstance();
        eventLogger.logEvent({
            messageBody: `${combatant.name} is`,
            actionPart: 'Enraged!',
            actionType: PlayActionType.INACTION
        });
        const actionResult = this.goBerserk(combatant, game, board);
        return actionResult;
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.ENRAGED;
    }

    async goBerserk(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const randomNumber = Math.floor(Math.random() * 1000) + 3;
        const enragedCombatant = Object.assign(
            {}, combatant,
             { 
                hasStatusEffect: combatant.hasStatusEffect,
                canUseSkill: combatant.canUseSkill,
                hasMoved: combatant.hasMoved,
                position: combatant.position,
                team: new Team('WE KILL ALL!', randomNumber),
                resistances: combatant.resistances,
                specialMoves: combatant.specialMoves,
                getSpecialMoves: combatant.getSpecialMoves,
                getCombatantType: combatant.getCombatantType
             });

        
        const skillAttacks = getValidAttackWithSkillsIncluded(enragedCombatant, board);
        if(skillAttacks) {
            skillAttacks.targets = skillAttacks.targets.filter((attack) => !checkIsSameCombatant(combatant, attack, board));
        }
        if(skillAttacks && skillAttacks.targets.length > 0) {
            const randomTarget = skillAttacks.targets[Math.floor(Math.random() * skillAttacks.targets.length)];
            return Promise.resolve(game.executeSkill(skillAttacks.skill, combatant, randomTarget, board));
        }

        let validAttacks = getValidAttacks(enragedCombatant, board);
        validAttacks = validAttacks.filter((attack) => !checkIsSameCombatant(combatant, attack, board));

        // can attack without moving
        if(validAttacks.length > 0) {
            const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
            return Promise.resolve([game.executeBasicAttack(combatant, randomTarget, board)]);
        } else {
            const validNewPositions = getValidMovePositions(enragedCombatant, board);
            for (let i = 0; i < validNewPositions.length; i++) {
                const position = validNewPositions[i];
                // can attack from new position
                const skillAttacks = getValidAttackWithSkillsIncluded(Object.assign({}, enragedCombatant, { 
                    position, hasStatusEffect: enragedCombatant.hasStatusEffect, hasMoved: true,
                    canUseSkill: enragedCombatant.canUseSkill
                }), board);

                if(skillAttacks) {
                    skillAttacks.targets = skillAttacks.targets.filter((attack) => !checkIsSameCombatant(combatant, attack, board));
                }

                if(skillAttacks && skillAttacks.targets.length > 0) {
                    await agentMove(combatant, position, board);
                    const randomTarget = skillAttacks.targets[Math.floor(Math.random() * skillAttacks.targets.length)];
                    return Promise.resolve(game.executeSkill(skillAttacks.skill, combatant, randomTarget, board));
                }

                let validAttacks = getValidAttacks(Object.assign({}, enragedCombatant, { position, hasStatusEffect: enragedCombatant.hasStatusEffect, canUseSkill: enragedCombatant.canUseSkill }), board);
                validAttacks = validAttacks.filter((attack) => !checkIsSameCombatant(combatant, attack, board));
                if(validAttacks.length > 0) {
                    await agentMove(combatant, position, board);
                    const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
                    return Promise.resolve([game.executeBasicAttack(combatant, randomTarget, board)]);
                }
            }
        }

        const closestEnemyPosition = getClosestEnemy(enragedCombatant, game, board);
        const movedPosition = moveTowards(combatant, closestEnemyPosition, board);
        if(movedPosition !== undefined) {
            await agentMove(combatant, movedPosition, board);
        }

        // Try to use a self/ally skill instead of just skipping turn
        game.executeSkipTurn();
        return Promise.resolve([getStandardActionResult()]);
    }
}   

export class CharmedAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const eventLogger = EventLogger.getInstance();
        eventLogger.logEvent({
            messageBody: `${combatant.name} is`,
            actionPart: 'Charmed!',
            actionType: PlayActionType.INACTION
        });
        const actionResult = this.doBetrayal(combatant, game, board);
        return Promise.resolve(actionResult);
    }

    async doBetrayal(combatant: Combatant, game: Game, board: Board): Promise<ActionResult | ActionResult[]> {
        const brainwashedCombatant = Object.assign(
            {}, combatant,
             { 
                hasStatusEffect: combatant.hasStatusEffect,
                canUseSkill: combatant.canUseSkill,
                hasMoved: combatant.hasMoved,
                position: combatant.position,
                team: combatant.team.getIndex() === 0 ? game.teams[1] : game.teams[0],
                resistances: combatant.resistances,
                specialMoves: combatant.specialMoves,
                getSpecialMoves: combatant.getSpecialMoves,
                getCombatantType: combatant.getCombatantType
             });

        
        const skillAttacks = getValidAttackWithSkillsIncluded(brainwashedCombatant, board);
        if(skillAttacks) {
            skillAttacks.targets = skillAttacks.targets.filter((attack) => !checkIsSameCombatant(combatant, attack, board));
        }
        if(skillAttacks && skillAttacks.targets.length > 0) {
            const randomTarget = skillAttacks.targets[Math.floor(Math.random() * skillAttacks.targets.length)];
            return Promise.resolve(game.executeSkill(skillAttacks.skill, combatant, randomTarget, board));
        }

        let validAttacks = getValidAttacks(brainwashedCombatant, board);
        validAttacks = validAttacks.filter((attack) => !checkIsSameCombatant(combatant, attack, board));

        // can attack without moving
        if(validAttacks.length > 0) {
            const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
            return Promise.resolve([game.executeBasicAttack(combatant, randomTarget, board)]);
        } else {
            const validNewPositions = getValidMovePositions(brainwashedCombatant, board);
            for (let i = 0; i < validNewPositions.length; i++) {
                const position = validNewPositions[i];
                // can attack from new position
                const skillAttacks = getValidAttackWithSkillsIncluded(Object.assign({}, brainwashedCombatant, { 
                    position, hasStatusEffect: brainwashedCombatant.hasStatusEffect, hasMoved: true,
                    canUseSkill: brainwashedCombatant.canUseSkill
                }), board);

                if(skillAttacks) {
                    skillAttacks.targets = skillAttacks.targets.filter((attack) => !checkIsSameCombatant(combatant, attack, board));
                }

                if(skillAttacks && skillAttacks.targets.length > 0) {
                    await agentMove(combatant, position, board);
                    const randomTarget = skillAttacks.targets[Math.floor(Math.random() * skillAttacks.targets.length)];
                    return Promise.resolve(game.executeSkill(skillAttacks.skill, combatant, randomTarget, board));
                }

                let validAttacks = getValidAttacks(Object.assign({}, brainwashedCombatant, { position, hasStatusEffect: brainwashedCombatant.hasStatusEffect, canUseSkill: brainwashedCombatant.canUseSkill }), board);
                validAttacks = validAttacks.filter((attack) => !checkIsSameCombatant(combatant, attack, board));
                if(validAttacks.length > 0) {
                    await agentMove(combatant, position, board);
                    const randomTarget = validAttacks[Math.floor(Math.random() * validAttacks.length)];
                    return Promise.resolve([game.executeBasicAttack(combatant, randomTarget, board)]);
                }
            }
        }

        const closestEnemyPosition = getClosestEnemy(brainwashedCombatant, game, board);
        const movedPosition = moveTowards(combatant, closestEnemyPosition, board);
        if(movedPosition !== undefined) {
            await agentMove(combatant, movedPosition, board);
        }

        // Try to use a self/ally skill instead of just skipping turn
        const supportSkills = getValidSupportSkills(brainwashedCombatant, board);
        if(supportSkills) {
            return Promise.resolve(game.executeSkill(supportSkills.skill, combatant, combatant.position, board));
        } else {
            game.executeSkipTurn();
            return Promise.resolve([getStandardActionResult()]);
        }
    }
    
    getAIAgentType(): AIAgentType {
        return AIAgentType.CHARMED;
    }
}
