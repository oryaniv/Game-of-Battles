import { ActionResult, AttackResult } from "./logic/attackResult";
import { DamageReaction } from "./logic/Damage";

export interface CommentatorMessage {
    message: string;
    priority: number;
}

export function getCommentatorMessage(actionResults: ActionResult[]): CommentatorMessage | null {
    // Track total damage
    let totalDamage = 0;
    let criticalHits = 0;
    let weaknessHits = 0;
    let deaths = 0;

    actionResults.forEach(result => {
        totalDamage += result.damage.amount;
        
        if (result.attackResult === AttackResult.CriticalHit) {
            criticalHits++;
        }
        
        if (result.reaction === DamageReaction.WEAKNESS) {
            weaknessHits++;
        }

    });

    // Check for multi-kills first (highest priority)
    if (deaths > 1) {
        const killPrefix = deaths === 2 ? "Double" : deaths === 3 ? "Triple" : "Multi";
        return {
            message: `${killPrefix} Kill!`,
            priority: 100
        };
    }

    // Check for big damage (medium priority)
    if (totalDamage > 50) {
        return {
            message: "Big damage!",
            priority: 50
        };
    }

    // Check for crits/weakness hits (lower priority)
    if (criticalHits > 0 || weaknessHits > 0) {
        return {
            message: "Very good!",
            priority: 25
        };
    }

    return null;
}
