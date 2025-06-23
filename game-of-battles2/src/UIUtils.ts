import { getStatusEffect, StatusEffect, StatusEffectApplication } from "./logic/StatusEffect";

export const getActionDescription = (action: string) => {
    switch (action) {
        case 'move':
            return 'Move to a new position';
        case 'attack':
            return 'Basic attack against an enemy';
        case 'skill':
            return "Use a special skill";
        case 'coop':
            return "Use a co-op skill with your allies";
        case 'defend':
            return 'Defend from incoming attacks';
        case 'skip':
            return 'Skip current combatant\'s turn';
        case 'undo':
            return 'Undo your last movement';
        case 'cancel':
            return 'Cancel current choice';
        case 'examine':
            return 'Examine a combatant';
        default:
            return '';
    }
}

export const getStatusEffectDescription = (statusEffect: StatusEffectApplication) => {
    return getStatusEffect(statusEffect.name)?.description || '';
}