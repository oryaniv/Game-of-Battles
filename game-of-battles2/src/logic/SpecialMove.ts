import { Combatant } from "./Combatant";
import { Damage } from "./Damage";
import { Position } from "./Position";

export interface SpecialMove {
    name: string;
    cost: number;
    range: number;
    damage: Damage;
    effect?: (target: Combatant) => void; // Optional effect
  }