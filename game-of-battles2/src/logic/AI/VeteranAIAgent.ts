import { NOMEM } from "dns";
import { ActionResult, getStandardActionResult } from "../attackResult";
import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { CombatantType } from "../Combatants/CombatantType";
import { DamageReaction, DamageType } from "../Damage";
import { Game } from "../Game";
import { isSamePosition, Position } from "../Position";
import { SpecialMoveAlignment, SpecialMoveAreaOfEffect } from "../SpecialMove";
import { StatusEffectAlignment, StatusEffectType } from "../StatusEffect";
import { AIAgentType } from "./AIAgent";
import { HeuristicalAIAgent, PlayActionType, TurnPlay, areManyAlliesNearby, areManyEnemiesNearby, isCombatantMartial, 
    getDistanceClosingToEnemies, isBadlyInjured, isEnemyNearby, isEngaging, isFleeing, isFullyHealed,
     isInjured, isLastSurvivor, isMoving, isNearDeath, isSlightlyInjured, isTargetDefending,
      isTargetImmune, isTargetResistant, isTargetWeak, isFarFromEnemies, 
      getNearbyEnemies,
      isCombatantCaster,
      cannotUseSpecialMoves,
      isTargetLowLuck,
      isTargetLowDefense,
      isTargetFast,
      inEngagementDistance,
      isHighAttackPower,
      isVeryHighAttackPower,
      isPowerCharged,
      isTargetCrawlingSlow,
      getDistanceToClosestEnemy,
      isTargetHighInitiative,
      isTargetSlow, assertTargetIsExists,
      getTargetCombatantForEvaluation,
      isCombatantMelee,
      isTargetInMelee,
      isFatigued,
      isLowStamina,
      isStaminaDepleted,
      getAlliedCombatantsInRange, getClosestEnemy,
      theoreticalReplacement,
      isTargetHighDefense,
      isLowAttackPower,
      isMemeAttacker,
      isTargetHighAgility,
      isTargetCaster,
      isTargetFateStruck,
      normalizeCoopEvaluation,
      isCombatantNonAttacker, isSameTeam, isCombatantDPS,
      hasBuffBrokenByMove,
      hasStrongsDebuffBrokenByMove,
      isLeprechaun,
      isTargetHighLuck,
      isVeryHighLuck,
      hasPurifySkill,
      hasMeditateSkill,
      getNearbyAllies,
      getAdjacentEnemies} from "./HeuristicalAgents";
import { BoardObject } from "../BoardObject";

export enum AggressivenessLevel {
    FrontLine = 0,
    MiddleLine = 1,
    BackLine = 2
}




export class VeteranAIAgent extends HeuristicalAIAgent {

    evaluationFunction(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): Number {
        const agent: VeteranAIAgentPlayer = agentByCombatantType[combatant.getCombatantType()];
        return agent.evaluate(combatant, game, board, turnPlay);
    }
}

interface VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number;
}

abstract class VeteranAIAgentGenericPlayer implements VeteranAIAgentPlayer {
    protected getBaseMovementValue(): number {
        return 0;
    }

    protected getBaseSkipValue(): number {
        return 1;
    }

    protected getBaseDefendValue(): number {
        return 1;
    }

    protected getBaseBasicAttackValue(): number {
        return 2;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.FrontLine;
    }

    protected getMaxEnemyEffectiveRange(): number {
        return 1;
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        if(!turnPlay || !turnPlay.playAction) {
            throw new Error("Turn play or play action are undefined");
        }
        
        const movePosition = turnPlay.position;

        if(turnPlay.playAction.playActionType === PlayActionType.SKIP) {
            return this.evaluateSkip(combatant, game, board, movePosition);
        }

        if(turnPlay.playAction.playActionType === PlayActionType.DEFEND) {
            return this.evaluateDefend(combatant, game, board, movePosition);
        }

        const target = turnPlay.playAction.target;
        if(turnPlay.playAction.playActionType === PlayActionType.BASIC_ATTACK) {
            return this.evaluateBasicAttack(combatant, game, board, movePosition, target);
        }

        return -1000;
    }

    protected evaluateMovement(combatant: Combatant, game: Game, board: Board,
         movePosition: Position, customEffectiveRange?: number): number {
        let baseValue = 0;
       
        const distanceClosing = getDistanceClosingToEnemies(combatant, movePosition, board, game);
        const gettingCloserToEnemy = distanceClosing > 0;
        const gettingAwayFromEnemy = distanceClosing < 0;
        const sameDistanceToEnemy = distanceClosing === 0;
        const stayingInPlace = sameDistanceToEnemy && isSamePosition(combatant.position, movePosition);
        
        if(gettingCloserToEnemy) {
            // effective range is always positive
            const effectiveRange = customEffectiveRange || this.getMaxEnemyEffectiveRange();
            const distanceToClosestEnemy = getDistanceToClosestEnemy(combatant, board, game);
            const desiredAmountOfSteps = distanceToClosestEnemy - effectiveRange;
            // distanceToClosestEnemy > effectiveRange, I want to get closer
            if(desiredAmountOfSteps > 0) {
                const goodSteps = desiredAmountOfSteps >= distanceClosing ? distanceClosing : desiredAmountOfSteps;
                const badSteps = distanceClosing > desiredAmountOfSteps ? distanceClosing - desiredAmountOfSteps : 0;
                baseValue += (0.5 * goodSteps) - (0.7 * badSteps);
            } 
            // already there, or too close
            else {
                baseValue += (-0.7 * distanceClosing);
            }
            baseValue += isLastSurvivor(combatant) ? 10 : 0;
        }

        if(gettingAwayFromEnemy) {
            const effectiveRange = customEffectiveRange || this.getMaxEnemyEffectiveRange();
            if(effectiveRange === 1) {
                baseValue -= 1;
            // do the mangudai thing
            } else {
                const distanceToClosestEnemy = getDistanceToClosestEnemy(combatant, board, game);
                const desiredAmountOfSteps = effectiveRange - distanceToClosestEnemy;
                // remember that distanceClosing is negative!!!
                const distanceRetreating = -distanceClosing;
                const goodSteps = desiredAmountOfSteps >= distanceRetreating ? distanceRetreating : desiredAmountOfSteps;
                const badSteps = distanceRetreating > desiredAmountOfSteps ? distanceRetreating - desiredAmountOfSteps : 0;
                baseValue += (0.5 * goodSteps) - (0.7 * badSteps);
            }
        }

        if(!stayingInPlace) {
            baseValue += combatant.hasStatusEffect(StatusEffectType.SHIELD_WALL) ? -6 : 0;
            baseValue += combatant.hasStatusEffect(StatusEffectType.SHIELD_WALL_PROTECTED) ? -4 : 0;
            baseValue += combatant.hasStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL) ? -10 : 0;
            baseValue += combatant.hasStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED) ? -8 : 0;
            baseValue += combatant.hasStatusEffect(StatusEffectType.MESMERIZING) ? -6 : 0;
            baseValue += combatant.hasStatusEffect(StatusEffectType.CIRCUS_DIABOLIQUE) ? -10 : 0;
            baseValue += combatant.hasStatusEffect(StatusEffectType.SANCTUARY) ? -8 : 0;
        }

        return baseValue;
    }

    protected evaluateSkip(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
        if(isMoving(combatant, movePosition)) {
            return this.evaluateMovement(combatant, game, board, movePosition);
        }

        let baseValue = this.getBaseSkipValue();
        baseValue += isLastSurvivor(combatant) ? -10 : 0;
        baseValue += isCombatantCaster(combatant) && combatant.specialMoves.length > 0 && cannotUseSpecialMoves(combatant) ? 2 : 0;
        return baseValue;
    }

    protected evaluateDefend(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
        let baseValue = this.getBaseDefendValue();
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        // baseValue += areManyEnemiesNearby(combatant, board, game) ? 2 : 0;
        // baseValue += isEnemyNearby(combatant, board, game) ? 1 : 0;
        baseValue += isEnemyNearby(combatant, board, game) && isSlightlyInjured(combatant) ? 1 : 0;
        baseValue += isEnemyNearby(combatant, board, game) && isBadlyInjured(combatant) ? 2 : 0;
        baseValue += isEnemyNearby(combatant, board, game) && isNearDeath(combatant) ? 3 : 0;
        return baseValue;
    }  

    protected evaluateBasicAttack(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined,
        damageType?: DamageType, range?: number
    ): number {
        assertTargetIsExists(movePosition, target, board);
        
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        if(targetCombatant.isCloaked()) {
            return 0;
        }
  
        let baseValue = this.getBaseBasicAttackValue();
        const targetIsDefending = isTargetDefending(targetCombatant);
        const targetIsWeak = isTargetWeak(targetCombatant, damageType || combatant.basicAttack().type);
        baseValue += this.evaluateMovement(combatant, game, board, movePosition, range);
        baseValue += isLastSurvivor(combatant) ? 5 : 0;
        const enemyLastSurvivor = isLastSurvivor(targetCombatant);
        // baseValue += isNearDeath(targetCombatant) ? 4 : 0;
        // baseValue += isBadlyInjured(targetCombatant) ? 3 : 0;
        // baseValue += isInjured(targetCombatant) ? 2 : 0;
        // baseValue += isSlightlyInjured(targetCombatant) ? 1 : 0;
        baseValue += evaluateEnemyCombatant(targetCombatant);
        // baseValue += (combatant.stats.attackPower - targetCombatant.stats.defensePower) * 0.1;
        baseValue += !enemyLastSurvivor && targetIsDefending ? -2 : 0;
        baseValue += targetIsDefending && targetIsWeak ? 0.5 : 0;
        baseValue += !targetIsDefending && targetIsWeak ? 10 : 0;
        baseValue += !enemyLastSurvivor && isTargetResistant(targetCombatant, damageType || combatant.basicAttack().type) ? -3 : 0;
        baseValue += isTargetImmune(targetCombatant, damageType || combatant.basicAttack().type) ? -10 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.FRENZY) ? -8 : 0;
        baseValue += targetCombatant.isExpendable() ? -5 : 0;

        // just so these cowardly casters don't shy away from fighting tooth and nail
        baseValue += isCombatantCaster(combatant) && isStaminaDepleted(combatant) ? 5 : 0;

        baseValue += combatant.hasStatusEffect(StatusEffectType.SANCTUARY) ? -8 : 0;

        baseValue += isTargetInMelee(combatant, targetCombatant, board) && 
        targetCombatant.hasStatusEffect(StatusEffectType.SLEEPING) ? 8 : 0;
        
        return baseValue;

        function evaluateEnemyCombatant(enemyCombatant: Combatant): number {
            if(isLastSurvivor(enemyCombatant)) {
                return 0;
            }
            return (10 - (enemyCombatant.stats.hp * 0.1));
        }
    }
}

class VeteranAIAgentMilitiaPlayer extends VeteranAIAgentGenericPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return super.evaluate(combatant, game, board, turnPlay);
    }

    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return super.getBaseSkipValue();
    }

    protected getBaseDefendValue(): number {
        return super.getBaseDefendValue();
    }

    protected getBaseBasicAttackValue(): number {
        return super.getBaseBasicAttackValue();
    }
}

class VeteranAIAgentDefenderPlayer extends VeteranAIAgentGenericPlayer {
    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return super.getBaseSkipValue();
    }

    protected getBaseDefendValue(): number {
        return 1;
    }

    protected getBaseBasicAttackValue(): number {
        return 1;
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        // all that is left is special move  
        const specialMove = turnPlay.playAction.skillName;
        if(specialMove === "Blocking Stance") {
            return this.evaluateBlockingStance(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Defensive Strike") {
            return this.evaluateDefensiveStrike(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Fortify") {
            return this.evaluateFortify(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Shield Bash") {
            return this.evaluateShieldBash(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Guardian") {
            return this.evaluateGuardian(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Shield Wall") {
            return this.evaluateShieldWall(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Arcane Shield Wall") {
            return this.evaluateArcaneShieldWall(combatant, game, board, movePosition, target);
        }
        
        return 0;
    }

    protected evaluateSkip(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
        let baseValue = super.evaluateSkip(combatant, game, board, movePosition);
        if(!isSamePosition(combatant.position, movePosition)) {
            return baseValue;
        }
        if(combatant.hasStatusEffect(StatusEffectType.SHIELD_WALL)) {
            baseValue += this.evaluateShieldWall(combatant, game, board, movePosition, combatant.position);
            const getAllTargets = board.getAreaOfEffectPositions(combatant, combatant.position, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.SelfAndAlly);
            const protectedTargets = getAllTargets.filter(AOETarget => { 
                const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
                if(!targetCombatant) {
                    return false;
                }
                return targetCombatant.team.getName() === combatant.team.getName() &&
                 targetCombatant.hasStatusEffect(StatusEffectType.SHIELD_WALL) || targetCombatant.hasStatusEffect(StatusEffectType.SHIELD_WALL_PROTECTED);
            }).length;
            baseValue += protectedTargets * 4;
        }
        if(combatant.hasStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL)) {
            baseValue += this.evaluateArcaneShieldWall(combatant, game, board, movePosition, combatant.position);
            const getAllTargets = board.getAreaOfEffectPositions(combatant, combatant.position, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.SelfAndAlly);
            const protectedTargets = getAllTargets.filter(AOETarget => { 
                const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
                // eslint-disable-next-line
                if(!targetCombatant) {
                    return false;
                }
                return targetCombatant.team.getName() === combatant.team.getName() &&
                 targetCombatant.hasStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL) || targetCombatant.hasStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED);
            }).length;
            baseValue += protectedTargets * 6;
        }
        return baseValue;
    }

    private evaluateShieldBash(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 2;
        baseValue += this.evaluateBasicAttack(combatant, game, board, movePosition, target);
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);

        const originalPosition = combatant.position;
        theoreticalReplacement(combatant, board, movePosition, true);
        const pushResult = board.getPushResult(combatant, targetCombatant!, 2);
        if(pushResult) {
            baseValue += hasBuffBrokenByMove(targetCombatant) ? 3 : 0;
            baseValue += hasStrongsDebuffBrokenByMove(targetCombatant) ? 5 : 0; 
        }
        if(pushResult?.collisionObject) {
            baseValue += 2;
            const collisionCombatant = pushResult.collisionObject;
            let collisionValue = 1;
            collisionValue += isSlightlyInjured(collisionCombatant) ? 0.5 : 0;
            collisionValue += isInjured(collisionCombatant) ? 1 : 0;
            collisionValue += isBadlyInjured(collisionCombatant) ? 1.5 : 0;
            collisionValue += isNearDeath(collisionCombatant) ? 2 : 0;
            baseValue += collisionValue * (collisionCombatant.team.name !== combatant.team.name ? 1 : -1);
        }
        baseValue += isTargetLowLuck(targetCombatant) ? 2 : 0;
        baseValue += isTargetFateStruck(targetCombatant) ? 2 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.STAGGERED) ? -4 : 0;
        theoreticalReplacement(combatant, board, originalPosition, false);
        return baseValue;
    }

    private evaluateGuardian(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);
        let baseValue = 0;
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        baseValue += isFullyHealed(combatant) ? 4 : 0;
        baseValue += isSlightlyInjured(combatant) ? 3 : 0;
        baseValue += isInjured(combatant) ? -2 : 0;
        baseValue += isBadlyInjured(combatant) ? -4 : 0;
        baseValue += isNearDeath(combatant) ? -10 : 0;

        baseValue += isInjured(targetCombatant) ? 1 : 0;
        baseValue += isBadlyInjured(targetCombatant) ? 3 : 0;
        baseValue += isNearDeath(targetCombatant) ? 5 : 0;

        baseValue += isTargetCaster(targetCombatant) ? 3 : 0;
        baseValue += isCombatantMelee(targetCombatant) ? -3 : 0;
        return baseValue;
    }

    private evaluateShieldWall(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.SelfAndAlly);
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant || targetCombatant.team.getName() !== combatant.team.getName()) {
                return;
            }
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.SHIELD_WALL) ? -10 : 0;
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.SHIELD_WALL_PROTECTED) ? -5 : 0;
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL) ? -10 : 0;
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED) ? -5 : 0;
            baseValue += isInjured(targetCombatant) ? 1 : 0;
            baseValue += isBadlyInjured(targetCombatant) ? 2 : 0;
            baseValue += isNearDeath(targetCombatant) ? 3 : 0;
            baseValue += isCombatantCaster(targetCombatant) ? 3 : 0;
            const physWeaknessesNumber = targetCombatant.resistances
            .filter(resistance => resistance.reaction === DamageReaction.WEAKNESS && [DamageType.Crush, DamageType.Pierce, DamageType.Slash].includes(resistance.type)).length;
            baseValue += physWeaknessesNumber * 2;

        });
        return normalizeCoopEvaluation(baseValue + moveValue, 2);
    }

    private evaluateArcaneShieldWall(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.SelfAndAlly);
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant || targetCombatant.team.getName() !== combatant.team.getName()) {
                return;
            }
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL) ? -10 : 0;
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED) ? -5 : 0;
            baseValue += isInjured(targetCombatant) ? 2 : 0;
            baseValue += isBadlyInjured(targetCombatant) ? 4 : 0;
            baseValue += isNearDeath(targetCombatant) ? 6 : 0;
            baseValue += isCombatantCaster(targetCombatant) ? 3 : 0;
            const weaknessesNumber = targetCombatant.resistances
            .filter(resistance => resistance.reaction === DamageReaction.WEAKNESS).length;
            baseValue += weaknessesNumber * 2;

        });
        return normalizeCoopEvaluation(baseValue + moveValue, 3);
    }

    protected evaluateBasicAttack(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined,
        damageType?: DamageType
    ): number {
        let baseValue = super.evaluateBasicAttack(combatant, game, board, movePosition, target, damageType);  
        if(target) {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
            baseValue += isTargetInMelee(combatant, targetCombatant, board) ? 4 : 0;
            baseValue += isFatigued(combatant) ? 2 : 0;
            baseValue += isLowStamina(targetCombatant) ? 4 : 0;
        }
        return baseValue;
    }

    private evaluateBlockingStance(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);
        let baseValue = 2;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        getNearbyEnemies(combatant, board, game).forEach(enemy => {
            if(isCombatantMartial(enemy)) {
                baseValue += 3;
            } else if(isCombatantCaster(enemy)) {
                baseValue -= 3;
            }
        });
        baseValue += isNearDeath(combatant) ? 3 : 0;
        baseValue += isBadlyInjured(combatant) ? 2 : 0;
        baseValue += isInjured(combatant) ? 1 : 0;
        return baseValue;
    }

    private evaluateDefensiveStrike(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);

        let baseValue = 3;
        baseValue += this.evaluateBasicAttack(combatant, game, board, movePosition, target);
        baseValue += areManyEnemiesNearby(combatant, board, game) ? 4 : 0;
        return baseValue;
    }

    private evaluateFortify(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);

        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 4;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += combatant.hasStatusEffect(StatusEffectType.FORTIFIED) ? -2 : 0;
        baseValue += isNearDeath(targetCombatant) ? 2 : 0;
        baseValue += isBadlyInjured(targetCombatant) ? 3 : 0;
        baseValue += isInjured(targetCombatant) ? 2 : 0;
        baseValue += isSlightlyInjured(targetCombatant) ? 1 : 0;
        baseValue += isTargetLowDefense(targetCombatant) ? 2 : 0;
        baseValue += targetCombatant.isExpendable() ? -10 : 0;
        return baseValue;
    }   
}

class VeteranAIAgentHunterPlayer extends VeteranAIAgentGenericPlayer {
    protected getBaseMovementValue(): number {
        return -1;
    }

    protected getBaseSkipValue(): number {
        return super.getBaseSkipValue();
    }

    protected getBaseDefendValue(): number {
        return super.getBaseDefendValue();
    }

    protected getBaseBasicAttackValue(): number {
        return 3;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.BackLine;
    }

    protected getMaxEnemyEffectiveRange(): number {
        return 8;
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        // all that is left is special move  
        const specialMove = turnPlay.playAction.skillName;
        if(specialMove === "Focus Aim") {
            return this.evaluateFocusAim(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Ricochet") {
            return this.evaluateRicochet(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Toxic Arrow") {
            return this.evaluateToxicArrow(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Pin Down") {
            return this.evaluatePinDown(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Plague Arrow") {
            return this.evaluatePlagueArrow(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Snipe Shot") {
            return this.evaluateSnipeShot(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Rain of Arrows") {
            return this.evaluateRainOfArrows(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Brimstone Rain") {
            return this.evaluateBrimstoneRain(combatant, game, board, movePosition, target);
        }
        
        return 0;
    }

    protected evaluateMovement(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
        let baseValue = 0;
       
        const closestEnemy = getClosestEnemy(combatant, board, game);
        if(!closestEnemy) {
            return super.evaluateMovement(combatant, game, board, movePosition);
        }
        const hasLineOfSight = board.hasLineOfSight(movePosition, closestEnemy.position, combatant);
        if(hasLineOfSight) {
            baseValue += super.evaluateMovement(combatant, game, board, movePosition, 8); 
        } else {
            baseValue += super.evaluateMovement(combatant, game, board, movePosition, 2); 
        }

        return baseValue;
    }

    private evaluatePlagueArrow(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Blight);
        if(target) {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
            baseValue += isTargetLowLuck(targetCombatant) ? 2 : 0;
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.PLAGUED) ? -3 : 0;
            baseValue += 2;
            const adjacentCombatants = board.getAdjacentCombatants(targetCombatant, 1);
            adjacentCombatants.forEach(adjacentCombatant => {
                if(!adjacentCombatant.hasStatusEffect(StatusEffectType.PLAGUED) && !isSameTeam(combatant, adjacentCombatant)) {
                    baseValue += 3;
                }
            });
        }
        return normalizeCoopEvaluation(baseValue, 1);
    }

    private evaluateSnipeShot(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target) + 4;
        return baseValue;
    }

    private evaluateRainOfArrows(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.All);
        let baseValue = 0;
        let totalEnemieshit = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Pierce) - moveValue;
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return normalizeCoopEvaluation(baseValue + moveValue, 2);
    }

    private evaluateBrimstoneRain(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.All);
        let baseValue = 0;
        let totalEnemieshit = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            let targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Fire) + 4 - moveValue;
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }

            targetHitValue += isTargetLowLuck(targetCombatant) ? 2 : 0;
            targetHitValue += targetCombatant.hasStatusEffect(StatusEffectType.BURNING) ? -3 : 0;
            targetHitValue += 2;
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return normalizeCoopEvaluation(baseValue + moveValue, 3);
    }

    private evaluateFocusAim(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);

        let baseValue = 3;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += combatant.hasStatusEffect(StatusEffectType.FOCUS_AIM) ? -10 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.STRENGTH_BOOST) ? 2 : 0;
        baseValue += isFarFromEnemies(combatant, board, game) ? 3 : 0;
        return baseValue;
    }

    private evaluateRicochet(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        if(target) {
            const chainTargets = board.getChainTargets(combatant, target, 1, 1);
            chainTargets.forEach(chainTarget => {
                baseValue += this.evaluateBasicAttack(combatant, game, board, movePosition, chainTarget);
            });
        }
        return baseValue;
    }

    private evaluateToxicArrow(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Blight);
        if(target) {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
            baseValue += isTargetLowLuck(targetCombatant) ? 2 : 0;
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.POISONED) ? -3 : 0;
            baseValue += 2;
        }
        return baseValue;
    }

    private evaluatePinDown(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target);
        if(target) {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
            baseValue += isTargetLowLuck(targetCombatant) ? 2 : 0;
            baseValue += isTargetFast(targetCombatant) ? 2 : 0;
            baseValue += isCombatantMelee(targetCombatant) ? 2 : 0;
            baseValue += inEngagementDistance(targetCombatant, combatant.position, board) ? 2 : 0;
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.IMMOBILIZED) ? -6 : 0;
        }
        return baseValue;
    }
}

class VeteranAIAgentHealerPlayer extends VeteranAIAgentGenericPlayer {
    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return super.getBaseSkipValue();
    }

    protected getBaseDefendValue(): number {
        return super.getBaseDefendValue();
    }

    protected getBaseBasicAttackValue(): number {
        return -3;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.MiddleLine;
    }

    protected getMaxEnemyEffectiveRange(): number {
        return 3;
    }

    protected evaluateBasicAttack(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined, damageType?: DamageType, range?: number): number {
        const baseValue = super.evaluateBasicAttack(combatant, game, board, movePosition, target, damageType, range);
        const selfLastSurvivor = isLastSurvivor(combatant);
        const targetCombatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        const targetLastSurvivor = isLastSurvivor(targetCombatant);
        return baseValue + (selfLastSurvivor && targetLastSurvivor ? 5 : 0)
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        const specialMove = turnPlay.playAction.skillName;
        if(specialMove === "Sacred Flame") {
            return this.evaluateSacredFlame(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Regenerate") {
            return this.evaluateRegeneration(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Purify") {
            return this.evaluatePurify(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Heal") {
            return this.evaluateHeal(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Sanctuary") {
            return this.evaluateSanctuary(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Rain of Grace") {
            return this.evaluateRainOfGrace(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Queen's Wrath, Mother's Love") {
            return this.evaluateQueensWrathMothersLove(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Divine Retribution") {
            return this.evaluateDivineRetribution(combatant, game, board, movePosition, target);
        }
        
        return 0;
    }

    private evaluateSanctuary(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 4;
        const targetAlly = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        baseValue += isSlightlyInjured(targetAlly) ? 1 : 0;
        baseValue += isInjured(targetAlly) ? 2 : 0;
        baseValue += isBadlyInjured(targetAlly) ? 3 : 0;
        baseValue += isNearDeath(targetAlly) ? 4 : 0;
        baseValue += isCombatantCaster(targetAlly) ? 5 : 0;
        baseValue += isCombatantNonAttacker(targetAlly) ? 3 : 0;
        baseValue += isEnemyNearby(combatant, board, game) ? 2 : 0;
        baseValue += targetAlly.isExpendable() ? -10 : 0;
        return normalizeCoopEvaluation(baseValue, 1);
    }

    private evaluateRainOfGrace(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.SelfAndAlly);
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant || targetCombatant.team.getName() !== combatant.team.getName()) {
                return;
            }
            const targetGraceValue = this.evaluateHeal(combatant, game, board, movePosition, AOETarget) + 
            this.evaluatePurify(combatant, game, board, movePosition, AOETarget) - (2 * moveValue);
            baseValue += targetGraceValue;
        });
        return normalizeCoopEvaluation(baseValue + moveValue, 2);
    }

    private evaluateQueensWrathMothersLove(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.All);
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            if(isSameTeam(combatant, targetCombatant)) {
                baseValue += this.evaluateHeal(combatant, game, board, movePosition, AOETarget) - moveValue;
            } else {
                baseValue += this.evaluateBasicAttack(combatant, game, board, movePosition, AOETarget, DamageType.Holy) + 6 - moveValue;
            }
        });
        return normalizeCoopEvaluation(baseValue + moveValue, 3);
    }

    private evaluateDivineRetribution(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 4
        const targetEnemy = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += isHighAttackPower(targetEnemy) ? 3 : 0;
        baseValue += isVeryHighAttackPower(targetEnemy) ? 1 : 0;
        baseValue += isCombatantDPS(targetEnemy) ? 2 : 0;
        baseValue += isPowerCharged(targetEnemy) ? 3 : 0;
        baseValue += isCombatantNonAttacker(targetEnemy) ? -8 : 0;
        return normalizeCoopEvaluation(baseValue, 1);
    }

    protected evaluateMovement(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
        const baseValue = super.evaluateMovement(combatant, game, board, movePosition);
        return baseValue + addCoverValue(combatant, game, board, movePosition);
    }

    private evaluateSacredFlame(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Holy);
        baseValue += 4;
        return baseValue;
    }

    private evaluateRegeneration(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);
        let baseValue = 4;
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += isNearDeath(targetCombatant) ? 2 : 0;
        baseValue += isBadlyInjured(targetCombatant) ? 1 : 0;
        baseValue += isInjured(targetCombatant) ? 0.5 : 0;
        baseValue += isSlightlyInjured(targetCombatant) ? 0.25 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.REGENERATING) ? -3 : 0;
        
        baseValue += isTargetFast(targetCombatant) ? 2 : 0;
        baseValue += combatant.name === targetCombatant.name ? -2 : 0;
        baseValue += targetCombatant.isExpendable() ? -30 : 0;
        return baseValue;
    }

    private evaluateHeal(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);
        let baseValue = 4;
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += isNearDeath(targetCombatant) ? 4 : 0;
        baseValue += isBadlyInjured(targetCombatant) ? 3 : 0;
        baseValue += isInjured(targetCombatant) ? 2 : 0;
        baseValue += isSlightlyInjured(targetCombatant) ? 1 : 0;
        baseValue += isFullyHealed(targetCombatant) ? -15 : 0;
        baseValue += isEnemyNearby(targetCombatant, board, game) ? 2 : 0;
        baseValue += targetCombatant.isExpendable() ? -30 : 0;
        return baseValue;
    }

    private evaluatePurify(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {  
        assertTargetIsExists(movePosition, target, board);
        let baseValue = 0;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        const allNegativeStatusEffects = targetCombatant.getStatusEffects()
        .filter((statusEffect) => statusEffect.alignment === StatusEffectAlignment.Negative);
        allNegativeStatusEffects.forEach(statusEffect => {
            baseValue += 4;
            if([StatusEffectType.TAUNTED, StatusEffectType.STUPEFIED,
                 StatusEffectType.NAUSEATED, StatusEffectType.FROZEN].includes(statusEffect.name)) {
                baseValue += 4;
            }
        });
        baseValue += targetCombatant.isExpendable() ? -10 : 0;
        return baseValue;
    }

    
}

class VeteranAIAgentWizardPlayer extends VeteranAIAgentGenericPlayer {
    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return super.getBaseSkipValue();
    }

    protected getBaseDefendValue(): number {
        return super.getBaseDefendValue();
    }

    protected getBaseBasicAttackValue(): number {
        return -8;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.MiddleLine;
    }

    protected getMaxEnemyEffectiveRange(): number {
        return 4;
    }

    protected evaluateMovement(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
        const baseValue = super.evaluateMovement(combatant, game, board, movePosition);
        return baseValue + addCoverValue(combatant, game, board, movePosition);
    }

    protected evaluateBasicAttack(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined, damageType?: DamageType, range?: number): number {
        const baseValue = super.evaluateBasicAttack(combatant, game, board, movePosition, target, damageType, range);
        const selfLastSurvivor = isLastSurvivor(combatant);
        const targetCombatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        const targetLastSurvivor = isLastSurvivor(targetCombatant);
        return baseValue + (selfLastSurvivor && targetLastSurvivor ? 10 : 0)
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;  
        const specialMove = turnPlay.playAction.skillName;
        if(specialMove === "Fireball") {
            return this.evaluateFireball(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Chain Lightning") {
            return this.evaluateChainLightning(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Frozen Burst") {
            return this.evaluateFrozenBurst(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Flame") {
            return this.evaluateFlame(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Arcane Channeling") {
            return this.evaluateArcaneChanneling(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Lightning Bolt") {
            return this.evaluateLightningBolt(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Icicle") {
            return this.evaluateIcicle(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Arcane Conduit") {
            return this.evaluateArcaneConduit(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Arcane Overcharge") {
            return this.evaluateArcaneOvercharge(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Arcane Barrier") {
            return this.evaluateArcaneBarrier(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Teleportation") {
            return this.evaluateTeleportation(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Catastrophic Calamity") {
            return this.evaluateCatastrophicCalamity(combatant, game, board, movePosition, target);
        }

        return Number.NEGATIVE_INFINITY;
    }

    private evaluateArcaneConduit(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateArcaneChanneling(combatant, game, board, movePosition, target) * 3;
        baseValue += combatant.hasStatusEffect(StatusEffectType.ARCANE_CONDUIT) ? -10 : 0;
        baseValue += isFatigued(combatant) ? -4 : 0;
        baseValue += isLowStamina(combatant) ? -6 : 0;
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateArcaneOvercharge(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 6;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += combatant.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE) ? -10 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING) ? 8 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.STRENGTH_BOOST) ? 3 : 0;
        baseValue += isFarFromEnemies(combatant, board, game) ? 5 : 0;
        baseValue += isLowStamina(combatant) ? -3 : 0;
        // add something for enemies being close
        return normalizeCoopEvaluation(baseValue, 1);
    }

    private evaluateArcaneBarrier(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 6;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += isEngaging(combatant, movePosition, board, game) ? 3 : 0;
        baseValue += isSlightlyInjured(combatant) ? 2 : 0;
        baseValue += isInjured(combatant) ? 4 : 0;
        baseValue += isBadlyInjured(combatant) ? 6 : 0;
        baseValue += isNearDeath(combatant) ? 8 : 0;
        baseValue += isEnemyNearby(combatant, board, game) ? 2 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.ARCANE_BARRIER) ? -10 : 0;
        baseValue *= combatant.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE) ? 1.5 : 1;
        baseValue += isFatigued(combatant) ? -2 : 0;
        baseValue += isLowStamina(combatant) ? -4 : 0;
        baseValue += isStaminaDepleted(combatant) ? -6 : 0;
        return normalizeCoopEvaluation(baseValue, 1);
    }

    private evaluateTeleportation(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        baseValue += this.evaluateMovement(combatant, game, board, target!);
        if(combatant.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE)) {
            const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.All);
            let burstValue = 0;
            let totalEnemieshit = 0;
            
            getAllTargets.forEach(AOETarget => {
                const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
                if(!targetCombatant) {
                    return;
                }
                let burstTargetValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Fire) + 10;
                if(combatant.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE)) {
                    burstTargetValue += 6;
                }
                if(targetCombatant.team.getName() !== combatant.team.getName()) {
                    totalEnemieshit += 1;
                }
                burstValue += targetCombatant.team.getName() !== combatant.team.getName() ? burstTargetValue : - burstTargetValue;
            });
            burstValue += totalEnemieshit === 0 ? -10 : 0;
            baseValue += burstValue;
        }
        if(combatant.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING)) {
            baseValue += this.evaluateArcaneBarrier(combatant, game, board, movePosition, target);
        }
        return normalizeCoopEvaluation(baseValue, 1);
    }

    private evaluateCatastrophicCalamity(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Great_Nova, SpecialMoveAlignment.All);
        let baseValue = 0;
        let totalEnemieshit = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Unstoppable) + 25;
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return normalizeCoopEvaluation(baseValue + moveValue, 3);
    }       

    private evaluateFireball(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.All);
        let baseValue = 0;
        let totalEnemieshit = 0;
        
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            let targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Fire) + 10;
            if(combatant.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE)) {
                targetHitValue += 6;
            }
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return baseValue;
    }

    private evaluateChainLightning(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        if(target) {
            const chainTargets = board.getChainTargets(combatant, target, 3, 3);
            chainTargets.forEach(chainTarget => {
                baseValue += this.evaluateBasicAttack(combatant, game, board, movePosition, chainTarget, DamageType.Lightning);
                baseValue += 10;
                if(combatant.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE)) {
                    baseValue += 6;
                }
            });
        }
        return baseValue;
    }

    private evaluateFrozenBurst(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Ice);
        baseValue += 12
        if(target) {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
            baseValue += isTargetLowLuck(targetCombatant) ? 1 : 0;
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.FROZEN) ? -5 : 0;
            baseValue += isTargetDefending(targetCombatant) ? 3 : 0;
            baseValue += isTargetFast(targetCombatant) ? 2 : 0;
            baseValue += isCombatantMelee(targetCombatant) ? 2 : 0;
            if(combatant.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE)) {
                baseValue += 6;
            }
        }
        return baseValue;
    }

    private evaluateFlame(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Fire);
        baseValue += 13
        if(combatant.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE)) {
            baseValue += 6;
        }
        return baseValue;
    }

    private evaluateIcicle(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Ice);
        baseValue += 13
        if(combatant.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE)) {
            baseValue += 6;
        }
        return baseValue;
    }

    private evaluateLightningBolt(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Lightning);
        baseValue += 13
        if(combatant.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE)) {
            baseValue += 6;
        }
        return baseValue;
    }

    private evaluateArcaneChanneling(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        // assertTargetIsExists(movePosition, target, board);

        let baseValue = 6;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += combatant.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING) ? -10 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.ARCANE_OVERCHARGE) ? 6 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.STRENGTH_BOOST) ? 3 : 0;
        baseValue += fatStackOfTargets(combatant, board) ? 5 : 0;
        baseValue += isFarFromEnemies(combatant, board, game) ? 5 : 0;
        baseValue += isLowStamina(combatant) ? -3 : 0;
        // add something for enemies being close
        return baseValue;

        function fatStackOfTargets(combatant: Combatant, board: Board): boolean {
            const closestEnemy = getClosestEnemy(combatant, board, game);
            if(!closestEnemy) {
                return false;
            }
            const enemiesCloseToClosestEnemy = getAlliedCombatantsInRange(closestEnemy, board, 2);
            return enemiesCloseToClosestEnemy.length > 2;
        }
    }
}

class VeteranAIAgentStandardBearerPlayer extends VeteranAIAgentGenericPlayer {
    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return super.getBaseSkipValue();
    }

    protected getBaseDefendValue(): number {
        return super.getBaseDefendValue();
    }

    protected getBaseBasicAttackValue(): number {
        return 1;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.FrontLine;
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        const specialMove = turnPlay.playAction.skillName;
        
        if(specialMove === "Call of Strength") {
            return this.evaluateCallOfStrength(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Call of Vigor") {
            return this.evaluateCallOfVigor(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Encourage") {
            return this.evaluateEncourage(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Rally to the Banner") {
            return this.evaluateRallyToTheBanner(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Strike as One") {
            return this.evaluateStrikeAsOne(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Renewed Strength") {
            return this.evaluateRenewedStrength(combatant, game, board, movePosition, target);
        }

        if(specialMove === "United We Stand") {
            return this.evaluateUnitedWeStand(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Last Stand of Heroes") {
            return this.evaluateLastStandOfHeroes(combatant, game, board, movePosition, target);
        }
        
        return 0;
    }

    private evaluateStrikeAsOne(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target!);
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.Ally);
        const adjacentAllies = getAllTargets.filter(targetPosition => {
            const targetAlly = board.getCombatantAtPosition(targetPosition);
            return targetAlly && targetAlly.team.getIndex() === combatant.team.getIndex();
        });
        baseValue *= (1 + (adjacentAllies.length * 0.25));
        return normalizeCoopEvaluation(baseValue, 1);
    }   

    private evaluateRenewedStrength(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.SelfAndAlly);
        let baseValue = 0;
        // baseValue += isFatigued(combatant) ? 2 : 0;
        // baseValue += isLowStamina(combatant) ? 2 : 0;
        // baseValue += isStaminaDepleted(combatant) ? 2 : 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant || targetCombatant.team.getName() !== combatant.team.getName()) {
                return;
            }
            baseValue += isFatigued(targetCombatant) ? 2 : 0;
            baseValue += isLowStamina(targetCombatant) ? 2 : 0;
            baseValue += isStaminaDepleted(targetCombatant) ? 2 : 0;
        });
        return normalizeCoopEvaluation(baseValue + moveValue, 2);
    }

    private evaluateUnitedWeStand(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.SelfAndAlly);
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += moveValue;
        // baseValue += this.evaluateCallOfStrength(combatant, game, board, movePosition, combatant.position) - moveValue;
        // baseValue += this.evaluateCallOfVigor(combatant, game, board, movePosition, combatant.position) - moveValue;
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant || targetCombatant.team.getName() !== combatant.team.getName()) {
                return;
            }
            baseValue += this.evaluateCallOfStrength(combatant, game, board, movePosition, AOETarget) - moveValue;
            baseValue += this.evaluateCallOfVigor(combatant, game, board, movePosition, AOETarget) - moveValue;
        });
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateLastStandOfHeroes(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 10;
        const gameRound = game.getRoundCount() - 1;
        const remainingActions = game.getActionsRemaining();
        const aliveCombatantsCount = combatant.team.getAliveCombatants().length;
        const initialTeamCount = combatant.team.combatants.length;
        baseValue += gameRound * 4;
        baseValue += (initialTeamCount - remainingActions) * 2;
        baseValue += (initialTeamCount - aliveCombatantsCount) * 6;
        
        return normalizeCoopEvaluation(baseValue, 3);
    }

    protected evaluateBasicAttack(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined,
        damageType?: DamageType
    ): number {
        let baseValue = super.evaluateBasicAttack(combatant, game, board, movePosition, target, damageType);  
        if(target) {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
            baseValue += isTargetInMelee(combatant, targetCombatant, board) ? 4 : 0;
            baseValue += isFatigued(combatant) ? 2 : 0;
            baseValue += isLowStamina(targetCombatant) ? 4 : 0;
            if(isNearDeath(targetCombatant)) {
                const getAllTargets = board.getAreaOfEffectPositions(combatant, target, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.Ally);
                getAllTargets.forEach((targetPosition) => {
                    const targetAlly = board.getCombatantAtPosition(targetPosition);
                    if(!targetAlly || targetAlly.team !== combatant.team) {
                        return;
                    }
                    baseValue += 4;
                });
            }
        }
        return baseValue;
    }

    private evaluateCallOfStrength(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 4;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.STRENGTH_BOOST) ? -6 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.STRENGTH_DOWNGRADE) ? 4 : 0;
        baseValue += isHighAttackPower(targetCombatant) ? 2 : 0;
        baseValue += isVeryHighAttackPower(targetCombatant) ? 2 : 0;
        baseValue += isPowerCharged(targetCombatant) ? 3 : 0;
        baseValue += targetCombatant.isExpendable() ? -10 : 0;
        return baseValue;
    }   

    private evaluateCallOfVigor(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);

        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 4;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.MOBILITY_BOOST) ? -6 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.SLOW) ? 4 : 0;
        baseValue += isTargetFast(targetCombatant) ? 2 : 0;
        baseValue += isTargetCrawlingSlow(targetCombatant) ? 2 : 0;
        const targetDistanceToClosestEnemy = getDistanceToClosestEnemy(targetCombatant, board, game);
        baseValue += targetDistanceToClosestEnemy > targetCombatant.stats.movementSpeed && 
        targetDistanceToClosestEnemy <= targetCombatant.stats.movementSpeed +3 ? 2 : 0;
        baseValue += targetCombatant.isExpendable() ? -10 : 0;
        return baseValue;
    }

    private evaluateEncourage(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);

        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 4;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.ENCOURAGED) ? -3 : 0;
        baseValue += isTargetHighInitiative(targetCombatant) ? 2 : 0;
        baseValue += targetCombatant.stats.luck * 0.5;
        baseValue += targetCombatant.isExpendable() ? -20 : 0;
        return baseValue;
    }

    private evaluateRallyToTheBanner(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.SelfAndAlly);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            if(targetCombatant.team !== combatant.team) {
                return;
            }
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.RALLIED) ? -2 : 0;
            baseValue += !targetCombatant.hasStatusEffect(StatusEffectType.RALLIED) ? 4 : 0;
            baseValue += isTargetLowLuck(targetCombatant) ? 1 : 0;
            baseValue += isTargetLowDefense(targetCombatant) ? 1 : 0;
            baseValue += targetCombatant.isExpendable() ? -5 : 0;
        });
        return baseValue;
    }
    
    
}

class VeteranAIAgentWitchPlayer extends VeteranAIAgentGenericPlayer {

    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return super.getBaseSkipValue();
    }

    protected getBaseDefendValue(): number {
        return super.getBaseDefendValue();
    }

    protected getBaseBasicAttackValue(): number {
        return 1;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.MiddleLine;
    }

    protected getMaxEnemyEffectiveRange(): number {
        return 7;
    }

    protected evaluateMovement(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
        const baseValue = super.evaluateMovement(combatant, game, board, movePosition);
        return baseValue + addCoverValue(combatant, game, board, movePosition);
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        const specialMove = turnPlay.playAction.skillName;
        
        if(specialMove === "Weaken") {
            return this.evaluateWeaken(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Evil Eye") {
            return this.evaluateEvilEye(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Slow") {
            return this.evaluateSlow(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Siphon Energy") {
            return this.evaluateSiphonEnergy(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Grasp of Zirash") {
            return this.evaluateGraspOfZirash(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Soul Scythe") {
            return this.evaluateSoulScythe(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Devour Divinity") {
            return this.evaluateDevourDivinity(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Ultimate Curse") {
            return this.evaluateUltimateCurse(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Hunger of Zirash") {
            return this.evaluateHungerOfZirash(combatant, game, board, movePosition, target);
        }
        
        return 0;
    }

    private evaluateWeaken(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 4;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += combatant.hasStatusEffect(StatusEffectType.STRENGTH_DOWNGRADE) ? -6 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.STRENGTH_BOOST) ? 4 : 0;
        baseValue += isHighAttackPower(targetCombatant) ? 2 : 0;
        baseValue += isVeryHighAttackPower(targetCombatant) ? 2 : 0;
        baseValue += isPowerCharged(targetCombatant) ? 5 : 0;
        baseValue += isLowAttackPower(targetCombatant) ? -2 : 0;
        baseValue += isMemeAttacker(targetCombatant) ?  -10 : 0;
        baseValue += targetCombatant.isExpendable() ? -10 : 0;
        return baseValue;
    }

    private evaluateEvilEye(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.Enemy);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            if(targetCombatant.team.index === combatant.team.index) {
                return;
            }
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.LUCK_DOWNGRADE) ? -4 : 0;
            baseValue += !targetCombatant.hasStatusEffect(StatusEffectType.LUCK_DOWNGRADE) ? 5 : 0;
            baseValue += isTargetLowLuck(targetCombatant) ? 2 : 0;
            baseValue += isTargetHighLuck(targetCombatant) ? 1 : 0;
            baseValue += isVeryHighLuck(targetCombatant) ? 1 : 0;
            baseValue += isLeprechaun(targetCombatant) ? 1 : 0;
            
            baseValue += targetCombatant.isExpendable() ? -5 : 0;
        });
        return baseValue;
    }

    private evaluateSlow(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);

        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 4;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.MOBILITY_BOOST) ? 4 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.SLOW) ? -6 : 0;
        baseValue += isTargetFast(targetCombatant) ? 2 : 0;
        baseValue += isTargetCrawlingSlow(targetCombatant) ? 4 : 0;
        baseValue += isTargetHighAgility(targetCombatant) ? 2 : 0;
        baseValue += targetCombatant.isExpendable() ? -10 : 0;
        return baseValue;
    }

    private evaluateSiphonEnergy(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 2;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += isFatigued(targetCombatant) ? 2 : 0;
        baseValue += isLowStamina(targetCombatant) ? 1 : 0;
        baseValue += isStaminaDepleted(targetCombatant) ? -15 : 0;

        baseValue += isFatigued(combatant) ? 2 : 0;
        baseValue += isLowStamina(combatant) ? 3 : 0;
        baseValue += isStaminaDepleted(combatant) ? 5 : 0;
        baseValue += targetCombatant.isExpendable() ? -4 : 0;
        return baseValue;
    }

    private evaluateGraspOfZirash(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Dark);
        baseValue += 3;
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        const allNegativeStatusEffects = targetCombatant.getStatusEffects()
        .filter((statusEffect) => statusEffect.alignment === StatusEffectAlignment.Negative);
        baseValue = baseValue * (1 + (allNegativeStatusEffects.length * 0.25));
        
        return baseValue;
    }

    private evaluateSoulScythe(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 2;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += isTargetLowLuck(targetCombatant) ? 1 : 0;
        baseValue += isTargetFateStruck(targetCombatant) ? 2 : 0;
        const allNegativeStatusEffectsLength = targetCombatant.getStatusEffects()
        .filter((statusEffect) => statusEffect.alignment === StatusEffectAlignment.Negative).length;
        baseValue = baseValue * (1 + (allNegativeStatusEffectsLength * 2));
        baseValue += isFullyHealed(targetCombatant) ? -1 : 0;
        baseValue += isInjured(combatant) ? 2 : 0;
        baseValue += isBadlyInjured(combatant) ? 2 : 0;
        baseValue += isNearDeath(combatant) ? 1 : 0;
        return normalizeCoopEvaluation(baseValue, 1);
    }

    private evaluateDevourDivinity(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.Enemy);
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant || isSameTeam(combatant, targetCombatant)) {
                return;
            }
            const positiveStatusEffectsLength = targetCombatant.getStatusEffects()
            .filter((statusEffect) => statusEffect.alignment === StatusEffectAlignment.Positive).length;
            baseValue += (positiveStatusEffectsLength * (3)) - moveValue;
        });
        baseValue += isSlightlyInjured(combatant) ? 1 : 0;
        baseValue += isInjured(combatant) ? 3 : 0;
        baseValue += isBadlyInjured(combatant) ? 5 : 0;
        baseValue += isNearDeath(combatant) ? 7 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.STRENGTH_BOOST) ? -4 : 0;
        return normalizeCoopEvaluation(baseValue + moveValue, 2);
    }

    private evaluateUltimateCurse(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += this.evaluateWeaken(combatant, game, board, movePosition, target) - moveValue;
        baseValue += this.evaluateSlow(combatant, game, board, movePosition, target) - moveValue;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.DEFENSE_DOWNGRADE) ? 1 : 5;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.LUCK_DOWNGRADE) ? 1 : 5;
        baseValue += hasMeditateSkill(targetCombatant) ? -10 : 0;
        baseValue += targetCombatant.team.getAliveCombatants().some(combatant => hasPurifySkill(combatant)) ? -6 : 0;
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateHungerOfZirash(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.Enemy);
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant || isSameTeam(combatant, targetCombatant)) {
                return;
            }
            const negativeStatusEffectsLength = targetCombatant.getStatusEffects()
            .filter((statusEffect) => statusEffect.alignment === StatusEffectAlignment.Negative).length;
            baseValue += (this.evaluateBasicAttack(combatant, game, board, movePosition, AOETarget, DamageType.Dark) + 3) - moveValue;
            baseValue += negativeStatusEffectsLength * 5;
        });
        return normalizeCoopEvaluation(baseValue + moveValue, 3);
    }
}

class VeteranAIAgentFoolPlayer extends VeteranAIAgentGenericPlayer {
    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return super.getBaseSkipValue() + 3;
    }

    protected getBaseDefendValue(): number {
        return super.getBaseDefendValue();
    }

    protected getBaseBasicAttackValue(): number {
        return -10;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.BackLine;
    }

    protected getMaxEnemyEffectiveRange(): number {
        return 4;
    }

    protected evaluateMovement(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
        const baseValue = super.evaluateMovement(combatant, game, board, movePosition);
        return baseValue + addCoverValue(combatant, game, board, movePosition);
    }

    protected evaluateSkip(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
        if(combatant.hasStatusEffect(StatusEffectType.MESMERIZING)) {
            return this.evaluateLookeyHere(combatant, game, board, combatant.position, combatant.position) + 
            super.evaluateSkip(combatant, game, board, movePosition);
        }

        if(combatant.hasStatusEffect(StatusEffectType.CIRCUS_DIABOLIQUE)) {
            return this.evaluateCircusDiabolique(combatant, game, board, combatant.position, combatant.position) + 
            super.evaluateSkip(combatant, game, board, movePosition);
        }

        return super.evaluateSkip(combatant, game, board, movePosition);
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        const specialMove = turnPlay.playAction.skillName;
        
        if(specialMove === "Yo Mama!") {
            // XDDDD
            return this.evaluateYoMama(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Stupidest Crap Ever") {
            return this.evaluateStupidestCrapEver(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Smellitt") {
            return this.evaluateSmellitt(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Lookey Here") {
            return this.evaluateLookeyHere(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Nasty Nasty Dolly") {
            return this.evaluateNastyNastyDolly(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Blow a Kiss") {
            return this.evaluateBlowAKiss(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Stand Up Comedy Gone Wrong") {
            return this.evaluateStandUpComedyGoneWrong(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Circus Diabolique") {
            return this.evaluateCircusDiabolique(combatant, game, board, movePosition, target);
        }
        
        return 0;
    }

    private evaluateNastyNastyDolly(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 6;
        baseValue += combatant.isCloaked() ? -25 : 0;
        baseValue += isInjured(combatant) ? 3 : 0;
        baseValue += isBadlyInjured(combatant) ? 5 : 0;
        baseValue += isNearDeath(combatant) ? 7 : 0;
        baseValue += isFatigued(combatant) ? -2 : 0;
        baseValue += isLowStamina(combatant) ? -5 : 0;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        return normalizeCoopEvaluation(baseValue, 1);
    }

    private evaluateBlowAKiss(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 10;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += combatant.hasStatusEffect(StatusEffectType.CHARMED) ? -10 : 0;
        baseValue += isTargetLowLuck(targetCombatant) ? 3 : 0;
        baseValue += isTargetFateStruck(targetCombatant) ? 3 : 0;
        baseValue += isHighAttackPower(targetCombatant) ? 3 : 0;
        baseValue += isVeryHighAttackPower(targetCombatant) ? 3 : 0;
        baseValue += isPowerCharged(targetCombatant) ? 3 : 0;
        baseValue += hasBuffBrokenByMove(targetCombatant) ? 2 : 0;
        baseValue += hasStrongsDebuffBrokenByMove(targetCombatant) ? 3 : 0;
        // melee range of 1 is fine
        baseValue -= (targetCombatant.stats.range - 1);
        baseValue += targetCombatant.isExpendable() ? -30 : 0;
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateStandUpComedyGoneWrong(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += moveValue;
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.Enemy);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            if(targetCombatant.team.index === combatant.team.index) {
                return;
            }
            baseValue += this.evaluateYoMama(combatant, game, board, movePosition, AOETarget) - moveValue;
        });
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateCircusDiabolique(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.CIRCUS_DIABOLIQUE) ? -20 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.MESMERIZING) ? -15 : 0;
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Great_Nova, SpecialMoveAlignment.Enemy);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            if(targetCombatant.team.index === combatant.team.index) {
                return;
            }
            if(targetCombatant.isExpendable()) {
                return;
            }
            let targetHitValue = 12;
            
            targetHitValue += isTargetLowLuck(targetCombatant) ? 9 : 0;
            targetHitValue += isTargetFateStruck(targetCombatant) ? 9 : 0;
            targetHitValue += isNearDeath(targetCombatant) ? 6 : 0;
            baseValue += targetHitValue;
        });
        return normalizeCoopEvaluation(baseValue, 3);
    }

    private evaluateYoMama(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 4;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += combatant.hasStatusEffect(StatusEffectType.TAUNTED) ? -6 : 0;
        baseValue += isTargetLowLuck(targetCombatant) ? 3 : 0;
        baseValue += isTargetFateStruck(targetCombatant) ? 3 : 0;
        baseValue += isTargetSlow(targetCombatant) ? 2 : 0;
        baseValue += isTargetCrawlingSlow(targetCombatant) ? 3 : 0;
        baseValue += isTargetCaster(targetCombatant) ? 3 : 0;
        baseValue += hasBuffBrokenByMove(targetCombatant) ? 2 : 0;
        baseValue += hasStrongsDebuffBrokenByMove(targetCombatant) ? 3 : 0;
        // melee range of 1 is fine
        baseValue -= (targetCombatant.stats.range - 1);
        baseValue += targetCombatant.isExpendable() ? -20 : 0;
        return baseValue;
    }

    private evaluateStupidestCrapEver(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Line, SpecialMoveAlignment.Enemy);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            if(targetCombatant.team.index === combatant.team.index) {
                return;
            }
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.STUPEFIED) ? -6 : 0;
            baseValue += !targetCombatant.hasStatusEffect(StatusEffectType.STUPEFIED) ? 5 : 0;
            baseValue += isTargetLowLuck(targetCombatant) ? 3 : 0;
            baseValue += isTargetCaster(targetCombatant) ? 3 : 0;
            baseValue += isCombatantMartial(targetCombatant) ? -2 : 0;
            baseValue += targetCombatant.isExpendable() ? -5 : 0;
        });
        return baseValue;
    }

    private evaluateSmellitt(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.All);
        let baseValue = 0;
        let totalEnemieshit = 0;
        
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            let targetHitValue = 6;
            targetHitValue += isTargetLowLuck(targetCombatant) ? 3 : 0;
            targetHitValue += isTargetFateStruck(targetCombatant) ? 3 : 0;
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
            baseValue += targetCombatant.isExpendable() ? -5 : 0;
        });
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return baseValue;
    }
    
    private evaluateLookeyHere(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.CIRCUS_DIABOLIQUE) ? -20 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.MESMERIZING) ? -15 : 0;

        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Great_Nova, SpecialMoveAlignment.Enemy);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            if(targetCombatant.team.index === combatant.team.index) {
                return;
            }
            let targetHitValue = 6;
            targetHitValue += isTargetLowLuck(targetCombatant) ? 3 : 0;
            targetHitValue += isTargetFateStruck(targetCombatant) ? 3 : 0;
            baseValue += targetHitValue;
            baseValue += targetCombatant.isExpendable() ? -7 : 0;
        });
        return baseValue;
    }

}

class VeteranAIAgentPikemanPlayer extends VeteranAIAgentGenericPlayer {
    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return super.getBaseSkipValue();
    }

    protected getBaseDefendValue(): number {
        return super.getBaseDefendValue();
    }

    protected getBaseBasicAttackValue(): number {
        return 4;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.FrontLine;
    }
    
    protected getMaxEnemyEffectiveRange(): number {
        return 2;
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        const specialMove = turnPlay.playAction.skillName;
        
        if(specialMove === "Skewer") {
            return this.evaluateSkewer(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Gaping Stab") {
            return this.evaluateGapingStab(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Haft Strike") {
            return this.evaluateHaftStrike(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Cold Edge") {
            return this.evaluateColdEdge(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Skewering Harppon") {
            return this.evaluateSkeweringHarppon(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Diamond Hook") {
            return this.evaluateDiamondHook(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Shatter Steel") {
            return this.evaluateShatterSteel(combatant, game, board, movePosition, target);
        }
        
        return 0;
    }

    private evaluateColdEdge(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += moveValue;
        const originalPosition = combatant.position;
        let totalEnemieshit = 0;
        theoreticalReplacement(combatant, board, movePosition, true);
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!,
             SpecialMoveAreaOfEffect.Line, SpecialMoveAlignment.All);

        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            const targetHitValue = 3 + this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Ice) - moveValue;
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        theoreticalReplacement(combatant, board, originalPosition, false);
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return normalizeCoopEvaluation(baseValue + moveValue, 1);
    }

    private evaluateSkeweringHarppon(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Line, SpecialMoveAlignment.All);
        let baseValue = 0;
        let totalEnemieshit = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Pierce) - moveValue;
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return normalizeCoopEvaluation(baseValue + moveValue, 2);
    }

    private evaluateDiamondHook(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += this.evaluateBasicAttack(combatant, game, board, movePosition, target) - 2;
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);

        const originalPosition = combatant.position;
        theoreticalReplacement(combatant, board, movePosition, true);
        const pullResult = board.getPullResult(combatant, targetCombatant!, 5);
        if(pullResult) {
            baseValue += 6;
            const attackValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target) - moveValue;
            baseValue += attackValue * (pullResult.pullDistance * 0.1);
            baseValue += isCombatantMartial(targetCombatant) ? 2 : 0;
            baseValue += isCombatantNonAttacker(targetCombatant) ? -2 : 0;
            baseValue += hasBuffBrokenByMove(targetCombatant) ? 3 : 0;
            baseValue += hasStrongsDebuffBrokenByMove(targetCombatant) ? 5 : 0; 
        }
        theoreticalReplacement(combatant, board, originalPosition, false);
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateShatterSteel(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target) + 6;
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.FULL_METAL_JACKET) ? 3 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.FORTIFIED) ? 3 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.STRENGTH_BOOST) ? 3 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.STRENGTH_DOWNGRADE) ? -3 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.STRENGTH_DOWNGRADE) ? -3 : 0;
        return normalizeCoopEvaluation(baseValue, 1);
    }


    private evaluateSkewer(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += moveValue;
        const originalPosition = combatant.position;
        let totalEnemieshit = 0;
        theoreticalReplacement(combatant, board, movePosition, true);
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!,
             SpecialMoveAreaOfEffect.Line, SpecialMoveAlignment.All);

        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position);
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        theoreticalReplacement(combatant, board, originalPosition, false);
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return baseValue;
    }
    
    private evaluateGapingStab(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target);
        if(target) {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
            baseValue += isTargetLowLuck(targetCombatant) ? 2 : 0;
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.BLEEDING) ? -3 : 0;
            baseValue += 2;
        }
        return baseValue;
    }

    private evaluateHaftStrike(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Crush, 1);
        if(target) {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
            baseValue += isTargetLowLuck(targetCombatant) ? 2 : 0;
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.STAGGERED) ? -3 : 0;
        }
        return baseValue;
    }
    
}

class VeteranAIAgentVanguardPlayer extends VeteranAIAgentGenericPlayer {
    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return super.getBaseSkipValue();
    }

    protected getBaseDefendValue(): number {
        return super.getBaseDefendValue();
    }

    protected getBaseBasicAttackValue(): number {
        return 6;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.FrontLine;
    }

    protected evaluateBasicAttack(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined,
        damageType?: DamageType
    ): number {
        let baseValue = super.evaluateBasicAttack(combatant, game, board, movePosition, target, damageType);
        const targetCombatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        if(targetCombatant && targetCombatant.hasStatusEffect(StatusEffectType.FIRST_STRIKE) &&
            !targetCombatant.hasStatusEffect(StatusEffectType.STRUCK_FIRST) &&
            isTargetInMelee(movePosition, targetCombatant, board)) {
            baseValue -= 5;
        }
        return baseValue;
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        const specialMove = turnPlay.playAction.skillName;
        
        if(specialMove === "Unstoppable Charge") {
            return this.evaluateUnstoppableCharge(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Feral Swing") {
            return this.evaluateFeralSwing(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Shield Breaker") {
            return this.evaluateShieldBreaker(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Rampage") {
            return this.evaluateRampage(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Sky Sovereign's Wrath") {
            return this.evaluateSkySovereignsWrath(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Whirlwind Attack") {
            return this.evaluateWhirlwindAttack(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Frenzy") {
            return this.evaluateFrenzy(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Hell Scream") {
            return this.evaluateHellScream(combatant, game, board, movePosition, target);
        }
        
        return 0;
    }

    private evaluateSkySovereignsWrath(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += moveValue;
        const originalPosition = combatant.position;
        let totalEnemieshit = 0;
        theoreticalReplacement(combatant, board, movePosition, true);
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!,
             SpecialMoveAreaOfEffect.Line, SpecialMoveAlignment.All);

        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Lightning);
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        theoreticalReplacement(combatant, board, originalPosition, false);
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return normalizeCoopEvaluation(baseValue + moveValue, 1);
    }

    private evaluateWhirlwindAttack(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += moveValue;
        const originalPosition = combatant.position;
        let totalEnemieshit = 0;
        theoreticalReplacement(combatant, board, movePosition, true);
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!,
             SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.All);

        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position);
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        theoreticalReplacement(combatant, board, originalPosition, false);
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return normalizeCoopEvaluation(baseValue + moveValue, 2);
    }

    private evaluateFrenzy(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += moveValue;
        baseValue += isSlightlyInjured(combatant) ? 2 : 0;
        baseValue += isInjured(combatant) ? 4 : 0;
        baseValue += isBadlyInjured(combatant) ? 7 : 0;
        baseValue += isNearDeath(combatant) ? 10 : 0;
        const originalPosition = combatant.position;
        theoreticalReplacement(combatant, board, movePosition, true);
        const nearbyEnemies = getAdjacentEnemies(combatant, board, game);
        const nearbyAllies = getNearbyAllies(combatant, board, game);
        baseValue += nearbyEnemies.length * 4;
        baseValue += -(nearbyAllies.length * 5);
        theoreticalReplacement(combatant, board, originalPosition, false);
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateHellScream(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);

        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.Enemy);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant || targetCombatant.team.getIndex() === combatant.team.getIndex() ) {
                return;
            }
            
            let targetHitValue = 3;
            targetHitValue += combatant.hasStatusEffect(StatusEffectType.PANICKED) ? -6 : 0;
            targetHitValue += isTargetLowLuck(targetCombatant) ? 3 : 0;
            targetHitValue += isTargetFateStruck(targetCombatant) ? 2 : 0;
            targetHitValue += isTargetHighLuck(targetCombatant) ? -1 : 0;
            targetHitValue += isVeryHighLuck(targetCombatant) ? -2 : 0;
            targetHitValue += isLeprechaun(targetCombatant) ? -3 : 0;
            targetHitValue += hasBuffBrokenByMove(targetCombatant) ? 2 : 0;
            targetHitValue += hasStrongsDebuffBrokenByMove(targetCombatant) ? 3 : 0;
            targetHitValue += targetCombatant.isExpendable() ? -10 : 0;
            baseValue += targetHitValue;
        });
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateUnstoppableCharge(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const chargeEndPosition = board.getMovingAttackEndPosition(combatant, target!, 5);
        const distance = board.getDistanceBetweenPositions(combatant.position, chargeEndPosition);
        let baseValue = this.evaluateBasicAttack(combatant, game, board, chargeEndPosition, target);
        baseValue += distance * 0.15;
        return baseValue;
    }
    
    private evaluateFeralSwing(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += moveValue;
        const originalPosition = combatant.position;
        let totalEnemieshit = 0;
        theoreticalReplacement(combatant, board, movePosition, true);
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Cone, SpecialMoveAlignment.All);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position);
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        theoreticalReplacement(combatant, board, originalPosition, false);
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return baseValue;
    }

    private evaluateShieldBreaker(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);

        let baseValue = -1;
        baseValue += this.evaluateBasicAttack(combatant, game, board, movePosition, target);
        baseValue += combatant.hasStatusEffect(StatusEffectType.FORTIFIED) ? 2 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.ARCANE_BARRIER) ? 3 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.SHIELD_WALL) ? 4 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.SHIELD_WALL_PROTECTED) ? 2 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL) ? 6 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.ARCANE_SHIELD_WALL_PROTECTED) ? 3 : 0;
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        baseValue += isNearDeath(targetCombatant) ? -2 : 0;
        baseValue += isBadlyInjured(targetCombatant) ? -1 : 0;
        baseValue += isInjured(targetCombatant) ? -0.5 : 0;
        baseValue += isFullyHealed(targetCombatant) ? 1 : 0;
        baseValue += isTargetLowDefense(targetCombatant) ? -1 : 0;
        baseValue += isTargetHighDefense(targetCombatant) ? 3 : 0;
        baseValue += isTargetDefending(targetCombatant) ? 4 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.DEFENSE_DOWNGRADE) ? -3 : 0;
        return baseValue;
    }

    private evaluateRampage(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += moveValue;
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        for(let i = 0; i < 3; i++) {
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.RIPOSTE) ? -5 : 0;
            baseValue += (0.75 * this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position)) - moveValue;
        }
        return baseValue;
    }
}

class VeteranAIAgentFistWeaverPlayer extends VeteranAIAgentGenericPlayer {
    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return super.getBaseSkipValue();
    }

    protected getBaseDefendValue(): number {
        return super.getBaseDefendValue();
    }

    protected getBaseBasicAttackValue(): number {
        return 4;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.FrontLine;
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        const specialMove = turnPlay.playAction.skillName;
        
        if(specialMove === "Wind Run Assault") {
            return this.evaluateWindRunAssault(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Titanic Fist") {
            return this.evaluateTitanicFist(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Meditate") {
            return this.evaluateMeditate(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Angelic Touch") {
            return this.evaluateAngelicTouch(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Swapping Gale") {
            return this.evaluateSwappingGale(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Moon Beam") {
            return this.evaluateMoonBeam(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Lightning Kicks") {
            return this.evaluateLightningKicks(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Idai no Hadou") {
            return this.evaluateIdaiNoHadou(combatant, game, board, movePosition, target);
        }

        
        return 0;
    }

    private evaluateAngelicTouch(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Holy);
        baseValue += 8;
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        baseValue += isTargetLowLuck(targetCombatant) ? 2 : 0;
        return baseValue;
    }

    private evaluateSwappingGale(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        // not sure about how to evaluate this for now
        return 0;
    }

    private evaluateMoonBeam(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += moveValue;
        const originalPosition = combatant.position;
        let totalEnemieshit = 0;
        theoreticalReplacement(combatant, board, movePosition, true);
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!,
             SpecialMoveAreaOfEffect.Line, SpecialMoveAlignment.All);

        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Holy) + 3;
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        theoreticalReplacement(combatant, board, originalPosition, false);
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateLightningKicks(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += moveValue;
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        for(let i = 0; i < 3; i++) {
            baseValue += (this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position)) - 1 - moveValue;
        }
        let lightningHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Lightning) - 1 - moveValue;
        lightningHitValue = (Math.pow(0.9,3)) * lightningHitValue;
        baseValue += lightningHitValue;
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateIdaiNoHadou(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {

        let baseValue = 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.IDAI_NO_HADOU) ? -10 : 0;
        baseValue += this.evaluateMeditate(combatant, game, board, movePosition, target);
        baseValue += isFatigued(combatant) ? 2 : 0;
        baseValue += isLowStamina(combatant) ? 3 : 0;
        // for agility
        baseValue += 4;
        baseValue += isTargetFast(combatant) ? 2 : 0;
        baseValue += isTargetCrawlingSlow(combatant) ? 2 : 0;
        const targetDistanceToClosestEnemy = getDistanceToClosestEnemy(combatant, board, game);
        baseValue += targetDistanceToClosestEnemy > combatant.stats.movementSpeed && 
        targetDistanceToClosestEnemy <= combatant.stats.movementSpeed +3 ? 2 : 0;
        // for luck
        baseValue += 6;

        // unlocking angelic touch 
        baseValue += 6;
        
        return normalizeCoopEvaluation(baseValue, 3);
    }

    private evaluateWindRunAssault(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        if(!target) {
            throw new Error("Target is undefined in wind run assault");
        }
        
        let baseValue = 0;
        const chargeEndPosition = board.getMovingAttackEndPosition(combatant, target, 5);
        baseValue += this.evaluateBasicAttack(combatant, game, board, chargeEndPosition, target);
        return baseValue;
    }

    private evaluateTitanicFist(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        baseValue += this.evaluateBasicAttack(combatant, game, board, movePosition, target);
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);

        const originalPosition = combatant.position;
        theoreticalReplacement(combatant, board, movePosition, true);
        const pushResult = board.getPushResult(combatant, targetCombatant!, 3);
        if(pushResult) {
            baseValue += hasBuffBrokenByMove(targetCombatant) ? 3 : 0;
            baseValue += hasStrongsDebuffBrokenByMove(targetCombatant) ? 5 : 0; 
        }
        if(pushResult?.collisionObject) {
            baseValue += 2;
            const collisionCombatant = pushResult.collisionObject;
            let collisionValue = 1;
            collisionValue += isSlightlyInjured(collisionCombatant) ? 0.5 : 0;
            collisionValue += isInjured(collisionCombatant) ? 1 : 0;
            collisionValue += isBadlyInjured(collisionCombatant) ? 1.5 : 0;
            collisionValue += isNearDeath(collisionCombatant) ? 2 : 0;
            baseValue += collisionValue * (collisionCombatant.team.name !== combatant.team.name ? 1 : -1);
        }
        theoreticalReplacement(combatant, board, originalPosition, false);
        return baseValue;
    }

    private evaluateMeditate(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 2;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += isFullyHealed(combatant) ? -2 : 0;
        baseValue += isSlightlyInjured(combatant) ? 0.5 : 0;
        baseValue += isInjured(combatant) ? 1 : 0;
        baseValue += isBadlyInjured(combatant) ? 2.5 : 0;
        baseValue += isNearDeath(combatant) ? 5 : 0;
        const allNegativeStatusEffects = combatant.getStatusEffects()
        .filter((statusEffect) => statusEffect.alignment === StatusEffectAlignment.Negative);
        allNegativeStatusEffects.forEach(statusEffect => {
            baseValue += 4;
            if([StatusEffectType.TAUNTED, StatusEffectType.STUPEFIED,
                 StatusEffectType.NAUSEATED, StatusEffectType.FROZEN].includes(statusEffect.name)) {
                baseValue += 4;
            }
        });
        return baseValue;
    }
}

class VeteranAIAgentRoguePlayer extends VeteranAIAgentGenericPlayer {

    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return super.getBaseSkipValue();
    }

    protected getBaseDefendValue(): number {
        return super.getBaseDefendValue();
    }

    protected getBaseBasicAttackValue(): number {
        return 3;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.BackLine;
    }

    protected evaluateBasicAttack(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined,
        damageType?: DamageType
    ): number {
        let baseValue = super.evaluateBasicAttack(combatant, game, board, movePosition, target, damageType);  
        if(target) {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
            baseValue *= combatant.isCloaked() ? 1.25 : 1;
            baseValue *= targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_PAIN) ? 1.25 : 1;
            baseValue *= targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_EXECUTION) ? 1.5 : 1;
            baseValue *= targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_OBLIVION) ? 2 : 1;
        }
        return baseValue;
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        const specialMove = turnPlay.playAction.skillName;
        
        if(specialMove === "Shadow Step") {
            return this.evaluateShadowStep(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Viper's Kiss") {
            return this.evaluateVipersKiss(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Sneak Attack") {
            return this.evaluateSneakAttack(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Assassin's Mark") {
            return this.evaluateAssassinsMark(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Blood Rite") {
            return this.evaluateBloodRite(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Forbidden Art") {
            return this.evaluateForbiddenArt(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Dance of Daggers") {
            return this.evaluateDanceOfDaggers(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Karithras Boon") {
            return this.evaluateKarithrasBoon(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Sleeping Dart") {
            return this.evaluateSleepingDart(combatant, game, board, movePosition, target);
        }

        return 0;
    }

    private evaluateSleepingDart(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 6;
        assertTargetIsExists(movePosition, target, board);
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.SLEEPING) ? -8 : 0;
        baseValue += isTargetLowLuck(targetCombatant) ? 2 : 0;
        baseValue += combatant.isCloaked() ? 2 : 0;

        return normalizeCoopEvaluation(baseValue, 1);
    }

    private evaluateBloodRite(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;

        assertTargetIsExists(movePosition, target, board);
        const sacrificialLamb = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        const lifeAmount = sacrificialLamb.baseStats.hp;
        baseValue += isFullyHealed(sacrificialLamb) ? -8 : 0;
        baseValue += isSlightlyInjured(sacrificialLamb) ? -6 : 0;
        baseValue += isInjured(sacrificialLamb) ? -4 : 0;
        baseValue += isBadlyInjured(sacrificialLamb) ? -2 : 0;
        baseValue += isNearDeath(sacrificialLamb) ? -1 : 0;
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.SelfAndAlly);
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant || targetCombatant.team.getName() !== combatant.team.getName()) {
                return;
            }

            baseValue += isNearDeath(targetCombatant) ? 4 : 0;
            baseValue += isBadlyInjured(targetCombatant) ? 3 : 0;
            baseValue += isInjured(targetCombatant) ? 2 : 0;
            baseValue += isSlightlyInjured(targetCombatant) ? 1 : 0;
            baseValue += isFullyHealed(targetCombatant) ? -10 : 0;
            baseValue += isEnemyNearby(combatant, board, game) ? 2 : 0;
            
            baseValue += lifeAmount * 0.1;
        });
        return normalizeCoopEvaluation(baseValue + moveValue, 2);
    }

    private evaluateForbiddenArt(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 4;
        baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Dark);
        if(target) {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.FORBIDDEN_AFFLICTION) ? -5 : 0;
            baseValue += isTargetFast(targetCombatant) ? 4 : 0;
            baseValue += isHighAttackPower(targetCombatant) ? 3 : 0;
            baseValue += isVeryHighAttackPower(targetCombatant) ? 3 : 0;
            baseValue += isPowerCharged(targetCombatant) ? 3 : 0;
            baseValue += [CombatantType.Wizard, CombatantType.Hunter, CombatantType.Vanguard, CombatantType.Pikeman].includes(targetCombatant.getCombatantType()) ? 5 : 0;
            baseValue += [CombatantType.Healer, CombatantType.Fool].includes(targetCombatant.getCombatantType()) ? -5 : 0;
        }
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateDanceOfDaggers(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        const moveValue = this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += moveValue;
        const originalPosition = combatant.position;
        let totalEnemieshit = 0;
        theoreticalReplacement(combatant, board, movePosition, true);
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!,
             SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.All);

        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position);
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.BLEEDING) ? -4 : 4;
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        theoreticalReplacement(combatant, board, originalPosition, false);
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return normalizeCoopEvaluation(baseValue + moveValue, 2);
    }

    private evaluateKarithrasBoon(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {   
        // let baseValue = this.evaluateSneakAttack(combatant, game, board, movePosition, target)
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target);
        if(combatant.hasStatusEffect(StatusEffectType.CLOAKED)) {
            baseValue *= 2;
        }
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        baseValue += 20 - (targetCombatant.baseStats.hp * 0.1);
        baseValue += isFullyHealed(targetCombatant) ? 8 : 0;
        baseValue += isSlightlyInjured(targetCombatant) ? 6 : 0;
        baseValue += isInjured(targetCombatant) ? 4 : 0;
        baseValue += isBadlyInjured(targetCombatant) ? 2 : 0;
        baseValue += 6;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_PAIN) ? 6 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_EXECUTION) ? 9 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_OBLIVION) ? 12 : 0;
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateShadowStep(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 12;
        baseValue += combatant.isCloaked() ? -25 : 0;
        baseValue += isInjured(combatant) ? 3 : 0;
        baseValue += isBadlyInjured(combatant) ? 5 : 0;
        baseValue += isNearDeath(combatant) ? 7 : 0;
        baseValue += isFatigued(combatant) ? -2 : 0;
        baseValue += isLowStamina(combatant) ? -5 : 0;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        return baseValue;
    }

    private evaluateVipersKiss(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Blight);
        if(target) {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
            baseValue += isTargetLowLuck(targetCombatant) ? 2 : 0;
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.POISONED) ? -3 : 0;
            baseValue += 2;
        }
        return baseValue;
    }

    private evaluateSneakAttack(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        baseValue += this.evaluateBasicAttack(combatant, game, board, movePosition, target);
        
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        if(board.isFlanked(targetCombatant) || combatant.isCloaked()) {
            baseValue *= 1.5;
        }
        return baseValue;
    }

    private evaluateAssassinsMark(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 3;
        baseValue += game.getActionsRemaining() > 0.5 ? 2 : 0;
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_PAIN) ? 1 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_EXECUTION) ? 2 : 0;
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.MARKED_FOR_OBLIVION) ? -15 : 0;
        baseValue += combatant.isCloaked() ? 4 : 0;
        baseValue += !combatant.isCloaked() && isInjured(combatant) ? -3 : 0;
        baseValue += !combatant.isCloaked() && isBadlyInjured(combatant) ? -5 : 0;
        baseValue += !combatant.isCloaked() && isNearDeath(combatant) ? -7 : 0;
        baseValue += targetCombatant.isExpendable() ? -5 : 0;
        return baseValue;
    }
    
}

class VeteranAIAgentArtificerPlayer extends VeteranAIAgentGenericPlayer {
    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return super.getBaseSkipValue();
    }

    protected getBaseDefendValue(): number {
        return super.getBaseDefendValue();
    }

    protected getBaseBasicAttackValue(): number {
        return -1;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.BackLine;
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        const specialMove = turnPlay.playAction.skillName;
        
        if(specialMove === "Build Walls") {
            return this.evaluateBuildWalls(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Deploy Boom Gremlin") {
            return this.evaluateDeployBoomGremlin(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Shocking Gauntlet") {
            return this.evaluateShockingGauntlet(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Full Metal Jacket") {
            return this.evaluateFullMetalJacket(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Reinforce Construct") {
            return this.evaluateReinforceConstruct(combatant, game, board, movePosition, target);
        }

        // co ops

        if(specialMove === "Deploy Ballista Turret") {
            return this.evaluateDeployBallistaTurret(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Flame Thrower") {
            return this.evaluateFlameThrower(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Ingenious Upgrade") {
            return this.evaluateIngeniousUpgrade(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Build Death Tower") {
            return this.evaluateBuildDeathTower(combatant, game, board, movePosition, target);
        }

            
        return 0;
    }

    protected evaluateMovement(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
        const baseValue = super.evaluateMovement(combatant, game, board, movePosition);
        return baseValue + addCoverValue(combatant, game, board, movePosition);
    }

    private evaluateBuildWalls(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        const originalPosition = combatant.position;
        theoreticalReplacement(combatant, board, movePosition, true);

        const wallBadCTypes = [
             CombatantType.Vanguard, CombatantType.Defender, CombatantType.Pikeman,
             CombatantType.Hunter, CombatantType.StandardBearer,CombatantType.BallistaTurret, CombatantType.Rogue,
        ];

        const wallGoodTypes = [
            CombatantType.Wizard, CombatantType.Artificer, CombatantType.Witch, CombatantType.Fool, CombatantType.Healer,
            CombatantType.BabyBabel
        ];
        
        let team1WallValue = 0;
        let team2WallValue = 0;

        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Line, SpecialMoveAlignment.Empty_Space);
        getAllTargets.forEach(AOETarget => {
            const team1Combatants = game.teams[0].getAliveCombatants();
            const team2Combatants = game.teams[1].getAliveCombatants();
            for(let i = 0; i < team1Combatants.length; i++) {
                for(let j = 0; j < team2Combatants.length; j++) {
                    if(board.isPositionBetweenPositions(team1Combatants[i].position,team2Combatants[j].position, AOETarget)) {
                        const team1Combatant = team1Combatants[i];
                        const team2Combatant = team2Combatants[j];
                        if(wallBadCTypes.includes(team1Combatant.getCombatantType())) {
                            team1WallValue -= 3;
                        }
                        if(wallGoodTypes.includes(team1Combatant.getCombatantType())) {
                            team1WallValue += 3;
                        }
                        if(wallBadCTypes.includes(team2Combatant.getCombatantType())) {
                            team2WallValue -= 3;
                        }
                        if(wallGoodTypes.includes(team2Combatant.getCombatantType())) {
                            team2WallValue += 3;
                        }
                    }
                }
            }    
        });
        if(combatant.team.getName() === game.teams[0].getName()) {
            baseValue += team1WallValue - team2WallValue;
        } else {
            baseValue += team2WallValue - team1WallValue;
        }
        theoreticalReplacement(combatant, board, originalPosition, false);
        return baseValue;
    }

    private evaluateDeployBoomGremlin(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        if(!target) {
            return 0;
        }
        let baseValue = 5;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        const originalPosition = combatant.position;
        theoreticalReplacement(combatant, board, target, true);

        const adjacentAllies = board.getAdjacentCombatants(combatant, 1).filter(c => c.team.getName() === combatant.team.getName()).length; 

        baseValue -= adjacentAllies * 3;
        
        const nearbyEnemies = getNearbyEnemies(combatant, board, game);

        baseValue += nearbyEnemies.length * 4;

        theoreticalReplacement(combatant, board, originalPosition, false);
        return baseValue;
    }

    private evaluateShockingGauntlet(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Lightning, 1) + 4;
        if(target) {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
            baseValue += isTargetLowLuck(targetCombatant) ? 1 : 0;
            baseValue += isTargetFateStruck(targetCombatant) ? 1 : 0;
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.STAGGERED) ? -2 : 2;
        }
        return baseValue;
    }

    private evaluateFullMetalJacket(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);

        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 4;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += combatant.hasStatusEffect(StatusEffectType.FULL_METAL_JACKET) ? -5 : 0;
        baseValue += isNearDeath(targetCombatant) ? 2 : 0;
        baseValue += isBadlyInjured(targetCombatant) ? 1 : 0;
        baseValue += isInjured(targetCombatant) ? 1 : 0;
        baseValue += isTargetLowDefense(targetCombatant) ? 2 : 0;
        if([DamageType.Crush, DamageType.Pierce, DamageType.Slash].includes(targetCombatant.basicAttack().type)) {
            baseValue += 2;
            baseValue += isHighAttackPower(targetCombatant) ? 2 : 0;
            baseValue += isVeryHighAttackPower(targetCombatant) ? 2 : 0;
            baseValue += isPowerCharged(targetCombatant) ? 3 : 0;
        }
        if(targetCombatant.resistances.find(r => r.type === DamageType.Lightning)?.reaction === DamageReaction.RESISTANCE) {
            baseValue -= 5;
        }
        if(targetCombatant.resistances.find(r => r.type === DamageType.Lightning)?.reaction === DamageReaction.NONE) {
            baseValue -= 3;
        }
        return baseValue;
    }

    private evaluateReinforceConstruct(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Cross, SpecialMoveAlignment.Ally);
        getAllTargets.forEach(AOETarget => {
            let healValue = 2;
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return; 
            }
            if(targetCombatant.team !== combatant.team) {
                return;
            }
            if(!targetCombatant.isConstruct()) {
                return;
            }
            healValue += isNearDeath(targetCombatant) ? 4 : 0;
            healValue += isBadlyInjured(targetCombatant) ? 3 : 0;
            healValue += isInjured(targetCombatant) ? 2 : 0;
            healValue += isSlightlyInjured(targetCombatant) ? 1 : 0;
            healValue += isFullyHealed(targetCombatant) ? -10 : 0;
            healValue += isEnemyNearby(combatant, board, game) ? 2 : 0;
            healValue /= targetCombatant.isExpendable() ? 2 : 1;
            baseValue += healValue;
        });
        return baseValue;
    }

    private evaluateDeployBallistaTurret(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 14;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        
        const ballisteExists = combatant.team.getAliveCombatants().filter(c => c.getCombatantType() === CombatantType.BallistaTurret).length > 1;
        if(ballisteExists) {
            baseValue -= 100;
        }

        const closestEnemy = getClosestEnemy(combatant, board, game);
        const hasLineOfSight = closestEnemy && board.hasLineOfSight(movePosition, closestEnemy.position, combatant);
        if(hasLineOfSight || board.getDistanceBetweenPositions(target!, closestEnemy.position) <= 4) {
            baseValue += 20;
        }
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateFlameThrower(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        const originalPosition = combatant.position;
        let totalEnemieshit = 0;
        theoreticalReplacement(combatant, board, movePosition, true);
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!,
             SpecialMoveAreaOfEffect.Line, SpecialMoveAlignment.All);

        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Fire);
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        theoreticalReplacement(combatant, board, originalPosition, false);
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return normalizeCoopEvaluation(baseValue, 2);
    }

    private evaluateIngeniousUpgrade(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);

        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 2;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += combatant.hasStatusEffect(StatusEffectType.INGENIOUS_UPGRADE) ? -6 : 0;
        baseValue += isHighAttackPower(targetCombatant) ? 2 : 0;
        baseValue += isVeryHighAttackPower(targetCombatant) ? 2 : 0;
        baseValue += isPowerCharged(targetCombatant) ? 3 : 0;
        baseValue += targetCombatant.getCombatantType() === CombatantType.BabyBabel ? 7 : 0;
        baseValue += targetCombatant.getCombatantType() === CombatantType.BallistaTurret ? 5 : 0;
        baseValue += targetCombatant.getCombatantType() === CombatantType.Bomb ? 4 : 0;
        baseValue += !targetCombatant.isExpendable() && targetCombatant.hasStatusEffect(StatusEffectType.FULL_METAL_JACKET) ? 2 : 0;
        return normalizeCoopEvaluation(baseValue, 1);
    }

    private evaluateBuildDeathTower(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 24;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        const towerExists = combatant.team.getAliveCombatants().some(c => c.getCombatantType() === CombatantType.BabyBabel);
        if(towerExists) {
            baseValue -= 100;
        }
        const closestEnemy = getClosestEnemy(combatant, board, game);
        const hasLineOfSight = closestEnemy && board.hasLineOfSight(movePosition, closestEnemy.position, combatant);
        if(hasLineOfSight || board.getDistanceBetweenPositions(target!, closestEnemy.position) <= 4) {
            baseValue += 30;
        }
        return normalizeCoopEvaluation(baseValue, 3);
    }
}

class VeteranAIAgentBallistaTurretPlayer extends VeteranAIAgentGenericPlayer {
    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return 0;
    }

    protected getBaseDefendValue(): number {
        return -1000;
    }

    protected getBaseBasicAttackValue(): number {
        return 5;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.BackLine;
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        const specialMove = turnPlay.playAction.skillName;


        if(specialMove === "Arc Shot") {
            return this.evaluateArcBolt(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Scorpion Bolt") {
            return this.evaluateScorpionBolt(combatant, game, board, movePosition, target);
        }
       
        return 0;
    }

    private evaluateArcBolt(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Pierce);
    }

    private evaluateScorpionBolt(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Line, SpecialMoveAlignment.All);
        let baseValue = 0;
        let totalEnemieshit = 0;
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Pierce);
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return baseValue
    }
}   

// no need to implement this one
class VeteranAIAgentGorillaPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentMyrmidonPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentIskariotPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentDragonOfChaosPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentTrollPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentDragonPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}


// that is just bollocks 

class VeteranAIAgentWallPlayer extends VeteranAIAgentGenericPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentBombPlayer extends VeteranAIAgentGenericPlayer {
    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return 0;
    }

    protected getBaseDefendValue(): number {
        return -1000;
    }

    protected getBaseBasicAttackValue(): number {
        return -10;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.BackLine;
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        const specialMove = turnPlay.playAction.skillName;

        if(specialMove === "Self Destruct") {
            return this.evaluateSelfDestruct(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Teleport Blast") {
            return this.evaluateTeleportBlast(combatant, game, board, movePosition, target);
        }
               
        return 0;
    }

    private evaluateSelfDestruct(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 0;
        const originalPosition = combatant.position;
        theoreticalReplacement(combatant, board, movePosition, true);
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.All);
        let totalEnemieshit = 0;
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            if(targetCombatant.name === combatant.name) {
                return;
            }
            
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Fire) + 15;
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        theoreticalReplacement(combatant, board, originalPosition, false);
        return baseValue;
    }

    private evaluateTeleportBlast(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateSelfDestruct(combatant, game, board, movePosition, target);
    }
}

class VeteranAIAgentDollPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentBabyBabelPlayer extends VeteranAIAgentGenericPlayer {
    protected getBaseMovementValue(): number {
        return super.getBaseMovementValue();
    }

    protected getBaseSkipValue(): number {
        return 0;
    }

    protected getBaseDefendValue(): number {
        return -1000;
    }

    protected getBaseBasicAttackValue(): number {
        return -5;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.BackLine;
    }

    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        const evaluation = super.evaluate(combatant, game, board, turnPlay);
        if(evaluation > -1000) {
            return evaluation;
        }

        const movePosition = turnPlay.position;
        const target = turnPlay.playAction.target;
        const specialMove = turnPlay.playAction.skillName;

        if(specialMove === "Flame Cannon") {
            return this.evaluateFlameCannon(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Ice Cannon") {
            return this.evaluateIceCannon(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Thunder Dome") {
            return this.evaluateThunderDome(combatant, game, board, movePosition, target);
        }

        if(specialMove === "Sharpenal Shell") {
            return this.evaluateSharpenalShell(combatant, game, board, movePosition, target);
        }

        return 0;
    }

    private evaluateFlameCannon(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Fire) + 10;
    }

    private evaluateIceCannon(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Ice) + 10;  
    }

    private evaluateThunderDome(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Lightning) + 10;
    }

    private evaluateSharpenalShell(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        const getAllTargets = board.getAreaOfEffectPositions(combatant, target!, SpecialMoveAreaOfEffect.Nova, SpecialMoveAlignment.All);
        let baseValue = 0;
        let totalEnemieshit = 0;
        
        getAllTargets.forEach(AOETarget => {
            const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, AOETarget!, board);
            if(!targetCombatant) {
                return;
            }
            const damageType = isSamePosition(target!, AOETarget) ? DamageType.Crush : DamageType.Pierce;
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, damageType) + 10;
            if(targetCombatant.team.getName() !== combatant.team.getName()) {
                totalEnemieshit += 1;
            }
            baseValue += targetCombatant.team.getName() !== combatant.team.getName() ? targetHitValue : -targetHitValue;
        });
        baseValue += totalEnemieshit === 0 ? -10 : 0;
        return baseValue;
    }

}

class VeteranAIAgentOozeGolemPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentWeaveEaterPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentTwinBladesPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}


const agentByCombatantType = {
    [CombatantType.Defender]: new VeteranAIAgentDefenderPlayer(),
    [CombatantType.Militia]: new VeteranAIAgentMilitiaPlayer(),
    [CombatantType.Hunter]: new VeteranAIAgentHunterPlayer(),
    [CombatantType.Healer]: new VeteranAIAgentHealerPlayer(),
    [CombatantType.Wizard]: new VeteranAIAgentWizardPlayer(),
    [CombatantType.Fool]: new VeteranAIAgentFoolPlayer(),
    [CombatantType.Witch]: new VeteranAIAgentWitchPlayer(),
    [CombatantType.Pikeman]: new VeteranAIAgentPikemanPlayer(),
    [CombatantType.Vanguard]: new VeteranAIAgentVanguardPlayer(),
    [CombatantType.FistWeaver]: new VeteranAIAgentFistWeaverPlayer(),
    [CombatantType.StandardBearer]: new VeteranAIAgentStandardBearerPlayer(),
    [CombatantType.Rogue]: new VeteranAIAgentRoguePlayer(),
    [CombatantType.Artificer]: new VeteranAIAgentArtificerPlayer(),
    // later
    
    // also not real, but from the other side
    [CombatantType.DragonOfChaos]: new VeteranAIAgentDragonOfChaosPlayer(),
    [CombatantType.Myrmidon]: new VeteranAIAgentMyrmidonPlayer(),
    [CombatantType.Iskariot]: new VeteranAIAgentIskariotPlayer(),
    // this one isn't actually real
    [CombatantType.Gorilla]: new VeteranAIAgentGorillaPlayer(),
    [CombatantType.Troll]: new VeteranAIAgentTrollPlayer(),
    [CombatantType.Dragon]: new VeteranAIAgentDragonPlayer(),
    
    [CombatantType.Wall]: new VeteranAIAgentWallPlayer(),
    [CombatantType.Bomb]: new VeteranAIAgentBombPlayer(),
    [CombatantType.Doll]: new VeteranAIAgentDollPlayer(),
    [CombatantType.BallistaTurret]: new VeteranAIAgentBallistaTurretPlayer(),
    [CombatantType.BabyBabel]: new VeteranAIAgentBabyBabelPlayer(),

    [CombatantType.OozeGolem]: new VeteranAIAgentOozeGolemPlayer(),
    [CombatantType.WeaveEater]: new VeteranAIAgentWeaveEaterPlayer(),
    [CombatantType.TwinBlades]: new VeteranAIAgentTwinBladesPlayer(),
}

function addCoverValue(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
    if(isTakingCover(combatant, game, board, movePosition)) {
        return 3;
    }

    return 0;

    function isTakingCover(combatant: Combatant, game: Game, board: Board, movePosition: Position): boolean {
        const closestEnemy = getClosestEnemy(combatant, board, game);
        if(!closestEnemy) {
            return false;
        }
        const isCovered = board.isCoveredFromEnemy(movePosition, closestEnemy);
        return isCovered;
    }
}
