import { ActionResult, getStandardActionResult } from "../attackResult";
import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { CombatantType } from "../Combatants/CombatantType";
import { Game } from "../Game";
import { Position } from "../Position";
import { SpecialMoveAlignment } from "../SpecialMove";
import { StatusEffectType } from "../StatusEffect";
import { AIAgent, AIAgentType } from "./AIAgent";
import { getClosestEnemy, getValidAttacks, getValidAttackWithSkillsIncluded, getValidAttackWithSkillsIncludedOptimal, getValidBasicAttackWithOptimalTarget, getValidMovePositions, getValidSupportSkills, isBasicAttackTargetingBetter, isSkillTargetingBetter, mergeDeep, moveTowards, shuffleArray } from "./AIUtils";


export class DummyAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        game.executeSkipTurn();
        return getStandardActionResult();
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.PRIMITIVE;
    }
}

export class BunkerDummyAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        game.executeDefend();
        return getStandardActionResult();
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.PRIMITIVE;
    }
}

export class ToddlerAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        const actionResult = this.searchAndDestroy(combatant, game, board);
        return actionResult;
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





export class KidAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        const actionResult = this.searchAndDestroy(combatant, game, board);
        return actionResult;
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.DETERMINISTIC;
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
                const skillAttacks = getValidAttackWithSkillsIncluded(Object.assign({}, combatant, { 
                    position, hasStatusEffect: combatant.hasStatusEffect, hasMoved: true
                }), board);
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
                    position, hasStatusEffect: combatant.hasStatusEffect, hasMoved: true
                }), board);
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

    getAIAgentType(): AIAgentType {
        return AIAgentType.DETERMINISTIC;
    }

    private searchAndDestroyCleverlyOrBuff(combatant: Combatant, game: Game, board: Board): ActionResult[] {
        const skillAttacksOptimizedWithoutMove = getValidAttackWithSkillsIncludedOptimal(combatant, board);
        const validNewPositions = getValidMovePositions(combatant, board);
        const skillAttacksOptimizedAfterMove = [];
        for (let i = 0; i < validNewPositions.length; i++) {
            const position = validNewPositions[i];
            // can attack from new position
            const skillAttacksOptimizedAfterCurrentPosition = getValidAttackWithSkillsIncludedOptimal(Object.assign({}, combatant, { 
                position, hasStatusEffect: combatant.hasStatusEffect, hasMoved: true
            }), board);
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
        const agent: VeteranAIAgentPlayer = agentByCombatantType[combatant.getCombatantType()];
        return agent.play(combatant, game, board);
    }


    getAIAgentType(): AIAgentType {
        return AIAgentType.DETERMINISTIC;
    }
}


interface VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[];
}

class VeteranAIAgentMilitiaPlayer implements VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        return getStandardActionResult();
    }
}

class VeteranAIAgentDefenderPlayer implements VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        return getStandardActionResult();
    }
}

class VeteranAIAgentHunterPlayer implements VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        return getStandardActionResult(); 
    }
}

class VeteranAIAgentHealerPlayer implements VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {

        const bestAllyToHeal = this.getBestAllyToHeal(combatant, board);
        const bestAllyToPurify = this.getBestAllyToPurify(combatant, board);
        const bestAllyToBuffWithRegeneration = this.getBestAllyToBuffWithRegeneration(combatant, board);
        const bestEnemyTargetForSacredFlame = this.getBestEnemyTargetForSacredFlame(combatant, board);
        const bestEnemyTargetForBasicAttack = this.getBestEnemyTargetForBasicAttack(combatant, board);

        /*
        * 1. if ally to purify is with critical debuff, purify 
        * 2. if ally to heal is in critical condition, heal
        * 3. if ally to purify has a medium ailment or several debuffs, purify
        * 4. if best enemy has weakenss to holy or about to die, attack with sacred flame
        * 5. if ally has mild debuff, purify
        * 6. attack best enemy
        * 7. cast regeneration on best tank
        * 8. move forward
        */
        return getStandardActionResult();
    }

    private getBestAllyToHeal(self: Combatant, board: Board): Combatant {
        return self;
    }

    private getBestAllyToPurify(self: Combatant, board: Board): Combatant {
        return self;
    }

    private getBestAllyToBuffWithRegeneration(self: Combatant, board: Board): Combatant {
        return self;
    }

    private getBestEnemyTargetForSacredFlame(self: Combatant, board: Board): Combatant {
        return self;
    }

    private getBestEnemyTargetForBasicAttack(self: Combatant, board: Board): Combatant {
        return self;
    }

}

class VeteranAIAgentWizardPlayer implements VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        const bestSingleTargetEnemy = this.getBestSingleTargetEnemy(combatant, board);
        let bestMultiTargetPosition = null;
        if(combatant.hasStatusEffect(StatusEffectType.ARCANE_CHANNELING)) {
            bestMultiTargetPosition = this.getBestMultiTargetPosition(combatant, board);
        }
        const closestThreats = this.getClosestThreats(combatant, board);
        return getStandardActionResult();
    }

    private getBestSingleTargetEnemy(self: Combatant, board: Board): Combatant {
        return self;
    }

    private getBestMultiTargetPosition(self: Combatant, board: Board): Position {
        return self.position;
    }

    private getClosestThreats(self: Combatant, board: Board): Combatant[] {
        return [];
    }
}

class VeteranAIAgentWitchPlayer implements VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        return getStandardActionResult();
    }
}

class VeteranAIAgentFoolPlayer implements VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        return getStandardActionResult();
    }
}

class VeteranAIAgentPikemanPlayer implements VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        return getStandardActionResult();
    }
}

class VeteranAIAgentVanguardPlayer implements VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        return getStandardActionResult();
    }
}

class VeteranAIAgentFistWeaverPlayer implements VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        return getStandardActionResult();
    }
}

class VeteranAIAgentStandardBearerPlayer implements VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        return getStandardActionResult();
    }
}

class VeteranAIAgentRoguePlayer implements VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        return getStandardActionResult();
    }
}

class VeteranAIAgentArtificerPlayer implements VeteranAIAgentPlayer {
    play(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        return getStandardActionResult();
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
