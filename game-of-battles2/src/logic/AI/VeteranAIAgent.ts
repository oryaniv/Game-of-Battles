import { ActionResult, getStandardActionResult } from "../attackResult";
import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { CombatantType } from "../Combatants/CombatantType";
import { DamageType } from "../Damage";
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
      getAlliedCombatantsInRange, getClosestEnemy,
      theoreticalReplacement,
      isTargetHighDefense,
      isLowAttackPower,
      isMemeAttacker} from "./HeuristicalAgents";

export enum AggressivenessLevel {
    FrontLine = 0,
    MiddleLine = 1,
    BackLine = 2
}

function evaluateEngagingByAggressivenessLevel(combatant: Combatant, distanceClosing: number, aggressivenessLevel: AggressivenessLevel): number {
    let engagementValue = 0;
    const moveSpeed = combatant.stats.movementSpeed;
    if(aggressivenessLevel === AggressivenessLevel.FrontLine) {
        engagementValue += distanceClosing < moveSpeed * 0.3 ? (0.5 * distanceClosing) : 0;
        engagementValue += distanceClosing >= moveSpeed * 0.3 && distanceClosing < moveSpeed * 0.6 ? (0.3 * distanceClosing) : 0;
        engagementValue += distanceClosing >= moveSpeed * 0.6 ? (0.2 * distanceClosing) : 0;
        return engagementValue;
    } else if(aggressivenessLevel === AggressivenessLevel.MiddleLine) {
        engagementValue += distanceClosing < moveSpeed * 0.3 ? (0.3 * distanceClosing) : 0;
        engagementValue += distanceClosing >= moveSpeed * 0.3 && distanceClosing < moveSpeed * 0.6 ? (0.5 * distanceClosing) : 0;
        engagementValue += distanceClosing >= moveSpeed * 0.6 ? (0.2 * distanceClosing) : 0;
        return engagementValue;
    } else {
        const movementFactor =  moveSpeed - distanceClosing;
        engagementValue += distanceClosing < moveSpeed * 0.3 ? (0.5 * movementFactor) : 0;
        engagementValue += distanceClosing >= moveSpeed * 0.3 && distanceClosing < moveSpeed * 0.6 ? (0.5 * movementFactor) : 0;
        engagementValue += distanceClosing >= moveSpeed * 0.6 ? (0.5 * movementFactor) : 0;
        return engagementValue;
    }
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
        return 0;
    }

    protected getBaseDefendValue(): number {
        return 0;
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


        return baseValue;
    }

    protected evaluateSkip(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
        if(isMoving(combatant, movePosition)) {
            return this.evaluateMovement(combatant, game, board, movePosition);
        }

        let baseValue = this.getBaseSkipValue();
        baseValue += isLastSurvivor(combatant) ? -10 : 0;
        baseValue += combatant.specialMoves.length > 0 && cannotUseSpecialMoves(combatant) ? 2 : 0;
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
        damageType?: DamageType
    ): number {
        assertTargetIsExists(movePosition, target, board);
        
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = this.getBaseBasicAttackValue();
        const targetIsDefending = isTargetDefending(targetCombatant);
        const targetIsWeak = isTargetWeak(targetCombatant, damageType || combatant.basicAttack().type);
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += isLastSurvivor(combatant) ? 5 : 0;
        // baseValue += isNearDeath(targetCombatant) ? 4 : 0;
        // baseValue += isBadlyInjured(targetCombatant) ? 3 : 0;
        // baseValue += isInjured(targetCombatant) ? 2 : 0;
        // baseValue += isSlightlyInjured(targetCombatant) ? 1 : 0;
        baseValue += (10 - (targetCombatant.stats.hp * 0.1));
        // baseValue += (combatant.stats.attackPower - targetCombatant.stats.defensePower) * 0.1;
        baseValue += targetIsDefending ? -2 : 0;
        baseValue += targetIsDefending && targetIsWeak ? 0.5 : 0;
        baseValue += !targetIsDefending && targetIsWeak ? 10 : 0;
        baseValue += isTargetResistant(targetCombatant, damageType || combatant.basicAttack().type) ? -3 : 0;
        baseValue += isTargetImmune(targetCombatant, damageType || combatant.basicAttack().type) ? -10 : 0;
        return baseValue;
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
        
        return 0;
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
        return 4;
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
        
        return 0;
    }

    protected evaluateMovement(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
        let baseValue = 0;
       
        const closestEnemy = getClosestEnemy(combatant, board, game);
        const hasLineOfSight = board.hasLineOfSight(movePosition, closestEnemy.position, combatant);
        if(hasLineOfSight) {
            baseValue += super.evaluateMovement(combatant, game, board, movePosition, 8); 
        } else {
            baseValue += super.evaluateMovement(combatant, game, board, movePosition, 2); 
        }

        return baseValue;
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
            const chainTargets = board.getChainTargets(combatant, target, 1, 2);
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
        
        return 0;
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
        baseValue += isFullyHealed(targetCombatant) ? -10 : 0;
        baseValue += isEnemyNearby(combatant, board, game) ? 2 : 0;
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

        return Number.NEGATIVE_INFINITY;
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
            const targetHitValue = this.evaluateBasicAttack(combatant, game, board, movePosition, targetCombatant.position, DamageType.Fire) + 10;
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
        }
        return baseValue;
    }

    private evaluateFlame(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Fire);
        baseValue += 13
        return baseValue;
    }

    private evaluateIcicle(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Ice);
        baseValue += 13
        return baseValue;
    }

    private evaluateLightningBolt(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target, DamageType.Lightning);
        baseValue += 13
        return baseValue;
    }

    private evaluateArcaneChanneling(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);

        let baseValue = 6;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += combatant.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING) ? -10 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.STRENGTH_BOOST) ? 3 : 0;
        baseValue += fatStackOfTargets(combatant, board) ? 5 : 0;
        baseValue += isFarFromEnemies(combatant, board, game) ? 5 : 0;
        baseValue += isLowStamina(combatant) ? -3 : 0;
        // add something for enemies being close
        return baseValue;

        function fatStackOfTargets(combatant: Combatant, board: Board): boolean {
            const closestEnemy = getClosestEnemy(combatant, board, game);
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
        
        return 0;
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
        return baseValue;
    }

    private evaluateEncourage(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        assertTargetIsExists(movePosition, target, board);

        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        let baseValue = 4;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.ENCOURAGED) ? -3 : 0;
        baseValue += isTargetHighInitiative(targetCombatant) ? 2 : 0;
        baseValue += targetCombatant.stats.luck * 0.2;
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
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.RALLIED) ? 2 : 0;
            baseValue += !targetCombatant.hasStatusEffect(StatusEffectType.RALLIED) ? 4 : 0;
            baseValue += isTargetLowLuck(targetCombatant) ? 1 : 0;
            baseValue += isTargetLowDefense(targetCombatant) ? 1 : 0;
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
        return 2;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.MiddleLine;
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
        return baseValue;
    }

    private evaluateEvilEye(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return 0;
    }

    private evaluateSlow(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return 0;
    }

    private evaluateSiphonEnergy(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return 0;
    }

    private evaluateGraspOfZirash(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return 0;
    }
}

class VeteranAIAgentFoolPlayer extends VeteranAIAgentGenericPlayer {
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
        return -10;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.BackLine;
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
        
        return 0;
    }

    private evaluateYoMama(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return 0;
    }

    private evaluateStupidestCrapEver(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return 0;
    }

    private evaluateSmellitt(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return 0;
    }
    
    private evaluateLookeyHere(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return 0;
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
        
        return 0;
    }

    private evaluateSkewer(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return 0;
    }
    
    private evaluateGapingStab(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return 0;
    }

    private evaluateHaftStrike(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return 0;
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
        
        return 0;
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
        baseValue += combatant.hasStatusEffect(StatusEffectType.FORTIFIED) ? -2 : 0;
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
        baseValue += targetCombatant.hasStatusEffect(StatusEffectType.RIPOSTE) ? -6 : 0;
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

        
        return 0;
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
        if(movePosition.x === 5 && movePosition.y === 6) {
            // eslint-disable-next-line
            debugger;
        }
        const targetCombatant: Combatant = getTargetCombatantForEvaluation(combatant, movePosition, target!, board);
        const pushResult = board.getPushResult(combatant, targetCombatant!, 3);
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
        return baseValue;
    }

    private evaluateMeditate(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 4;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
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

class VeteranAIAgentRoguePlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentArtificerPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentBallistaTurretPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
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
    [CombatantType.BallistaTurret]: new VeteranAIAgentBallistaTurretPlayer(),
    [CombatantType.Myrmidon]: new VeteranAIAgentMyrmidonPlayer(),
    [CombatantType.Iskariot]: new VeteranAIAgentIskariotPlayer(),
    // this one isn't actually real
    [CombatantType.Gorilla]: new VeteranAIAgentGorillaPlayer(),
    // also not real, but from the other side
    [CombatantType.DragonOfChaos]: new VeteranAIAgentDragonOfChaosPlayer(),
}

function addCoverValue(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
    if(isTakingCover(combatant, game, board, movePosition)) {
        return 3;
    }

    return 0;

    function isTakingCover(combatant: Combatant, game: Game, board: Board, movePosition: Position): boolean {
        const closestEnemy = getClosestEnemy(combatant, board, game);
        const isCovered = board.isCoveredFromEnemy(movePosition, closestEnemy);
        return isCovered;
    }
}
