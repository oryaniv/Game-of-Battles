import { Team } from "./logic/Team";
import { Militia} from './logic/Combatants/Militia';
import { Defender } from './logic/Combatants/Defender';
import { Hunter } from './logic/Combatants/Hunter';
import { Healer } from './logic/Combatants/Healer';
import { Wizard } from './logic/Combatants/Wizard'; 
import { Witch } from './logic/Combatants/Witch';
import { Doll, Fool } from './logic/Combatants/Fool';
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
import { DragonOfChaos } from "./logic/Combatants/DragonOfChaos";
import { Rogue } from "./logic/Combatants/Rogue";
import { Artificer } from "./logic/Combatants/Artificer";
import { DummyAIAgent, KidAIAgent, RookieAIAgent } from "./logic/AI/DeterministicAgents";
import { VeteranAIAgent } from "./logic/AI/VeteranAIAgent";
import { Troll } from "./logic/Combatants/Troll";
import { Dragon } from "./logic/Combatants/Dragon";
import { WeaveEater } from "./logic/Combatants/WeaveEater";
import { OozeGolem } from "./logic/Combatants/OozeGolem";
import { TwinBlade } from "./logic/Combatants/TwinBlade";
import { BabyBabel, Wall, BallistaTurret, Bomb } from "./logic/Combatants/ArtificerConstructs";
import { StatusEffectType } from "./logic/StatusEffect";
import { Heal } from "./logic/SpecialMoves/Singular/Support";

export function playGroundTeams(): Team[] {
    const veternAIAgentWithCoop = new VeteranAIAgent();
    veternAIAgentWithCoop.setCollectCoop(true);
    const veternAIAgentNoCoop = new VeteranAIAgent();
    veternAIAgentNoCoop.setCollectCoop(false);
    const rookieAIAgent = new RookieAIAgent();
    const rookieWithCoop = new RookieAIAgent();
    rookieWithCoop.setCollectCoop(true);
    const whiteTeam = new Team('Blue Team', 0,);
    const blackTeam = new Team('Red Team', 1, veternAIAgentWithCoop );

   
    // whiteTeam.addCombatant(new Vanguard('Layla', { x: 3, y: 0}, whiteTeam));
    // whiteTeam.addCombatant(new Defender('Dorgo', { x: 6, y: 5}, whiteTeam));
    // whiteTeam.addCombatant(new FistWeaver('P5', { x: 3, y: 7}, whiteTeam));
    whiteTeam.addCombatant(new Vanguard('P9', { x: 5, y: 3}, whiteTeam));
    // whiteTeam.addCombatant(new Fool('P11', { x: 3, y: 1}, whiteTeam));
    // whiteTeam.addCombatant(new Witch('P12', { x: 3, y: 2}, whiteTeam));
    // whiteTeam.addCombatant(new Vanguard('P13', { x: 3, y: 3}, whiteTeam));
    // whiteTeam.addCombatant(new Hunter('P14', { x: 3, y: 4}, whiteTeam));
    // whiteTeam.addCombatant(new StandardBearer('P15', { x: 3, y: 5}, whiteTeam));
    

    // blackTeam.addCombatant(new Dragon('Umbral', { x: 3, y: 1}, blackTeam));
    blackTeam.addCombatant(new Wizard('Ragnar', { x: 3, y: 4}, blackTeam));
    // blackTeam.addCombatant(new Witch('Elena', { x: 3, y: 9}, blackTeam));
    // blackTeam.addCombatant(new Pikeman('Zhao', { x: 3, y: 8}, blackTeam));
    // blackTeam.addCombatant(new Hunter('Nina', { x: 4, y: 5}, blackTeam));
    // blackTeam.addCombatant(new FistWeaver('Rina', { x: 4, y: 5}, blackTeam));
    // 
    // // whiteTeam.addCombatant(new Vanguard('P9', { x: 3, y: 12}, whiteTeam));
    // whiteTeam.addCombatant(new StandardBearer('P10', { x: 3, y: 1}, whiteTeam)); 
    // whiteTeam.addCombatant(new Vanguard('P2', { x: 3, y: 4}, whiteTeam));
    
    // blackTeam.addCombatant(new Witch('W1', { x: 3, y: 5}, blackTeam));
    

    // blackTeam.addCombatant(new TwinBlade('V3', { x: 5, y: 6}, blackTeam));
    // blackTeam.addCombatant(new TwinBlade('V4', { x: 5, y: 7}, blackTeam));


    // blackTeam.addCombatant(new OozeGolem('V3', { x: 5, y: 6}, blackTeam));
    // blackTeam.addCombatant(new OozeGolem('V4', { x: 5, y: 7}, blackTeam));
    // blackTeam.addCombatant(new WeaveEater('V5', { x: 5, y: 8}, blackTeam));
    // blackTeam.addCombatant(new WeaveEater('V6', { x: 5, y: 9}, blackTeam));




    // whiteTeam.combatants[1].applyStatusEffect({
    //     name: StatusEffectType.ARCANE_CHANNELING,
    //     duration: 3,
    // });

    // whiteTeam.combatants[0].applyStatusEffect({
    //     name: StatusEffectType.BLEEDING,
    //     duration: 3,
    // });

    // whiteTeam.combatants[0].applyStatusEffect({
    //     name: StatusEffectType.DEFENSE_DOWNGRADE,
    //     duration: 3,
    // });

    // whiteTeam.combatants[0].applyStatusEffect({
    //     name: StatusEffectType.ARCANE_BARRIER,
    //     duration: 3,
    // });

    // whiteTeam.combatants[1].applyStatusEffect({
    //     name: StatusEffectType.LAST_STAND_USED,
    //     duration: 3,
    // });

    // whiteTeam.combatants[1].applyStatusEffect({
    //     name: StatusEffectType.SLOW,
    //     duration: 3,
    // });

    // whiteTeam.combatants[1].applyStatusEffect({
    //     name: StatusEffectType.ARCANE_CHANNELING,
    //     duration: 3,
    // });

    // whiteTeam.combatants[2].applyStatusEffect({
    //     name: StatusEffectType.ENERGY_ABSORB,
    //     duration: 3,
    // });

    // whiteTeam.combatants[2].applyStatusEffect({
    //     name: StatusEffectType.ENCOURAGED,
    //     duration: 3,
    // });

    // blackTeam.combatants[0].applyStatusEffect({
    //     name: StatusEffectType.BLEEDING,
    //     duration: 3,
    // });

    // blackTeam.combatants[0].applyStatusEffect({
    //     name: StatusEffectType.ARCANE_BARRIER,
    //     duration: 3,
    // });

    // blackTeam.combatants[0].applyStatusEffect({
    //     name: StatusEffectType.BURNING,
    //     duration: 3,
    // });

    // blackTeam.combatants[0].applyStatusEffect({
    //     name: StatusEffectType.SLOW,
    //     duration: 3,
    // });

    // blackTeam.combatants[1].applyStatusEffect({
    //     name: StatusEffectType.DEFENSE_DOWNGRADE,
    //     duration: 3,
    // });

    // blackTeam.combatants[1].applyStatusEffect({
    //     name: StatusEffectType.ENCOURAGED,
    //     duration: 3,
    // });
    // blackTeam.combatants[1].applyStatusEffect({
    //     name: StatusEffectType.SLEEPING,
    //     duration: 3,
    // });
    // blackTeam.combatants[1].applyStatusEffect({
    //     name: StatusEffectType.CIRCUS_DIABOLIQUE,
    //     duration: 3,
    // });
    // blackTeam.combatants[1].applyStatusEffect({
    //     name: StatusEffectType.TAUNTED,
    //     duration: 3,
    // });
    // blackTeam.combatants[1].applyStatusEffect({
    //     name: StatusEffectType.STAGGERED,
    //     duration: 3,
    // });


    // blackTeam.combatants[0].applyStatusEffect({
    //     name: StatusEffectType.NIGHTMARE_LOCKED,
    //     duration: 1,
    // });

    // blackTeam.combatants[0].applyStatusEffect({
    //     name: StatusEffectType.MESMERIZING,
    //     duration: 1,
    // });

    // blackTeam.combatants[0].applyStatusEffect({
    //     name: StatusEffectType.STUPEFIED,
    //     duration: 1,
    // });
    
    return [whiteTeam, blackTeam];
}



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
    // team.addCombatant(new StandardBearer('A', { x: 4, y: 1 }, team));
    // team.addCombatant(new Defender('B', { x: 3, y: 1 }, team));
    // team.addCombatant(new Healer('E', { x: 3, y: 0 }, team));
    // team.addCombatant(new Wizard('C', { x: 2, y: 0 }, team));
    // team.addCombatant(new Hunter('D', { x: 4, y: 0 }, team));
    

    team.addCombatant(new Witch('A', { x: 3, y: 0 }, team));
    team.addCombatant(new Rogue('B', { x: 4, y: 0 }, team));
    team.addCombatant(new Vanguard('C', { x: 5, y: 1 }, team));
    team.addCombatant(new FistWeaver('D', { x: 3, y: 1 }, team));
    team.addCombatant(new Pikeman('E', { x: 4, y: 1 }, team));
}

export function theBTeam(team: Team) {
    // team.addCombatant(new StandardBearer('H', { x: 5, y: 8 }, team));
    // team.addCombatant(new Defender('I', { x: 6, y: 8 }, team));
    // team.addCombatant(new Healer('F', { x: 6, y: 9 }, team));
    // team.addCombatant(new Wizard('G', { x: 7, y: 9 }, team));
    // team.addCombatant(new Hunter('J', { x: 5, y: 9 }, team));


    team.addCombatant(new Witch('F', { x: 5, y: 9 }, team));
    team.addCombatant(new Rogue('G', { x: 6, y: 9 }, team));
    team.addCombatant(new Vanguard('H', { x: 4, y: 8 }, team));
    team.addCombatant(new FistWeaver('I', { x: 5, y: 8 }, team));
    team.addCombatant(new Pikeman('J', { x: 6, y: 8 }, team));
// }
}


export function theCTeam(team: Team) {
    team.addCombatant(new Wizard('A', { x: 3, y: 0 }, team));
    team.addCombatant(new Healer('B', { x: 4, y: 0 }, team));
    team.addCombatant(new Hunter('C', { x: 5, y: 0 }, team));
    team.addCombatant(new StandardBearer('D', { x: 6, y: 0 }, team));
    team.addCombatant(new FistWeaver('E', { x: 7, y: 0 }, team));
}

export function theDTeam(team: Team) {
    team.addCombatant(new Wizard('F', { x: 3, y: 0 }, team));
    team.addCombatant(new Healer('I', { x: 4, y: 0 }, team));
    team.addCombatant(new Hunter('H', { x: 5, y: 0 }, team));
    team.addCombatant(new StandardBearer('Q', { x: 6, y: 0 }, team));
    team.addCombatant(new FistWeaver('T', { x: 7, y: 0 }, team));
}

export function theGorillaTeam(team: Team) {
    team.addCombatant(new Gorilla('A', { x: 5, y: 0 }, team));
}


export function debugSetupWhiteTeam(team: Team) {
    team.addCombatant(new Vanguard('A', { x: 4, y: 0 }, team));
    team.addCombatant(new Fool('B', { x: 3, y: 0 }, team));
    team.addCombatant(new Healer('C', { x: 2, y: 0 }, team));
    team.addCombatant(new Rogue('D', { x: 4, y: 0 }, team));
    team.addCombatant(new Pikeman('E', { x: 5, y: 0 }, team));
}

export function debugSetupBlackTeam(team: Team) {
    team.addCombatant(new Vanguard('F', { x: 4, y: 0 }, team));
    team.addCombatant(new Fool('G', { x: 3, y: 0 }, team));
    team.addCombatant(new Healer('H', { x: 2, y: 0 }, team));
    team.addCombatant(new Rogue('I', { x: 4, y: 0 }, team));
    team.addCombatant(new Pikeman('J', { x: 5, y: 0 }, team));
}

export function generateRandomTeam(teamIndex: number, agent?:AIAgent) {
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
        new Rogue(generateRandomString(), { x: 0, y: 0 }, team),
        new Artificer(generateRandomString(), { x: 0, y: 0 }, team),

        // 2nd wave
        // new StandardBearer(generateRandomString(), { x: 0, y: 0 }, team),
        // new Defender(generateRandomString(), { x: 0, y: 0 }, team),
        // new Hunter(generateRandomString(), { x: 0, y: 0 }, team),
        // new Wizard(generateRandomString(), { x: 0, y: 0 }, team),
        // new Healer(generateRandomString(), { x: 0, y: 0 }, team),
        // new Witch(generateRandomString(), { x: 0, y: 0 }, team),
        // new Fool(generateRandomString(), { x: 0, y: 0 }, team),
        // new Vanguard(generateRandomString(), { x: 0, y: 0 }, team),
        // new FistWeaver(generateRandomString(), { x: 0, y: 0 }, team),
        // new Pikeman(generateRandomString(), { x: 0, y: 0 }, team),
        // new Rogue(generateRandomString(), { x: 0, y: 0 }, team),
    ];
    shuffleArray(combatantCandidates);
    for(let i = 0; i < 5; i++) {
        team.addCombatant(combatantCandidates[i]);
    }
    return team;
}

export function generateCombatantIdenticalTeam(team: Team, teamIndex: number, agent?: AIAgent) {
    const newTeam = new Team(`Team ${generateRandomString()}`, teamIndex, agent);
    const combatantCandidates = [
        new StandardBearer(generateRandomString(), { x: 0, y: 0 }, newTeam),
        new Defender(generateRandomString(), { x: 0, y: 0 }, newTeam),
        new Hunter(generateRandomString(), { x: 0, y: 0 }, newTeam),
        new Wizard(generateRandomString(), { x: 0, y: 0 }, newTeam),
        new Healer(generateRandomString(), { x: 0, y: 0 }, newTeam),
        new Witch(generateRandomString(), { x: 0, y: 0 }, newTeam),
        new Fool(generateRandomString(), { x: 0, y: 0 }, newTeam),
        new Vanguard(generateRandomString(), { x: 0, y: 0 }, newTeam),
        new FistWeaver(generateRandomString(), { x: 0, y: 0 }, newTeam),
        new Pikeman(generateRandomString(), { x: 0, y: 0 }, newTeam),
        new Rogue(generateRandomString(), { x: 0, y: 0 }, newTeam),
        new Artificer(generateRandomString(), { x: 0, y: 0 }, newTeam),
    ];
    team.combatants.forEach((combatant) => {
        const type: CombatantType = combatant.getCombatantType();
        const combatantToAdd = combatantCandidates.find((combatant) => combatant.getCombatantType() === type);
        if(!combatantToAdd) {
            throw new Error("combatant does not exist in the copied team");
        }
        newTeam.addCombatant(combatantToAdd);
    });
    return newTeam;
}

export function placeAllCombatants(team1: Team, team2: Team, board: Board) {
    const frontLineTypes = [CombatantType.Defender, CombatantType.StandardBearer, CombatantType.Vanguard, CombatantType.Pikeman, CombatantType.FistWeaver];
    const backLineTypes = [CombatantType.Rogue, CombatantType.Hunter, CombatantType.Wizard, CombatantType.Healer, CombatantType.Witch, CombatantType.Fool,CombatantType.Artificer];
    const whiteTeamFrontY = 8;
    const whiteTeamBackY = 9;
    let whiteTeamBackXStart = 2;
    let whiteTeamfrontXStart = 3;
    const blackTeamFrontY = 1;
    const blackTeamBackY = 0;
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
    team.combatants = team.combatants.filter((combatant) => !combatant.isExpendable());
    team.combatants.forEach((combatant) => refreshCombatant(combatant, team));
}

export function refreshCombatant(combatant: Combatant, team: Team) {
    combatant.removeAllStatusEffects();
    const replicaCombatant = getCombatantByType(combatant.getCombatantType(), team);
    combatant.baseStats.hp = replicaCombatant.baseStats.hp;
    combatant.baseStats.stamina = replicaCombatant.baseStats.stamina;
    combatant.baseStats.attackPower = replicaCombatant.baseStats.attackPower;
    combatant.baseStats.defensePower = replicaCombatant.baseStats.defensePower;
    combatant.baseStats.agility = replicaCombatant.baseStats.agility;
    combatant.baseStats.luck = replicaCombatant.baseStats.luck;
    combatant.baseStats.initiative = replicaCombatant.baseStats.initiative;
    combatant.baseStats.movementSpeed = replicaCombatant.baseStats.movementSpeed;
    combatant.baseStats.range = replicaCombatant.baseStats.range;
    combatant.stats.hp = replicaCombatant.baseStats.hp;
    combatant.stats.stamina = replicaCombatant.baseStats.stamina;
    combatant.stats.attackPower = replicaCombatant.baseStats.attackPower;
    combatant.stats.defensePower = replicaCombatant.baseStats.defensePower;
    combatant.stats.agility = replicaCombatant.baseStats.agility;
    combatant.stats.luck = replicaCombatant.baseStats.luck;
    combatant.stats.initiative = replicaCombatant.baseStats.initiative;
    combatant.stats.movementSpeed = replicaCombatant.baseStats.movementSpeed;
    combatant.stats.range = replicaCombatant.baseStats.range;
    combatant.position = { x: 0, y: 0 };
    combatant.hasMoved = false;
}

export function getCombatantByType(type: CombatantType, team: Team): Combatant {
    const position = { x: 0, y: 0 };
    const name = generateRandomString();

    switch(type) {
        case CombatantType.Militia:
            return new Militia(name, position, team);
        case CombatantType.Defender:
            return new Defender(name, position, team);
        case CombatantType.Hunter:
            return new Hunter(name, position, team);
        case CombatantType.Healer:
            return new Healer(name, position, team);
        case CombatantType.Wizard:
            return new Wizard(name, position, team);
        case CombatantType.Witch:
            return new Witch(name, position, team);
        case CombatantType.Fool:
            return new Fool(name, position, team);
        case CombatantType.Pikeman:
            return new Pikeman(name, position, team);
        case CombatantType.Vanguard:
            return new Vanguard(name, position, team);
        case CombatantType.FistWeaver:
            return new FistWeaver(name, position, team);
        case CombatantType.StandardBearer:
            return new StandardBearer(name, position, team);
        case CombatantType.Rogue:
            return new Rogue(name, position, team);
        case CombatantType.Artificer:
            return new Artificer(name, position, team);
        case CombatantType.Gorilla:
            return new Gorilla(name, position, team);
        case CombatantType.Troll:
            return new Troll(name, position, team);
        case CombatantType.Dragon:
            return new Dragon(name, position, team);
        case CombatantType.WeaveEater:
            return new WeaveEater(name, position, team);
        case CombatantType.OozeGolem:
            return new OozeGolem(name, position, team);
        case CombatantType.TwinBlades:
            return new TwinBlade(name, position, team);
        default:
            return new Militia(name, position, team);
    }
}

export function generateExamplePlayerTeam(): Team {
        const team = new Team('Your team', 0);
        team.addCombatant(new Defender('Aragorn', { x: 3, y: 5}, team));
        team.addCombatant(new Wizard('Feloron', { x: 3, y: 6}, team));
        team.addCombatant(new Hunter('Orion', { x: 3, y: 7}, team));
        team.addCombatant(new FistWeaver('Ororo', { x: 3, y: 8}, team));
        team.addCombatant(new Wizard('Irenicus', { x: 3, y: 9}, team));
        return team;
}