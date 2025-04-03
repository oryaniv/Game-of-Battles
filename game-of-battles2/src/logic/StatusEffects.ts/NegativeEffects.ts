import { StatusEffectAlignment } from "../StatusEffect";

import { Combatant } from "../Combatant";
import { StatusEffectHook, StatusEffectType } from "../StatusEffect";

import { StatusEffect } from "../StatusEffect";

export class ImmobilizedStatusEffect implements StatusEffect {
    name: StatusEffectType = StatusEffectType.IMMOBILIZED;
    applicationHooks =  {
        [StatusEffectHook.OnApply]: (self: Combatant) => {
            self.stats.movementSpeed = Number.NEGATIVE_INFINITY;
        },
        [StatusEffectHook.OnRemove]: (self: Combatant) => {
            self.stats.movementSpeed = self.baseStats.movementSpeed;
        },
    };
    alignment: StatusEffectAlignment = StatusEffectAlignment.Negative;
}