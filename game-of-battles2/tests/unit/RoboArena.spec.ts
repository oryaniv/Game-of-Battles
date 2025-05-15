import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Board } from '../../src/logic/Board';
import { Combatant } from '../../src/logic/Combatant';
import { Position } from '@/logic/Position';
import { DamageReaction, DamageType } from '@/logic/Damage';
import { Militia } from '@/logic/Combatants/Militia';
import { Team } from '@/logic/Team';
import { Game } from '@/logic/Game';
import { StatusEffectType } from '@/logic/StatusEffect';
import { CombatMaster } from '@/logic/CombatMaster';
import { AttackResult } from '@/logic/attackResult';
import { generateRandomTeam, placeAllCombatants, refreshTeam, theATeam, theBTeam, theGorillaTeam } from '@/boardSetups';
import { RookieAIAgent, ToddlerAIAgent, KidAIAgent, TeenagerAIAgent } from '@/logic/AI/DeterministicAgents';
import { shuffleArray } from '@/logic/AI/AIUtils';
import { VeteranAIAgent } from '@/logic/AI/VeteranAIAgent';
import { RandomAIAgent } from '@/logic/AI/HeuristicalAgents';
import { MatchData, TeamRecord, combatantReportStats, generateDateString } from './BattleReportGenerator';
import { generateHtmlReport } from './BattleReportGenerator';
import { StandardBearer } from '@/logic/Combatants/StandardBearer';
import { Healer } from '@/logic/Combatants/Healer';
import { Defender } from '@/logic/Combatants/Defender';
import { Wizard } from '@/logic/Combatants/Wizard';
import { Hunter } from '@/logic/Combatants/Hunter';
import { FistWeaver } from '@/logic/Combatants/FistWeaver';
import { Fool } from '@/logic/Combatants/Fool';
import { Pikeman } from '@/logic/Combatants/Pikeman';
import { Witch } from '@/logic/Combatants/Witch';
import { Vanguard } from '@/logic/Combatants/Vanguard';
import { CombatantType } from '@/logic/Combatants/CombatantType';
let errorCount = 0;

describe('RoboArenta', () => {

    it('Ai Agent match 1', () => {
        let roundCounts = [];
        let winnerCounts = [];
        for(let i = 0; i < 100; i++) {
            const matchResult = exampleMatch();
            roundCounts.push(matchResult.roundCount);
            winnerCounts.push(matchResult.winner);
        }
        console.log(`round count average is ${roundCounts
            .reduce((a, b) => a + b, 0) / roundCounts.length}`);

        const veteranWinCount = winnerCounts.filter((winner) => winner === 'Team Veteran').length;
        const veteranWinPercentage = veteranWinCount / winnerCounts.length;
        console.log(`veteran win percentage is ${veteranWinPercentage}`);

        console.log(`error count is ${errorCount}`);
            expect(true).toBe(true);
    });



    // it('Balancing battles', () => {
    //     let matchDataCollection: MatchData[] = [];
    //     const teamRecords: TeamRecord[] = [];
    //     let team1 = generateRandomTeam(0, new RookieAIAgent());
    //     let team2 = generateRandomTeam(1, new RookieAIAgent());

    //     for(let i = 0; i < 1000; i++) {
    //         let matchData: MatchData;
    //         try{
    //             matchData = combatantBalancingMatch(team1, team2);
    //         } catch (error) {
    //             console.log('an Error was thrown, restarting match', error);
    //             refreshTeam(team1);
    //             refreshTeam(team2);
    //             continue;
    //         }
    //         matchDataCollection.push(matchData);
    //         if(matchData.winningTeamName === team1.getName()) {
    //             team2 = generateRandomTeam(1, new RookieAIAgent());
    //             refreshTeam(team1);
    //             updateOrCreateTeamRecord(team1.getName(), team1, teamRecords);
    //         } else {
    //             team1 = generateRandomTeam(0, new RookieAIAgent());
    //             refreshTeam(team2);
    //             updateOrCreateTeamRecord(team2.getName(), team2, teamRecords);
    //         }
    //     }

    //     console.log(`error count is ${errorCount}`);
    //         expect(true).toBe(true);

    //     const date = generateDateString();
    //     generateHtmlReport(matchDataCollection, teamRecords, `Battle_Report_${date}.html`);
    // });
    
});


function exampleMatch() {
    const team1 = new Team('Team Rookie', 0, new KidAIAgent());
    const team2 = new Team('Team Veteran', 1, new VeteranAIAgent());
    let board = new Board(10, 10);
    
    theATeam(team1);
    theBTeam(team2);
    const game = new Game([team1, team2], board);


    try {
        while(!game.isGameOver()) {
            const currentCombatant = game.getCurrentCombatant();
            currentCombatant.getAiAgent()?.playTurn(currentCombatant, game, board);
            game.nextTurn();
            const deadCombatants = board.getAllCombatants().filter((combatant) => combatant.stats.hp <= 0);
            deadCombatants.forEach((combatant) => {
                board.removeCombatant(combatant);
            });
        }
    } catch (error) {
        errorCount++;
        console.log('an Error was thrown', error);
    }
    
    const winner = game.getWinner();
    console.log(`%cwinning team is ${winner?.getName()}`, 'color: red');
    return {roundCount: game.getRoundCount(), winner: winner?.getName()};
}   

function combatantBalancingMatch(team1: Team, team2: Team): MatchData {
    let board = new Board(10, 10);
    placeAllCombatants(team1, team2, board);
    
    const game = new Game([team1, team2], board);
    const allCombatants = board.getAllCombatants();
    const allCombatantStats: combatantReportStats[] = generateCombatantStats(allCombatants);


    try {
        while(!game.isGameOver()) {
            const currentCombatant = game.getCurrentCombatant();
            const enemyteamHpStartTurn = game.teams[1 - currentCombatant.team.getIndex()].getAliveCombatants().reduce((acc, combatant) => acc + combatant.stats.hp, 0);
            
            
            currentCombatant.getAiAgent()?.playTurn(currentCombatant, game, board);
            
            const enemyteamHpEndTurn = game.teams[1 - currentCombatant.team.getIndex()].getAliveCombatants().reduce((acc, combatant) => acc + combatant.stats.hp, 0);
            const damageDone = enemyteamHpStartTurn - enemyteamHpEndTurn;
            const currentStat = getCombatantStats(currentCombatant.name, allCombatantStats);
            currentStat.damageDone = damageDone;
            game.nextTurn();

            if(game.getRoundCount() > 40) {
                break;
            }

            const deadCombatants = board.getAllCombatants().filter((combatant) => combatant.stats.hp <= 0);
            deadCombatants.forEach((combatant) => {
                // update the dead combatant's stats
                const deadStat = getCombatantStats(combatant.name, allCombatantStats);
                deadStat.finalHp = combatant.stats.hp;
                deadStat.finalStamina = combatant.stats.stamina;
                deadStat.survivalRounds = game.getRoundCount();
                // update the current combatant's kills
                const currentStat = getCombatantStats(currentCombatant.name, allCombatantStats);
                currentStat.kills++;
                board.removeCombatant(combatant);
            });
        }
    } catch (error) {
        errorCount++;
        console.log('an Error was thrown', error);
    }
    
    const winner = game.getWinner();
    const loser = game.getLoser();
    if(!winner || !loser) {
        throw new Error('No winner found');
    }
    console.log(`%cwinning team is ${winner?.getName()}`, 'color: red');

    winner.getAliveCombatants().forEach((combatant) => {
        const stat = getCombatantStats(combatant.name, allCombatantStats);
        stat.survivalRounds = game.getRoundCount();
        stat.finalHp = combatant.stats.hp;
        stat.finalStamina = combatant.stats.stamina;
        stat.win = true;
    });
   
    return {
        roundCount: game.getRoundCount(),
        winningTeamName: winner.getName(),
        winningTeam: winner,
        losingTeam: loser,
        combatantStats: allCombatantStats
    }
}

function generateCombatantStats(combatants: Combatant[]): combatantReportStats[] {
    return combatants.map((combatant) => {
        return {
            name: combatant.name,
            type: combatant.getCombatantType(),
            win: false,
            kills: 0,
            survivalRounds: 0,
            finalHp: 0,
            finalStamina: 0,
            damageDone: 0,
        }
    });
}

function getCombatantStats(combatantName: string, combatantStats: combatantReportStats[]): combatantReportStats {
    const stat = combatantStats.find((stat) => stat.name === combatantName);
    if(!stat) {
        throw new Error(`Combatant ${combatantName} not found in combatantStats`);
    }
    return stat;
}

// function generateRandomTeam(teamIndex: number) {
//     const team = new Team(`Team ${generateRandomString()}`, teamIndex, new RookieAIAgent());
//     const combatantCandidates = [
//         new StandardBearer(generateRandomString(), { x: 0, y: 0 }, team),
//         new Defender(generateRandomString(), { x: 0, y: 0 }, team),
//         new Hunter(generateRandomString(), { x: 0, y: 0 }, team),
//         new Wizard(generateRandomString(), { x: 0, y: 0 }, team),
//         new Healer(generateRandomString(), { x: 0, y: 0 }, team),
//         new Witch(generateRandomString(), { x: 0, y: 0 }, team),
//         new Fool(generateRandomString(), { x: 0, y: 0 }, team),
//         new Vanguard(generateRandomString(), { x: 0, y: 0 }, team),
//         new FistWeaver(generateRandomString(), { x: 0, y: 0 }, team),
//         new Pikeman(generateRandomString(), { x: 0, y: 0 }, team),
//     ];
//     shuffleArray(combatantCandidates);
//     for(let i = 0; i < 5; i++) {
//         team.addCombatant(combatantCandidates[i]);
//     }
//     return team;
// }

// function placeAllCombatants(team1: Team, team2: Team, board: Board) {
//     const frontLineTypes = [CombatantType.Defender, CombatantType.StandardBearer, CombatantType.Vanguard, CombatantType.Pikeman, CombatantType.FistWeaver];
//     const backLineTypes = [CombatantType.Hunter, CombatantType.Wizard, CombatantType.Healer, CombatantType.Witch, CombatantType.Fool];
//     const whiteTeamFrontY = 1;
//     const whiteTeamBackY = 0;
//     let whiteTeamBackXStart = 2;
//     let whiteTeamfrontXStart = 3;
//     const blackTeamFrontY = 8;
//     const blackTeamBackY = 9;
//     let blackTeamBackXStart = 7;
//     let blackTeamFrontXStart = 6;
    
//     team1.combatants.forEach((combatant) => {
//         const isFrontLine = frontLineTypes.includes(combatant.getCombatantType());
//         const yPosition = isFrontLine ? whiteTeamFrontY : whiteTeamBackY;
//         const xPosition = isFrontLine ? whiteTeamfrontXStart : whiteTeamBackXStart;
//         const position = { x: xPosition, y: yPosition };
//         board.placeCombatant(combatant, position);
//         if(isFrontLine) {
//             whiteTeamfrontXStart++;
//         } else {
//             whiteTeamBackXStart++;
//         }
//     });
    
//     team2.combatants.forEach((combatant) => {
//         const isFrontLine = frontLineTypes.includes(combatant.getCombatantType());
//         const yPosition = isFrontLine ? blackTeamFrontY : blackTeamBackY;
//         const xPosition = isFrontLine ? blackTeamFrontXStart : blackTeamBackXStart;
//         const position = { x: xPosition, y: yPosition };
//         board.placeCombatant(combatant, position);
//         if(isFrontLine) {
//             blackTeamFrontXStart--;
//         } else {
//             blackTeamBackXStart--;
//         }
//     });
// }

// function generateRandomString(): string {
//     const length = Math.floor(Math.random() * 3) + 8; // Length between 8 and 10
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let randomString = '';
  
//     // Use crypto.getRandomValues if available (for better randomness)
//     if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
//       const values = new Uint32Array(length);
//       window.crypto.getRandomValues(values);
//       for (let i = 0; i < length; i++) {
//         randomString += characters[values[i] % characters.length];
//       }
//     } else {
//       // Fallback to Math.random (less random, but still decent)
//       for (let i = 0; i < length; i++) {
//         randomString += characters.charAt(Math.floor(Math.random() * characters.length));
//       }
//     }
//     return randomString;
// }

function updateOrCreateTeamRecord(teamName: string, team: Team, teamRecords: TeamRecord[]) {
    const teamRecord = teamRecords.find((record) => record.teamName === teamName);
    if(teamRecord) {
        teamRecord.longestWinStreak++;
    } else {
        teamRecords.push({ teamName: teamName, team: team, longestWinStreak: 0, longestLossStreak: 0 });
    }
}  


  

