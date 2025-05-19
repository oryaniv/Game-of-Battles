import { Board } from "../Board";
import { Combatant } from "../Combatant";
import { Position } from "../Position";
import { Game } from "../Game";
import { SpecialMove, SpecialMoveAlignment } from "../SpecialMove";
import { DamageReaction } from "../Damage";

interface SkillTargeting {
    skill: SpecialMove;
    targets: Position[];
    priority: number;
    targetHp: number;
    position: Position;
}


export function getClosestEnemy(combatant: Combatant, game: Game, board: Board): Position {
    const enemyTeam = game.teams.find(team => team.index !== combatant.team.index);
    const closestEnemy = enemyTeam?.combatants.reduce((closest, enemy) => {
        if (enemy.isKnockedOut()) return closest;
        const distanceToEnemy = Math.sqrt(
            Math.pow(enemy.position.x - combatant.position.x, 2) + 
            Math.pow(enemy.position.y - combatant.position.y, 2)
        );
        const distanceToClosest = closest ? Math.sqrt(
            Math.pow(closest.position.x - combatant.position.x, 2) + 
            Math.pow(closest.position.y - combatant.position.y, 2)
        ) : Infinity;
        return distanceToEnemy < distanceToClosest ? enemy : closest;
    }, null as Combatant | null);
    return closestEnemy?.position || combatant.position;
}


export function getValidMovePositions(combatant: Combatant, board: Board): Position[] {
    const validNewPositions = board.getValidMoves(combatant);
    return validNewPositions;
}

export function getValidAttacks(combatant: Combatant, board: Board): Position[] {
    const validAttacks = board.getValidAttacks(combatant);
    return validAttacks;
}


export function moveTowards(combatant: Combatant, position: Position, board: Board): void {
    const validMoves = getValidMovePositions(combatant, board);
    if (validMoves.length === 0) return;

    const closestPosition = validMoves.reduce((closest, move) => {
        const distanceToTarget = Math.sqrt(
            Math.pow(move.x - position.x, 2) + 
            Math.pow(move.y - position.y, 2)
        );
        const distanceToClosest = closest ? Math.sqrt(
            Math.pow(closest.x - position.x, 2) + 
            Math.pow(closest.y - position.y, 2)
        ) : Infinity;
        return distanceToTarget < distanceToClosest ? move : closest;
    }, null as Position | null);

    if (closestPosition) {
        combatant.move(closestPosition, board);
    }
}

export function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function getValidAttackWithSkillsIncluded(combatant: Combatant, board: Board) {

    let allCombatantOffensiveSkills = combatant.specialMoves.filter(
        (move) => move.range.align === SpecialMoveAlignment.Enemy &&
        // (move.checkRequirements === undefined || move.checkRequirements(combatant)) && 
        // combatant.stats.stamina >= move.cost
        combatant.canUseSkill(move)
    );
    allCombatantOffensiveSkills = shuffleArray(allCombatantOffensiveSkills);
    
    for (let i = 0; i < allCombatantOffensiveSkills.length; i++) {
        const skill = allCombatantOffensiveSkills[i];
        const validTargets = board.getValidTargetsForSkill(combatant, skill.range);
        if(validTargets.length > 0) {
            return {skill, targets: validTargets};
        }
    }
    return null;
}

export function getValidAttackWithSkillsIncludedOptimal(combatant: Combatant, board: Board) {
    let allCombatantOffensiveSkills = combatant.specialMoves.filter(
        (move) => move.range.align === SpecialMoveAlignment.Enemy &&
        // (move.checkRequirements === undefined || move.checkRequirements(combatant)) && 
        // combatant.stats.stamina >= move.cost
        combatant.canUseSkill(move)
    );
    allCombatantOffensiveSkills = shuffleArray(allCombatantOffensiveSkills);

    let bestSkill = null;
    let bestTargets: Combatant[] = [];
    let bestPriority = -1;
    // 2 = target is weak, 1 = target has no resistance, 0 = target resists, -1 = target is immune

    for (const skill of allCombatantOffensiveSkills) {
        const validTargetPositions = board.getValidTargetsForSkill(combatant, skill.range);
        if (validTargetPositions.length === 0) continue;

        const validTargets = validTargetPositions
            .map(pos => board.getCombatantAtPosition(pos))
            .filter((c): c is Combatant => c !== null);

        for (const target of validTargets) {
            const damageType = skill.damage.type;
            const resistance = target.resistances.find(r => r.type === damageType);
            let currentPriority = 1; // default - no resistance

            if (resistance) {
                switch (resistance.reaction) {
                    case DamageReaction.WEAKNESS:
                        currentPriority = 2;
                        break;
                    case DamageReaction.NONE:
                        currentPriority = 1;
                        break;
                    case DamageReaction.RESISTANCE:
                        currentPriority = 0;
                        break;
                    case DamageReaction.IMMUNITY:
                        currentPriority = -1;
                        break;
                }
            }

            // If we found a better priority, or same priority but lower HP
            if (currentPriority > bestPriority || 
                (currentPriority === bestPriority && 
                 bestTargets.length > 0 && 
                 target.stats.hp < bestTargets[0].stats.hp)) {
                bestPriority = currentPriority;
                bestSkill = skill;
                bestTargets = [target];
            }
        }
    }

    if (bestSkill && bestTargets.length > 0) {
        return {
            skill: bestSkill,
            targets: bestTargets.map(target => target.position),
            priority: bestPriority,
            targetHp: bestTargets[0].stats.hp,
            position: combatant.position
        };
    }

    return null;
}

export function getValidBasicAttackWithOptimalTarget(combatant: Combatant, board: Board) {
    let validTargets = getValidAttacks(combatant, board);
    validTargets = shuffleArray(validTargets);

    let bestTargets: Combatant[] = [];
    let bestPriority = -1;

    for (const target of validTargets) {
        const damageType = combatant.basicAttack().type;
        const targetCombatant = board.getCombatantAtPosition(target);
        const resistance = targetCombatant!.resistances.find(r => r.type === damageType);
        let currentPriority = 1; // default - no resistance

            if (resistance) {
                switch (resistance.reaction) {
                    case DamageReaction.WEAKNESS:
                        currentPriority = 2;
                        break;
                    case DamageReaction.NONE:
                        currentPriority = 1;
                        break;
                    case DamageReaction.RESISTANCE:
                        currentPriority = 0;
                        break;
                    case DamageReaction.IMMUNITY:
                        currentPriority = -1;
                        break;
                }
            }

            if (currentPriority > bestPriority || 
                (currentPriority === bestPriority && 
                 bestTargets.length > 0 && 
                 targetCombatant!.stats.hp < bestTargets[0].stats.hp)) {
                bestPriority = currentPriority;
                bestTargets = [targetCombatant!];
            }
        
    }

    if (bestTargets.length > 0) {
        return {
            targets: bestTargets.map(target => target.position),
            priority: bestPriority,
            targetHp: bestTargets[0].stats.hp,
            position: combatant.position
        };
    }
}




export function isSkillTargetingBetter(best: SkillTargeting, current: SkillTargeting): SkillTargeting {
    if (!best) return current;
    if (!current) return best;
    if (current.priority > best.priority) return current;
    if (current.priority === best.priority && current.targetHp < best.targetHp) return current;
    return best;
}

export function isBasicAttackTargetingBetter(best: any, current: any) {
    if (!best) return current;
    if (!current) return best;
    if (current.priority > best.priority) return current;
    if (current.priority === best.priority && current.targetHp < best.targetHp) return current;
    return best;
}


export function getValidSupportSkills(combatant: Combatant, board: Board) {
    let allCombatantSupportSkills = combatant.getSpecialMoves().filter(skill => 
        [SpecialMoveAlignment.Ally, SpecialMoveAlignment.Self, SpecialMoveAlignment.SelfAndAlly].includes(skill.range.align) &&
        (skill.checkRequirements === undefined || skill.checkRequirements(combatant))
    );

    allCombatantSupportSkills = shuffleArray(allCombatantSupportSkills);
    for (let i = 0; i < allCombatantSupportSkills.length; i++) {
        const skill = allCombatantSupportSkills[i];
        const validTargets = board.getValidTargetsForSkill(combatant, skill.range);
        if(validTargets.length > 0) {
            return {skill, targets: validTargets};
        }
    }

    return null;
}

export function mergeDeep(target: any, source: any): any {
    if (typeof target !== 'object' || target === null ||
        typeof source !== 'object' || source === null) {
      return source;
    }
  
    const merged = { ...target }; // Start with a shallow copy
  
    for (const key of Reflect.ownKeys(source)) { // Use Reflect.ownKeys for all keys
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
  
        if (typeof sourceValue === 'object' && sourceValue !== null && target[key]) {
          merged[key] = mergeDeep(target[key], sourceValue); // Recursive merge
        } else {
          merged[key] = sourceValue;
        }
      }
    }
    const proto = Object.getPrototypeOf(source);
       if(proto){
           for (const key of Reflect.ownKeys(proto)) {
               if (Object.prototype.hasOwnProperty.call(proto, key)) {
                   const protoValue = proto[key];
                   if(!merged[key]){
                        merged[key] = protoValue;
                   }
               }
           }
       }
    return merged;
}