import { EventLogger } from "@/eventLogger";
import { ActionResult, getStandardActionResult } from "../attackResult";
import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Game } from "../Game";
import { AIAgent, AIAgentType } from "./AIAgent";
import { getValidAttacks, getValidMovePositions, moveTowards } from "./AIUtils";


export class StunLockedAIAgent implements AIAgent {
    private stunLockCauseMessage: string;

    constructor(stunCauseMessage: string) {
        this.stunLockCauseMessage = stunCauseMessage;
    }

    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        const eventLogger = EventLogger.getInstance();
        eventLogger.logEvent(`${combatant.name} is ${this.stunLockCauseMessage} and cannot act!`);
        game.executePassTurn();
        return getStandardActionResult();
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

    playTurn(combatant: Combatant, game: Game, board: Board): ActionResult | ActionResult[] {
        const actionResult = this.chaseTheOffender(combatant, game, board, this.offender);
        return actionResult;
    }

    getAIAgentType(): AIAgentType {
        return AIAgentType.TAUNTED;
    }

    private chaseTheOffender(combatant: Combatant, game: Game, board: Board, offender: Combatant): ActionResult {
        const validAttacks = getValidAttacks(combatant, board);
        if(validAttacks.length > 0 && validAttacks.some((attack) => attack.x === offender.position.x && attack.y === offender.position.y)) {
            return game.executeBasicAttack(combatant, offender.position, board);
        } else {
            const validNewPositions = getValidMovePositions(combatant, board);
            for (let i = 0; i < validNewPositions.length; i++) {
                const position = validNewPositions[i];
                // can attack from new position
                const validAttacks = getValidAttacks(Object.assign({}, combatant, { position, hasStatusEffect: combatant.hasStatusEffect }), board);
                if(validAttacks.length > 0 && validAttacks.some((attack) => attack.x === offender.position.x && attack.y === offender.position.y)) {
                    combatant.move(position, board);
                    return game.executeBasicAttack(combatant, offender.position, board);
                }
            }
        }
        moveTowards(combatant, offender.position, board);
        game.executeSkipTurn();
        return getStandardActionResult();
    }       
}