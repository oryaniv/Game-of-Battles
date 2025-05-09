import { ActionResult, getStandardActionResult } from "../attackResult";
import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { CombatantType } from "../Combatants/CombatantType";
import { Damage, DamageReaction, DamageType } from "../Damage";
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

export interface TurnPlay {
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

export enum PlayActionType {
    SKIP,
    DEFEND,
    BASIC_ATTACK,
    USE_SPECIAL_MOVE,
}

export abstract class HeuristicalAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        const bestPlay: TurnPlay = getHeuristicBestPlay(combatant, game, board, this.evaluationFunction);
        // eslint-disable-next-line
        debugger;
        if(bestPlay.position !== combatant.position) {
            combatant.move(bestPlay.position, board);
        } 
        const actionTarget = bestPlay.playAction.target || combatant.position;
        return bestPlay.playAction.executionFunction(combatant, actionTarget, game, board);
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.SPECIALIZED;
    }

    abstract evaluationFunction(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): any;
}

export class RandomAIAgent extends HeuristicalAIAgent {
    evaluationFunction(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): any {
        return Math.random();
    }
}

function getHeuristicBestPlay(combatant: Combatant, game: Game, 
    board: Board, evaluationFunction: (combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay) => number): TurnPlay {   
    const allActions: TurnPlay[] = getAllPossibleCombatantActions(combatant, game, board);
    // eslint-disable-next-line
    debugger;
    const allActionsEvaluated: RankedTurnPlay[] = allActions.map(action => {
        return {score: evaluationFunction(combatant, game, board, action), play: action};
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
            position: combatant.position,
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
    validNewPositions.forEach(newPosition => {
        allUsableSpecialMoves.forEach(specialMove => {
            const validTargets = board.getValidTargetsForSkill(
                Object.assign({}, combatant, { position: newPosition, hasStatusEffect: combatant.hasStatusEffect }),
                specialMove.range
            );
            validTargets.forEach(targetPosition => {
                allSpecialMoveActions.push({
                    position: newPosition,
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

export function canUseSpecialMove(specialMove: SpecialMove, combatant: Combatant): boolean {
    return combatant.stats.stamina >= specialMove.cost && (specialMove.checkRequirements === undefined || specialMove.checkRequirements(combatant));
}

export function positionToCombatant(position: Position, combatant: Combatant): Combatant {
    return Object.assign({}, combatant, { 
        position, hasStatusEffect: combatant.hasStatusEffect, hasMoved: combatant.hasMoved
    });
}

export function isMoving(combatant: Combatant, movePosition: Position): boolean {
    return combatant.position !== movePosition;
}

export function isLastSurvivor(combatant: Combatant): boolean {
    return combatant.team.getAliveCombatants().length === 1;
}   

export function isFullyHealed(combatant: Combatant): boolean {
    return combatant.stats.hp === combatant.baseStats.hp;
}

export function isSlightlyInjured(combatant: Combatant): boolean {
    return combatant.stats.hp >= combatant.baseStats.hp  * 0.8;
}

export function isInjured(combatant: Combatant): boolean {
    return combatant.stats.hp < combatant.baseStats.hp  * 0.8 && combatant.stats.hp >= combatant.baseStats.hp  * 0.5;
}

export function isBadlyInjured(combatant: Combatant): boolean {
    return combatant.stats.hp < combatant.baseStats.hp  * 0.5 && combatant.stats.hp >= combatant.baseStats.hp  * 0.2;
}

export function isNearDeath(combatant: Combatant): boolean {
    return combatant.stats.hp < combatant.baseStats.hp  * 0.2;
}

export function isEnemyNearby(combatant: Combatant, board: Board, game: Game): boolean {
    const nearbyEnemies = getNearbyEnemies(combatant, board, game);
    return nearbyEnemies.length > 0;
}

export function areManyEnemiesNearby(combatant: Combatant, board: Board, game: Game): boolean {
    const nearbyEnemies = getNearbyEnemies(combatant, board, game);
    return nearbyEnemies.length >= 2;   
}

export function getAllEnemies(combatant: Combatant, board: Board, game: Game): Combatant[] {
    const enemyTeamIndex = combatant.team.getIndex() === 0 ? 1 : 0;
    return game.teams[enemyTeamIndex].getAliveCombatants();
}

export function getNearbyEnemies(combatant: Combatant, board: Board, game: Game): Combatant[] {
    return getAllEnemies(combatant, board, game).filter(enemy => 
        board.getDistanceBetweenPositions(combatant.position, enemy.position) <= 5
    );
}

export function getNearbyAllies(combatant: Combatant, board: Board, game: Game): Combatant[] {
    const allies = combatant.team.getAliveCombatants();
    return allies.filter(ally => 
        ally !== combatant && board.getDistanceBetweenPositions(combatant.position, ally.position) <= 5
    );
}

export function allyNearby(combatant: Combatant, board: Board, game: Game): boolean {
    const nearbyAllies = getNearbyAllies(combatant, board, game);
    return nearbyAllies.length > 0;
}

export function areManyAlliesNearby(combatant: Combatant, board: Board, game: Game): boolean {
    const nearbyAllies = getNearbyAllies(combatant, board, game);
    return nearbyAllies.length >= 2;
}

export function isTargetWeak(target: Combatant, damageType: DamageType): boolean {
    return target.resistances.find(resistance => resistance.type === damageType)?.reaction === DamageReaction.WEAKNESS;
}

export function isTargetResistant(target: Combatant, damageType: DamageType): boolean {
    return target.resistances.find(resistance => resistance.type === damageType)?.reaction === DamageReaction.RESISTANCE;
}

export function isTargetImmune(target: Combatant, damageType: DamageType): boolean {
    return target.resistances.find(resistance => resistance.type === damageType)?.reaction === DamageReaction.IMMUNITY;
}

export function isTargetDefending(target: Combatant): boolean {
    return target.hasStatusEffect(StatusEffectType.DEFENDING);
}

export function isTargetLowLuck(target: Combatant): boolean {
    return target.stats.luck <= 4;
}

export function isTargetFast(target: Combatant): boolean {
    return target.stats.movementSpeed >= 4;
}

export function isTargetSlow(target: Combatant): boolean {
    return target.stats.movementSpeed <= 2;
}

export function isTargetLowDefense(target: Combatant): boolean {
    return target.stats.defensePower <= 15;
}

export function isEngaging(combatant: Combatant, movePosition: Position, board: Board, game: Game): boolean {
    return gettingNearerToEnemies(combatant, movePosition, board, game) || 
    gettingByEnemies(combatant, movePosition, board, game);
}

export function isFleeing(combatant: Combatant, movePosition: Position, board: Board, game: Game): boolean {
    return gettingAwayFromEnemies(combatant, movePosition, board, game) || 
    gettingByLessEnemies(combatant, movePosition, board, game);
}

function gettingNearerToEnemies(combatant: Combatant, movePosition: Position, board: Board, game: Game): boolean {
    const distanceToClosestEnemy = getDistanceToClosestEnemy(combatant, board, game);
    const distanceToClosestEnemyNewPosition = getDistanceToClosestEnemy(positionToCombatant(movePosition, combatant), board, game);
    return distanceToClosestEnemy > distanceToClosestEnemyNewPosition;
}

function gettingAwayFromEnemies(combatant: Combatant, movePosition: Position, board: Board, game: Game): boolean {
    const distanceToClosestEnemy = getDistanceToClosestEnemy(combatant, board, game);
    const distanceToClosestEnemyNewPosition = getDistanceToClosestEnemy(positionToCombatant(movePosition, combatant), board, game);
    return distanceToClosestEnemy < distanceToClosestEnemyNewPosition;
}

function getDistanceToClosestEnemy(combatant: Combatant, board: Board, game: Game): number {
    const nearbyEnemies = getAllEnemies(combatant, board, game);
    return nearbyEnemies.reduce((minDistance, enemy) => {
        return Math.min(minDistance, board.getDistanceBetweenPositions(combatant.position, enemy.position));
    }, Infinity);
}

function gettingByEnemies(combatant: Combatant, movePosition: Position, board: Board, game: Game): boolean {
    const nearbyEnemies = getNearbyEnemies(combatant, board, game);
    const nearbyEnemiesNewPosition = getNearbyEnemies(positionToCombatant(movePosition, combatant), board, game);
    return nearbyEnemiesNewPosition.length > nearbyEnemies.length;
}

function gettingByLessEnemies(combatant: Combatant, movePosition: Position, board: Board, game: Game): boolean {
    const nearbyEnemies = getNearbyEnemies(combatant, board, game);
    const nearbyEnemiesNewPosition = getNearbyEnemies(positionToCombatant(movePosition, combatant), board, game);
    return nearbyEnemiesNewPosition.length < nearbyEnemies.length;
}

export function isFarFromEnemies(combatant: Combatant, board: Board, game: Game): boolean {
    return getDistanceToClosestEnemy(combatant, board, game) > 6;
}

export function getDistanceClosingToEnemies(combatant: Combatant, movePosition: Position, board: Board, game: Game): number {
    const distanceToClosestEnemy = getDistanceToClosestEnemy(combatant, board, game);
    const distanceToClosestEnemyNewPosition = getDistanceToClosestEnemy(positionToCombatant(movePosition, combatant), board, game);
    return distanceToClosestEnemy - distanceToClosestEnemyNewPosition;
}

export function inEngagementDistance(combatant: Combatant, target: Position, board: Board): boolean {
    return board.getDistanceBetweenPositions(combatant.position, target) <= combatant.stats.movementSpeed;
}

export function isCombatantMartial(combatant: Combatant): boolean {
    return [
        CombatantType.Defender, CombatantType.Vanguard, CombatantType.Pikeman, CombatantType.FistWeaver,
        CombatantType.StandardBearer,CombatantType.Hunter, CombatantType.Rogue, CombatantType.Militia
    ].includes(combatant.getCombatantType());
}

export function isCombatantCaster(combatant: Combatant): boolean {
    return [
        CombatantType.Wizard, CombatantType.Witch, CombatantType.Fool, CombatantType.Artificer,
        CombatantType.Healer
    ].includes(combatant.getCombatantType());
}

export function cannotUseSpecialMoves(combatant: Combatant): boolean {
    return combatant.stats.stamina < combatant.specialMoves.reduce((minStamina, specialMove) => {
        return Math.min(minStamina, specialMove.cost);
    }, Infinity);
}

    