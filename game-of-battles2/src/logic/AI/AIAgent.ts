import { ActionResult, getStandardActionResult } from "../attackResult";
import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Game } from "../Game";

export interface AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[];
    getAIAgentType(): AIAgentType;
}

export class SimpleAIAgent implements AIAgent {
    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        alert("AI agent playing turn");
        game.spendActionPoints(1);
        return getStandardActionResult();
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.PRIMITIVE;
    }
}

export enum AIAgentType {
    PRIMITIVE,
    TAUNTED,
    CHARMERD,
    STUNLOCKED,
    DETERMINISTIC,
    SPECIALIZED
}