import { Combatant } from "./Combatant";
import { Damage } from "./Damage";
import { Position } from "./Position";
import { StatusEffectType } from "./StatusEffect";

export interface SpecialMove {
    name: string;
    cost: number;
    range: number;
    damage: Damage;
    effect?: (target: Combatant) => void;
    statusEffectChance?: { statusEffect: StatusEffectType; chance: number };
  }