import { ActionResult, getStandardActionResult } from "../attackResult";
import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { CombatantType } from "../Combatants/CombatantType";
import { DamageType } from "../Damage";
import { Game } from "../Game";
import { Position } from "../Position";
import { StatusEffectType } from "../StatusEffect";
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
      inEngagementDistance} from "./HeuristicalAgents";

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
        engagementValue += distanceClosing < moveSpeed * 0.3 ? (0.2 * distanceClosing) : 0;
        engagementValue += distanceClosing >= moveSpeed * 0.3 && distanceClosing < moveSpeed * 0.6 ? (0.3 * distanceClosing) : 0;
        engagementValue += distanceClosing >= moveSpeed * 0.6 ? (0.5 * distanceClosing) : 0;
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

    protected evaluateMovement(combatant: Combatant, game: Game, board: Board, movePosition: Position): number {
        let baseValue = 0;

        const fleeing = isFleeing(combatant, movePosition, board, game);
        const engaging = isEngaging(combatant, movePosition, board, game);
        const distnaceClosingToEnemies = getDistanceClosingToEnemies(combatant, movePosition, board, game);
        const farFromEnemies = isFarFromEnemies(combatant, board, game);

        if(isNearDeath(combatant) && !isLastSurvivor(combatant)) {
            let movementValue = 0;
            movementValue += fleeing ? 2 : 0;
            movementValue += engaging ? -2 : 0;
            movementValue += (distnaceClosingToEnemies) * (-0.5);
            movementValue *= farFromEnemies ? 0.5 : 1;
            baseValue += movementValue;
        } else {
            let movementValue = 0;
            movementValue += fleeing ? -2 : 0;
            movementValue += engaging ? 2 : 0;
            movementValue += evaluateEngagingByAggressivenessLevel(combatant, distnaceClosingToEnemies, this.getAggressivenessLevel());
            movementValue *= farFromEnemies ? 2 : 1;
            baseValue += movementValue;
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
        if(!target || !board.getCombatantAtPosition(target)) {
            throw new Error("Target is undefined");
        }
        
        const targetCombatant: Combatant = board.getCombatantAtPosition(target)!;
        let baseValue = this.getBaseBasicAttackValue();
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += isNearDeath(targetCombatant) ? 4 : 0;
        baseValue += isBadlyInjured(targetCombatant) ? 3 : 0;
        baseValue += isInjured(targetCombatant) ? 2 : 0;
        baseValue += isSlightlyInjured(targetCombatant) ? 1 : 0;
        baseValue += isTargetDefending(targetCombatant) ? -2 : 0;
        baseValue += isTargetWeak(targetCombatant, damageType || combatant.basicAttack().type) ? 3 : 0;
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

    private evaluateBlockingStance(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        if(!target || !board.getCombatantAtPosition(target)) {
            throw new Error("Target is undefined");
        }
        let baseValue = 2;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        getNearbyEnemies(combatant, board, game).forEach(enemy => {
            if(isCombatantMartial(enemy)) {
                baseValue += 2;
            } else if(isCombatantCaster(enemy)) {
                baseValue -= 2;
            }
        });
        baseValue += isNearDeath(combatant) ? 3 : 0;
        baseValue += isBadlyInjured(combatant) ? 2 : 0;
        baseValue += isInjured(combatant) ? 1 : 0;
        return baseValue;
    }

    private evaluateDefensiveStrike(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        if(!target || !board.getCombatantAtPosition(target)) {
            throw new Error("Target is undefined");
        }

        const targetCombatant: Combatant = board.getCombatantAtPosition(target)!;
        let baseValue = 3;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += areManyEnemiesNearby(combatant, board, game) ? 2 : 0;
        baseValue += isEnemyNearby(combatant, board, game) ? 1 : 0;
        baseValue += isSlightlyInjured(combatant) ? 1 : 0;
        baseValue += isBadlyInjured(combatant) ? 2 : 0;
        baseValue += isNearDeath(combatant) ? 3 : 0;
        baseValue += isNearDeath(targetCombatant) ? 4 : 0;
        baseValue += isBadlyInjured(targetCombatant) ? 3 : 0;
        baseValue += isInjured(targetCombatant) ? 2 : 0;
        baseValue += isSlightlyInjured(targetCombatant) ? 1 : 0;
        baseValue += isTargetWeak(targetCombatant, combatant.basicAttack().type) ? 3 : 0;
        baseValue += isTargetDefending(targetCombatant) ? -2 : 0;
        baseValue += isTargetResistant(targetCombatant, combatant.basicAttack().type) ? -3 : 0;
        baseValue += isTargetImmune(targetCombatant, combatant.basicAttack().type) ? -10 : 0;
        return 0;
    }

    private evaluateFortify(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        if(!target || !board.getCombatantAtPosition(target)) {
            throw new Error("Target is undefined");
        }

        const targetCombatant: Combatant = board.getCombatantAtPosition(target)!;
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

    private evaluateFocusAim(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = 3;
        baseValue += this.evaluateMovement(combatant, game, board, movePosition);
        baseValue += combatant.hasStatusEffect(StatusEffectType.FOCUS_AIM) ? -10 : 0;
        baseValue += combatant.hasStatusEffect(StatusEffectType.STRENGTH_BOOST) ? 2 : 0;
        baseValue += isFarFromEnemies(combatant, board, game) ? 3 : 0;
        return baseValue;
    }

    private evaluateRicochet(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target);
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
            const targetCombatant: Combatant = board.getCombatantAtPosition(target)!;
            baseValue += isTargetLowLuck(targetCombatant) ? 2 : 0;
            baseValue += targetCombatant.hasStatusEffect(StatusEffectType.POISONED) ? -3 : 0;
        }
        return baseValue;
    }

    private evaluatePinDown(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        let baseValue = this.evaluateBasicAttack(combatant, game, board, movePosition, target);
        if(target) {
            const targetCombatant: Combatant = board.getCombatantAtPosition(target)!;
            baseValue += isTargetLowLuck(targetCombatant) ? 2 : 0;
            baseValue += isTargetFast(targetCombatant) ? 2 : 0;
            baseValue += inEngagementDistance(targetCombatant, combatant.position, board) ? 2 : 0;
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
        return -1;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.MiddleLine;
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

        if(specialMove === "Regeneration") {
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

    private evaluateSacredFlame(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target);
    }

    private evaluateRegeneration(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target);
    }

    private evaluatePurify(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {  
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target);
    }

    private evaluateHeal(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target);
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
        return -4;
    }

    protected getAggressivenessLevel(): number {
        return AggressivenessLevel.MiddleLine;
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

        return 0;
    }

    private evaluateFireball(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target);
    }

    private evaluateChainLightning(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target);
    }

    private evaluateFrozenBurst(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target);
    }

    private evaluateFlame(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target);
    }

    private evaluateIcicle(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target);
    }

    private evaluateArcaneChanneling(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target);
    }

    private evaluateLightningBolt(combatant: Combatant, game: Game, board: Board, movePosition: Position, target: Position | undefined): number {
        return this.evaluateBasicAttack(combatant, game, board, movePosition, target);
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
        return super.evaluate(combatant, game, board, turnPlay);
    }
}

class VeteranAIAgentWitchPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentFoolPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentPikemanPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentVanguardPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }
}

class VeteranAIAgentFistWeaverPlayer implements VeteranAIAgentPlayer {
    evaluate(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
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
}
