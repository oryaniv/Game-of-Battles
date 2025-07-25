export const HEALTH_INCREASE_ENABLED = true;
export const HEALTH_INCREASE_AMOUNT = 20;

export const STAMINA_INCREASE_ENABLED = true;  
export const STAMINA_INCREASE_AMOUNT = 10;

export const STAT_BUFF_INCREASE_ENABLED = true;
export const ATTACK_DEFENSE_INCREASE_AMOUNT = 10;
export const AGILITY_LUCK_INCREASE_AMOUNT = 5;

export const WEAKNESS_MINIMIZE_ENABLED = false;


export function getEmptyAsType<T>():T {
    return <T>(<unknown>undefined);
}
