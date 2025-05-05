import { ActionResult, getStandardActionResult } from "../attackResult";
import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { CombatantType } from "../Combatants/CombatantType";
import { Game } from "../Game";
import { Position } from "../Position";
import { SpecialMove, SpecialMoveAlignment } from "../SpecialMove";
import { StatusEffectType } from "../StatusEffect";
import { AIAgent, AIAgentType } from "./AIAgent";
import { getValidAttacks, getValidMovePositions } from "./AIUtils";

interface RankedTurnPlay {
    play: TurnPlay;
    score: number;
}

interface TurnPlay {
    // where the combatant will move to during the play
    position: Position;
    // what the combatant will do during the play
    playAction: PlayAction;
}

interface PlayAction {
    executionFunction: (combatant: Combatant, target: Position, game: Game, board: Board) => ActionResult[];
    playActionType: PlayActionType;
    // execution target
    target: Position | undefined;
    skillName?:string
}

enum PlayActionType {
    SKIP,
    DEFEND,
    BASIC_ATTACK,
    USE_SPECIAL_MOVE,
}

export abstract class HeuristicalAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        const bestPlay: TurnPlay = getHeuristicBestPlay(combatant, game, board, this.evaluationFunction);
        if(bestPlay.position !== combatant.position) {
            combatant.move(bestPlay.position, board);
        } 
        const actionTarget = bestPlay.playAction.target || combatant.position;
        return bestPlay.playAction.executionFunction(combatant, actionTarget, game, board);
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.SPECIALIZED;
    }

    abstract evaluationFunction(action: ActionResult, combatant: Combatant, game: Game, board: Board): any;
}

export class RandomAIAgent extends HeuristicalAIAgent {
    evaluationFunction(action: ActionResult, combatant: Combatant, game: Game, board: Board): any {
        return Math.random();
    }
}

function getHeuristicBestPlay(combatant: Combatant, game: Game, board: Board, evaluationFunction: any): TurnPlay {   
    const allActions: TurnPlay[] = getAllPossibleCombatantActions(combatant, game, board);
    const allActionsEvaluated: RankedTurnPlay[] = allActions.map(action => {
        return {score: evaluationFunction(action, combatant, game, board), play: action};
    });
    allActionsEvaluated.sort((a, b) => b.score - a.score);
    return allActionsEvaluated[0].play;
}

function getAllPossibleCombatantActions(combatant: Combatant, game: Game, board: Board): TurnPlay[] {

    const allActions: TurnPlay[] = [];

    const validNewPositions = getValidMovePositions(combatant, board);
    allActions.push(...getSkipPlays(combatant, game, board, validNewPositions));
    allActions.push(...getDefendPlays(combatant, game, board, validNewPositions));
    allActions.push(...getBasicAttackPlays(combatant, game, board, validNewPositions));
    allActions.push(...getSpecialMovePlays(combatant, game, board, validNewPositions));

    // collect supers?

    return allActions;
}

function getSkipPlays(combatant: Combatant, game: Game, board: Board, validNewPositions: Position[]): TurnPlay[] {
    return [combatant.position].concat(validNewPositions).map(position => {
        return {
            position,
            playAction: {
                executionFunction: (combatant: Combatant, target: Position, game: Game, board: Board) => {
                    game.executeSkipTurn();
                    return [getStandardActionResult()];
                },
                playActionType: PlayActionType.SKIP,
                target: undefined
            }
        }
    });
}

function getDefendPlays(combatant: Combatant, game: Game, board: Board, validNewPositions: Position[]): TurnPlay[] {
    const allDefendActions: TurnPlay[] = [];

    allDefendActions.push({
        position: combatant.position,
        playAction: {
            executionFunction: (combatant: Combatant, target: Position, game: Game, board: Board) => {
                game.executeDefend();
                return [getStandardActionResult()];
            },
            playActionType: PlayActionType.DEFEND,
            target: undefined
        }
    });

    if(combatant.hasStatusEffect(StatusEffectType.MARCHING_DEFENSE)) {
        (validNewPositions).forEach(position => {
            allDefendActions.push({
                position,
                playAction: {
                    executionFunction: (combatant: Combatant, target: Position, game: Game, board: Board) => {
                        game.executeDefend();
                        return [getStandardActionResult()];
                    },
                    playActionType: PlayActionType.DEFEND,
                    target: undefined
                }
            });
        });
    }

    return allDefendActions;
}

function getBasicAttackPlays(combatant: Combatant, game: Game, board: Board, validNewPositions: Position[]): TurnPlay[] {
    const allBasicAttackActions: TurnPlay[] = [];

    const validAttacks = getValidAttacks(combatant, board);
    validAttacks.forEach(attackPosition => {
        allBasicAttackActions.push({
            position: attackPosition,
            playAction: {
                executionFunction: (combatant: Combatant, target: Position, game: Game, board: Board) => {
                    return [game.executeBasicAttack(combatant, target, board)];
                },
                playActionType: PlayActionType.BASIC_ATTACK,
                target: attackPosition
            }
        });
    });

    for (let i = 0; i < validNewPositions.length; i++) {
        const position = validNewPositions[i];
        // can attack from new position
        const validAttacks = getValidAttacks(Object.assign({}, combatant, { position, hasStatusEffect: combatant.hasStatusEffect }), board);
        if(validAttacks.length > 0) {
            validAttacks.forEach(attackPosition => {
                allBasicAttackActions.push({
                position,
                playAction: {
                    executionFunction: (combatant: Combatant, target: Position, game: Game, board: Board) => {
                        return [game.executeBasicAttack(combatant, target, board)];
                    },
                    playActionType: PlayActionType.BASIC_ATTACK,
                    target: attackPosition
                    }
                },);
            })
        }
    }

    return allBasicAttackActions;
}

function getSpecialMovePlays(combatant: Combatant, game: Game, board: Board, validNewPositions: Position[]): TurnPlay[] {
    const allSpecialMoveActions: TurnPlay[] = [];

    const allUsableSpecialMoves = combatant.specialMoves.filter(specialMove => canUseSpecialMove(specialMove, combatant));

    // Check special moves from current position
    allUsableSpecialMoves.forEach(specialMove => {
        const validTargets = board.getValidTargetsForSkill(combatant, specialMove.range);
        validTargets.forEach(targetPosition => {
            allSpecialMoveActions.push({
                position: combatant.position,
                playAction: {
                    executionFunction: (combatant: Combatant, target: Position, game: Game, board: Board) => {
                        return game.executeSkill(specialMove, combatant, target, board);
                        
                    },
                    playActionType: PlayActionType.USE_SPECIAL_MOVE,
                    target: targetPosition,
                    skillName: specialMove.name
                }
            });
        });
    });

    // Check special moves from all valid new positions
    validNewPositions.forEach(position => {
        allUsableSpecialMoves.forEach(specialMove => {
            const validTargets = board.getValidTargetsForSkill(
                Object.assign({}, combatant, { position, hasStatusEffect: combatant.hasStatusEffect }),
                specialMove.range
            );
            validTargets.forEach(targetPosition => {
                allSpecialMoveActions.push({
                    position,
                    playAction: {
                        executionFunction: (combatant: Combatant, target: Position, game: Game, board: Board) => {
                            return game.executeSkill(specialMove, combatant, target, board);
                        },
                        playActionType: PlayActionType.USE_SPECIAL_MOVE,
                        target: targetPosition,
                        skillName: specialMove.name
                    }
                });
            });
        });
    });
   
    return allSpecialMoveActions;
}

function canUseSpecialMove(specialMove: SpecialMove, combatant: Combatant): boolean {
    return combatant.stats.stamina >= specialMove.cost && (specialMove.checkRequirements === undefined || specialMove.checkRequirements(combatant));
}