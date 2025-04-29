import { Team } from "./logic/Team";
import { Militia} from './logic/Combatants/Militia';
import { Defender } from './logic/Combatants/Defender';
import { Hunter } from './logic/Combatants/Hunter';
import { Healer } from './logic/Combatants/Healer';
import { Wizard } from './logic/Combatants/Wizard'; 
import { Witch } from './logic/Combatants/Witch';
import { Fool } from './logic/Combatants/Fool';
import { Pikeman } from './logic/Combatants/Pikeman';
import { Vanguard } from './logic/Combatants/Vanguard';
import { FistWeaver } from './logic/Combatants/FistWeaver';
import { Combatant } from './logic/Combatant';
import { StandardBearer } from "./logic/Combatants/StandardBearer";


export function AllOfThem(team: Team) {
    team.addCombatant(new StandardBearer('A', { x: 0, y: 0 }, team));
    team.addCombatant(new Defender('B', { x: 1, y: 0 }, team));
    team.addCombatant(new Hunter('C', { x: 2, y: 0 }, team));
    team.addCombatant(new Healer('D', { x: 3, y: 0 }, team));
    team.addCombatant(new Wizard('E', { x: 4, y: 0 }, team));
    team.addCombatant(new Witch('F', { x: 5, y: 0 }, team));
    team.addCombatant(new Fool('G', { x: 6, y: 0 }, team));
    team.addCombatant(new Pikeman('H', { x: 7, y: 0 }, team));
    team.addCombatant(new Vanguard('I', { x: 8, y: 0 }, team));
    team.addCombatant(new FistWeaver('J', { x: 9, y: 0 }, team));
}

export function standardVsSetup(team1: Team, team2: Team) {
    team1.addCombatant(new StandardBearer('Booris', { x: 4, y: 1 }, team1));
    team1.addCombatant(new Defender('Igor', { x: 3, y: 1 }, team1));
    team1.addCombatant(new Hunter('Zarina', { x: 3 , y: 0 }, team1));
    team1.addCombatant(new Wizard('Ivan', { x: 4, y: 0 }, team1));
    team1.addCombatant(new Healer('Annika', { x: 2, y: 0 }, team1));
    // add to black team
    team2.addCombatant(new StandardBearer('Gary', { x: 5, y: 8 }, team2));
    team2.addCombatant(new Defender('Michael', { x: 6, y: 8 }, team2));
    team2.addCombatant(new Hunter('Jake', { x: 6, y: 9 }, team2));
    team2.addCombatant(new Wizard('Bran', { x: 5, y: 9 }, team2));
    team2.addCombatant(new Healer('Marianne', { x: 7, y: 9 }, team2));
    
}

