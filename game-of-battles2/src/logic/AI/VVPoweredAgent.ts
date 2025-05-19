import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { CombatantType } from "../Combatants/CombatantType";
import { Damage, DamageReaction, DamageType } from "../Damage";
import { Game } from "../Game";
import { isSamePosition, Position } from "../Position";
import { SpecialMove, SpecialMoveAlignment, SpecialMoveTriggerType } from "../SpecialMove";
import { StatusEffectType } from "../StatusEffect";
import { AIAgent, AIAgentType } from "./AIAgent";
import { getValidAttacks, getValidMovePositions } from "./AIUtils";
import { HeuristicalAIAgent, TurnPlay } from "./HeuristicalAgents";

interface ValueVector {
    
}


export class VVPoweredAIAgent extends HeuristicalAIAgent {
    evaluationFunction(combatant: Combatant, game: Game, board: Board, turnPlay: TurnPlay): number {
        return 0;
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.SPECIALIZED;
    }
}