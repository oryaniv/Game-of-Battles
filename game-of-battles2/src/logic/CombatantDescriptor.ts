import { CombatantType } from "./Combatants/CombatantType";
import { Combatant } from "./Combatant";


export interface CombatantDescription {
    id: number;
    name: string;
    description: string;
    role: string;
    pros: string;
    combatantType: CombatantType;
    combatantReference: Combatant;
}