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
import { Gorilla } from "./logic/Combatants/Gorilla";
import { Board } from "./logic/Board";
import { CombatantType } from "./logic/Combatants/CombatantType";
import { AIAgent } from "./logic/AI/AIAgent";
import { shuffleArray } from "./logic/AI/AIUtils";
import { compileToFunction } from "vue";

export function allMilitiaSetup(team1: Team, team2: Team) {
    team1.addCombatant(new Hunter('A', { x: 3, y: 0 }, team1));
    team1.addCombatant(new Hunter('B', { x: 4, y: 0 }, team1));
    team1.addCombatant(new Hunter('C', { x: 5, y: 0 }, team1));
    team1.addCombatant(new Hunter('D', { x: 6, y: 0 }, team1));
    team1.addCombatant(new Hunter('E', { x: 7, y: 0 }, team1));

    team2.addCombatant(new Hunter('F', { x: 3, y: 9 }, team2));
    team2.addCombatant(new Hunter('G', { x: 4, y: 9 }, team2));
    team2.addCombatant(new Hunter('H', { x: 5, y: 9 }, team2));
    team2.addCombatant(new Hunter('I', { x: 6, y: 9 }, team2));
    team2.addCombatant(new Hunter('J', { x: 7, y: 9 }, team2));
}

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
    team2.addCombatant(new Wizard('Jake', { x: 6, y: 9 }, team2));
    team2.addCombatant(new Hunter('Bran', { x: 5, y: 9 }, team2));
    team2.addCombatant(new Healer('Marianne', { x: 7, y: 9 }, team2));
}

export function theATeam(team: Team) {
    team.addCombatant(new StandardBearer('A', { x: 4, y: 1 }, team));
    team.addCombatant(new Defender('B', { x: 3, y: 1 }, team));
    team.addCombatant(new Wizard('C', { x: 2, y: 0 }, team));
    team.addCombatant(new Hunter('D', { x: 4, y: 0 }, team));
    team.addCombatant(new Healer('E', { x: 3, y: 0 }, team));

    // team.addCombatant(new Witch('F', { x: 3, y: 0 }, team));
    // team.addCombatant(new Fool('G', { x: 4, y: 0 }, team));
    // team.addCombatant(new Vanguard('H', { x: 5, y: 1 }, team));
    // team.addCombatant(new FistWeaver('I', { x: 3, y: 1 }, team));
    // team.addCombatant(new Pikeman('J', { x: 4, y: 1 }, team));
}

export function theBTeam(team: Team) {
    team.addCombatant(new Healer('F', { x: 6, y: 9 }, team));
    team.addCombatant(new Wizard('G', { x: 7, y: 9 }, team));
    team.addCombatant(new StandardBearer('H', { x: 5, y: 8 }, team));
    team.addCombatant(new Defender('I', { x: 6, y: 8 }, team));
    team.addCombatant(new Hunter('J', { x: 5, y: 9 }, team));


    // team.addCombatant(new Witch('F', { x: 5, y: 9 }, team));
    // team.addCombatant(new Fool('G', { x: 6, y: 9 }, team));
    // team.addCombatant(new Vanguard('H', { x: 4, y: 8 }, team));
    // team.addCombatant(new FistWeaver('I', { x: 5, y: 8 }, team));
    // team.addCombatant(new Pikeman('J', { x: 6, y: 8 }, team));
}

export function theGorillaTeam(team: Team) {
    team.addCombatant(new Gorilla('A', { x: 5, y: 0 }, team));
}

export function generateRandomTeam(teamIndex: number, agent:AIAgent) {
    const team = new Team(`Team ${generateRandomString()}`, teamIndex, agent);
    const combatantCandidates = [
        new StandardBearer(generateRandomString(), { x: 0, y: 0 }, team),
        new Defender(generateRandomString(), { x: 0, y: 0 }, team),
        new Hunter(generateRandomString(), { x: 0, y: 0 }, team),
        new Wizard(generateRandomString(), { x: 0, y: 0 }, team),
        new Healer(generateRandomString(), { x: 0, y: 0 }, team),
        new Witch(generateRandomString(), { x: 0, y: 0 }, team),
        new Fool(generateRandomString(), { x: 0, y: 0 }, team),
        new Vanguard(generateRandomString(), { x: 0, y: 0 }, team),
        new FistWeaver(generateRandomString(), { x: 0, y: 0 }, team),
        new Pikeman(generateRandomString(), { x: 0, y: 0 }, team),
    ];
    shuffleArray(combatantCandidates);
    for(let i = 0; i < 5; i++) {
        team.addCombatant(combatantCandidates[i]);
    }
    return team;
}

export function placeAllCombatants(team1: Team, team2: Team, board: Board) {
    const frontLineTypes = [CombatantType.Defender, CombatantType.StandardBearer, CombatantType.Vanguard, CombatantType.Pikeman, CombatantType.FistWeaver];
    const backLineTypes = [CombatantType.Hunter, CombatantType.Wizard, CombatantType.Healer, CombatantType.Witch, CombatantType.Fool];
    const whiteTeamFrontY = 1;
    const whiteTeamBackY = 0;
    let whiteTeamBackXStart = 2;
    let whiteTeamfrontXStart = 3;
    const blackTeamFrontY = 8;
    const blackTeamBackY = 9;
    let blackTeamBackXStart = 7;
    let blackTeamFrontXStart = 6;
    
    team1.combatants.forEach((combatant) => {
        const isFrontLine = frontLineTypes.includes(combatant.getCombatantType());
        const yPosition = isFrontLine ? whiteTeamFrontY : whiteTeamBackY;
        const xPosition = isFrontLine ? whiteTeamfrontXStart : whiteTeamBackXStart;
        const position = { x: xPosition, y: yPosition };
        board.placeCombatant(combatant, position);
        if(isFrontLine) {
            whiteTeamfrontXStart++;
        } else {
            whiteTeamBackXStart++;
        }
    });
    
    team2.combatants.forEach((combatant) => {
        const isFrontLine = frontLineTypes.includes(combatant.getCombatantType());
        const yPosition = isFrontLine ? blackTeamFrontY : blackTeamBackY;
        const xPosition = isFrontLine ? blackTeamFrontXStart : blackTeamBackXStart;
        const position = { x: xPosition, y: yPosition };
        board.placeCombatant(combatant, position);
        if(isFrontLine) {
            blackTeamFrontXStart--;
        } else {
            blackTeamBackXStart--;
        }
    });
}

function generateRandomString(): string {
    const length = Math.floor(Math.random() * 3) + 8; // Length between 8 and 10
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
  
    // Use crypto.getRandomValues if available (for better randomness)
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const values = new Uint32Array(length);
      window.crypto.getRandomValues(values);
      for (let i = 0; i < length; i++) {
        randomString += characters[values[i] % characters.length];
      }
    } else {
      // Fallback to Math.random (less random, but still decent)
      for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    }
    return randomString;
}

export function refreshTeam(team: Team) {
    team.combatants.forEach((combatant) => {
        combatant.removeAllStatusEffects();
        combatant.stats.hp = combatant.baseStats.hp;
        combatant.stats.stamina = combatant.baseStats.stamina;
        combatant.stats.attackPower = combatant.baseStats.attackPower;
        combatant.stats.defensePower = combatant.baseStats.defensePower;
        combatant.stats.agility = combatant.baseStats.agility;
        combatant.stats.luck = combatant.baseStats.luck;
        combatant.stats.initiative = combatant.baseStats.initiative;
        combatant.stats.movementSpeed = combatant.baseStats.movementSpeed;
        combatant.stats.range = combatant.baseStats.range;
        combatant.position = { x: 0, y: 0 };
        combatant.hasMoved = false;
    });
}