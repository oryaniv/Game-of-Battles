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
import { generateCombatantIdenticalTeam, generateRandomTeam, placeAllCombatants, refreshTeam, theATeam, theBTeam, theCTeam, theDTeam, theGorillaTeam } from '@/boardSetups';
import { RookieAIAgent, ToddlerAIAgent, KidAIAgent, TeenagerAIAgent } from '@/logic/AI/DeterministicAgents';
import { shuffleArray } from '@/logic/AI/AIUtils';
import { VeteranAIAgent } from '@/logic/AI/VeteranAIAgent';
import { RandomAIAgent } from '@/logic/AI/HeuristicalAgents';
import { MatchData, TeamRecord, combatantReportStats, generateDateString } from './BattleReportGenerator';
import { generateBattleReportHtml } from './BattleReportGenerator';
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

    it.only('Ai Agent match 1', () => {
        const roundCounts = [];
        const winnerCounts = [];
        for(let i = 0; i < 1000; i++) {
            try {
                const matchResult = exampleMatch(i);
                roundCounts.push(matchResult.roundCount);
                winnerCounts.push(matchResult.winner);
            } catch (error) {
                console.log('an Error was thrown, restarting match', error);
                continue;
            }
        }
        console.log(`round count average is ${roundCounts
            .reduce((a, b) => a + b, 0) / roundCounts.length}`);

        const veteranWinCount = winnerCounts.filter((winner) => winner === 'Team withCoop').length;
        const veteranWinPercentage = veteranWinCount / winnerCounts.length;
        console.log(`withCoop win percentage is ${veteranWinPercentage}`);

        console.log(`error count is ${errorCount}`);
            expect(true).toBe(true);
    });



    it.skip('Balancing battles', () => {
        const matchDataCollection: MatchData[] = [];
        const teamRecords: TeamRecord[] = [];

        const veteranAIAgentWithCoop = new VeteranAIAgent();
        veteranAIAgentWithCoop.setCollectCoop(true);

        const veteranAIAgentNoCoop = new VeteranAIAgent();
        veteranAIAgentNoCoop.setCollectCoop(false);

        // const veteranAIAgentNoCoop = new VeteranAIAgent();
        // veteranAIAgentNoCoop.setCollectCoop(false);

        let team1 = generateRandomTeam(0, veteranAIAgentWithCoop);
        let team2 = generateRandomTeam(1, veteranAIAgentWithCoop);

        for(let i = 0; i < 1000; i++) {
            let matchData: MatchData;
            try{
                matchData = combatantBalancingMatch(team1, team2, i);
            } catch (error) {
                console.log('an Error was thrown, restarting match', error);
                refreshTeam(team1);
                refreshTeam(team2);
                continue;
            }
            matchDataCollection.push(matchData);
            if(matchData.winningTeamName === team1.getName()) {
                team2 = generateRandomTeam(1, veteranAIAgentWithCoop);
                refreshTeam(team1);
                updateOrCreateTeamRecord(team1.getName(), team1, teamRecords);
            } else {
                team1 = generateRandomTeam(0, veteranAIAgentWithCoop);
                refreshTeam(team2);
                updateOrCreateTeamRecord(team2.getName(), team2, teamRecords);
            }
        }

        console.log(`error count is ${errorCount}`);
            expect(true).toBe(true);

        const date = generateDateString();
        generateBattleReportHtml(matchDataCollection, teamRecords, `Battle_Report_${date}.html`);
    });
    
});


function exampleMatch(matchCount: number) {

    const veteranAIAgentWithCoop = new VeteranAIAgent();
    veteranAIAgentWithCoop.setCollectCoop(true);

    const veteranAIAgentNoCoop = new VeteranAIAgent();
    veteranAIAgentNoCoop.setCollectCoop(false);
    const rookieAIAgent = new RookieAIAgent();
    const rookieWithCoop = new RookieAIAgent();
    rookieWithCoop.setCollectCoop(true);

    // const team1 = generateRandomTeam(0, rookieWithCoop);
    // const team2 =  generateCombatantIdenticalTeam(team1, 1, rookieAIAgent);
    // team1.name = 'Team withCoop';
    // team2.name = 'Team withoutCoop';

    const team1 = generateRandomTeam(0, rookieAIAgent);
    const team2 =  generateCombatantIdenticalTeam(team1, 1, rookieWithCoop);
    team1.name = 'Team withoutCoop';
    team2.name = 'Team withCoop';

    
    const board = new Board(10, 10);
    
    // theATeam(team1);
    // theBTeam(team2);
     // const team1 = new Team('Team Veteran', 0, veteranAIAgentWithCoop);
    // const team2 = new Team('Team Rookie', 1, veteranAIAgentNoCoop);
    placeAllCombatants(team1, team2, board);
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

            if(game.getRoundCount() > 40) {
                break;
            }
        }
    } catch (error) {
        errorCount++;
        console.log('an Error was thrown', error);
    }
    
    const winner = game.getWinner();

    if(!winner) {
        throw new Error('No winner found');
    }
    console.log(`match ${matchCount} winning team is ${winner?.getName()}`);
    return {roundCount: game.getRoundCount(), winner: winner?.getName()};
}   

function combatantBalancingMatch(team1: Team, team2: Team, matchCount: number): MatchData {
    const board = new Board(10, 10);
    placeAllCombatants(team1, team2, board);
    
    const game = new Game([team1, team2], board);
    game.recordSkillUsage();
    const allCombatants = board.getAllCombatants();
    const allCombatantStats: combatantReportStats[] = generateCombatantStats(allCombatants);


    try {
        while(!game.isGameOver()) {
            const currentCombatant = game.getCurrentCombatant();
            const enemyteamHpStartTurn = game.teams[1 - currentCombatant.team.getIndex()].getAliveCombatants().reduce((acc, combatant) => acc + combatant.stats.hp, 0);
            currentCombatant.getAiAgent()?.playTurn(currentCombatant, game, board);

            if(!currentCombatant.isExpendable()) {
                const enemyteamHpEndTurn = game.teams[1 - currentCombatant.team.getIndex()].getAliveCombatants().reduce((acc, combatant) => acc + combatant.stats.hp, 0);
                const damageDone = enemyteamHpStartTurn - enemyteamHpEndTurn;
                const currentStat = getCombatantStats(currentCombatant.name, allCombatantStats);
                currentStat.damageDone = damageDone;
            }
            
            game.nextTurn();

            if(game.getRoundCount() > 40) {
                break;
            }

            const deadCombatants = board.getAllCombatants().filter((combatant) => combatant.stats.hp <= 0);
            deadCombatants.forEach((combatant) => {
                // update the dead combatant's stats
                if(combatant.isExpendable()) {
                    board.removeCombatant(combatant);
                    return;
                }
                const deadStat = getCombatantStats(combatant.name, allCombatantStats);
                deadStat.finalHp = combatant.stats.hp;
                deadStat.finalStamina = combatant.stats.stamina;
                deadStat.survivalRounds = game.getRoundCount();
                // update the current combatant's kills
                if(!currentCombatant.isExpendable()) {
                    const currentStat = getCombatantStats(currentCombatant.name, allCombatantStats);
                    currentStat.kills++;
                }

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
    console.log(`match ${matchCount} winning team is ${winner?.getName()}`);

    winner.getAliveCombatants().filter((combatant) => !combatant.isExpendable()).forEach((combatant) => {
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
        combatantStats: allCombatantStats,
        skillRecord: game.getSkillRecords()
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

function updateOrCreateTeamRecord(teamName: string, team: Team, teamRecords: TeamRecord[]) {
    const teamRecord = teamRecords.find((record) => record.teamName === teamName);
    if(teamRecord) {
        teamRecord.longestWinStreak++;
    } else {
        teamRecords.push({ teamName: teamName, team: team, longestWinStreak: 0, longestLossStreak: 0 });
    }
}  

function updateOrCreateTeamRecordLoss(teamName: string, team: Team, teamRecords: TeamRecord[]) {
    const teamRecord = teamRecords.find((record) => record.teamName === teamName);
    if(teamRecord) {
        teamRecord.longestWinStreak--;
    } else {
        teamRecords.push({ teamName: teamName, team: team, longestWinStreak: 0, longestLossStreak: 0 });
    }
}  





  

