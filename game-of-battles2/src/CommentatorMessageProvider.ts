import { ActionResult, AttackResult } from "./logic/attackResult";
import { DamageReaction } from "./logic/Damage";
import { Board } from "./logic/Board";
import { Team } from "./logic/Team";

export interface CommentatorMessage {
    message: string;
    priority: number;
    type: string;
}

export function getCommentatorMessage(actionResults: ActionResult[], team: Team, board: Board): CommentatorMessage[] {
    // Track total damage
    let totalDamage = 0;
    let criticalHits = 0;
    let weaknessHits = 0;
    let blocks = 0;
    let fumbles = 0;
    let immunities = 0;
    let kills = 0;
    const resultMessages: CommentatorMessage[] = [];
    const isPlayer = team.isHumanPlayerTeam();

    actionResults.forEach(result => {
        totalDamage += result.damage.amount;
        
        if (result.attackResult === AttackResult.CriticalHit) {
            criticalHits++;
        }

        if(result.attackResult === AttackResult.Fumble) {
            fumbles++;
        }

        if(result.attackResult === AttackResult.Blocked) {
            blocks++;
        }
        
        if (result.reaction === DamageReaction.WEAKNESS) {
            weaknessHits++;
        }

        if(result.reaction === DamageReaction.IMMUNITY) {
            immunities++;
        }
        

        if(result.position !== undefined) {
            const combatant = board.getCombatantAtPosition(result.position);
            if(combatant && combatant.team.getIndex() !== team.getIndex() && combatant.isKnockedOut()) {
                kills++;
            }
        }
    });

    if(hasFailedResults()) {
        resultMessages.push({
            message: failedAttackMessages[Math.floor(Math.random() * failedAttackMessages.length)],
            priority: 0,
            type: 'fail'
        });
    } else if(criticalHits > 0 || weaknessHits > 0) {
        const message = isPlayer ? criticalAndWeaknessPlayerMessages[Math.floor(Math.random() * criticalAndWeaknessPlayerMessages.length)] : 
        criticalAndWeaknessOpponentMessages[Math.floor(Math.random() * criticalAndWeaknessOpponentMessages.length)];
        resultMessages.push({
            message: message,
            priority: 0,
            type: 'critical_hit'
        });
    }

     // Check for big damage (medium priority)
     if (totalDamage > 80) {
        const message = isPlayer ? bigDamagePlayerMessages[Math.floor(Math.random() * bigDamagePlayerMessages.length)] : 
        bigDamageOpponentMessages[Math.floor(Math.random() * bigDamageOpponentMessages.length)];
        resultMessages.push({
            message: message,
            priority: 1,
            type: 'big_damage'
        });
    }

    // Check for multi-kills first (low priority)
    kills = kills > 6 ? 6 : kills;
    if (isPlayer && kills > 1) {
        const killMessage = killTable[kills];
        resultMessages.push({
            message: killMessage,
            priority: 2,
            type: 'multi_kill'
        });
    }

    return resultMessages;

    function hasFailedResults(): boolean {
        return fumbles > 0 || blocks > 0 || immunities > 0;
    }
}


const killTable: Record<number, string> = {
    2: "Double Kill!",
    3: "Multi Kill!",
    4: "Ultra Kill!",
    5: "Monster Kill!",
    6: "HOLY SH!T"
}

const criticalAndWeaknessPlayerMessages = [
    "A Good Hit!",
    "Well Done!",
    "Dope!",
    "Cool!",
    "Keep Going!",
    "Nice!",
]

const criticalAndWeaknessOpponentMessages = [
    "That had to hurt...",
    "Stings, doesn't it?",
    "Ouch!",
    "Gotta be more careful!",
    "Try not to scream...",
    "Senzu Bean!",
    "Why so serious?",
    "You done goofed",
]

const bigDamagePlayerMessages = [
    "BOOM!",
    "SWEET!",
    "Showtime!",
    "Badass!",
    "Annihilation!",
    "Carnage!",
]

const bigDamageOpponentMessages = [
    "Are you OK?",
    "OOF!",
    "It was nice knowing you",
    "Are you not entertained!?",
    "How's your health plan?",
    "Closer to defeat..."
]

const failedAttackMessages = [
    "Really?",
    "Come On!",
    "Pathetic!",
    "What was THAT?",
    "BOO!",
    "Epic Fail!"
]


    

