import { Combatant } from '@/logic/Combatant';
import { CombatantType } from '@/logic/Combatants/CombatantType';
import { Team } from '@/logic/Team';
import * as fs from 'fs';
 import * as path from 'path';

 export interface combatantReportStats {
    name: string;
    type: CombatantType;
    win: boolean;
    kills: number;
    damageDone: number;
    survivalRounds: number;
    finalHp: number;
    finalStamina: number;
 }

 export interface MatchData {
    roundCount: number;
    winningTeamName: string;
    winningTeam: Team;
    losingTeam: Team;
    skillRecord : Record<string, number>;
    combatantStats: {
      name: string;
      type: CombatantType;
      kills: number;
      damageDone: number;
      survivalRounds: number;
      finalHp: number;
      finalStamina: number;
    }[];
}

export interface TeamRecord {
    teamName: string;
    team: Team;
    longestWinStreak: number;
    longestLossStreak: number;
}

interface CombatantSummary {
    type: CombatantType;
    killsAggregate: number;
    deathsAggregate: number;
    finalHpAggregate: number;
    finalStaminaAggregate: number;
    survivalRoundsAggregate: number;
    damageDoneAggregate: number;
    wins: number;
    losses: number;
    matchCount: number;
}

interface ReportData {
  time: string;
  roundCountAvg: number;
  combatantSummary: CombatantSummary[];
  SkillRecordSummary: Record<string, number>;
}

export function generateHtmlReport(matchDataCollection: MatchData[], teamRecords: TeamRecord[], filename: string) {
  const reportData: ReportData = generateReportData(matchDataCollection);

  const { combatantSummary, time, roundCountAvg, SkillRecordSummary } = reportData;

  // Calculate averages
  combatantSummary.forEach(cs => {
    cs.killsAggregate = cs.matchCount > 0 ? cs.killsAggregate / cs.matchCount : 0;
    cs.deathsAggregate = cs.matchCount > 0 ? cs.deathsAggregate / cs.matchCount : 0;
    cs.finalHpAggregate = cs.matchCount > 0 ? cs.finalHpAggregate / cs.matchCount : 0;
    cs.finalStaminaAggregate = cs.matchCount > 0 ? cs.finalStaminaAggregate / cs.matchCount : 0;
    cs.survivalRoundsAggregate = cs.matchCount > 0 ? cs.survivalRoundsAggregate / cs.matchCount : 0;
    cs.damageDoneAggregate = cs.matchCount > 0 ? cs.damageDoneAggregate / cs.matchCount : 0;
  });
  // Function to generate a simple HTML table row
  const generateTableRow = (data: string[]) => {
    return `<tr>${data.map(d => `<td>${d}</td>`).join('')}</tr>`;
  };

    // Generate HTML for the best team.  Handles the null case.
    
    const bestTeamRecord: TeamRecord = teamRecords.reduce((prev, current) => {
        return (prev.longestWinStreak > current.longestWinStreak) ? prev : current;
    }, teamRecords[0]);

  // Generate HTML for best team section
  const bestTeamHtml = `
    <div class="best-team-section">
      <h2>Best Performing Team</h2>
      <p>Team Name: ${bestTeamRecord.teamName}</p>
      <p>Win Streak: ${bestTeamRecord.longestWinStreak}</p>
      <h3>Team Composition:</h3>
      <ul>
        ${bestTeamRecord.team.combatants.map(combatant => 
          `<li>${combatant.name} (${combatant.getCombatantType()})</li>`
        ).join('')}
      </ul>
    </div>
  `;
  
  const calcRatio = (wins: number, losses: number): number => {
    return losses > 0 ? (wins/losses) : 0;
  }

  // Generate HTML for the table
  const tableHeaders = ['Combatant Type','Match Count', 'Win/Loss Ratio', 'Wins', 'Losses', 'Kills Avg', 'Deaths Rate', 'Damage Done Avg', 'Final HP Avg', 'Final Stamina Avg', 'Survival Rounds Avg'];
  const tableRows = combatantSummary.sort((a, b) => calcRatio(b.wins, b.losses) - calcRatio(a.wins, a.losses)).map(cs => generateTableRow([
    cs.type,
    cs.matchCount.toString(),
    calcRatio(cs.wins, cs.losses).toFixed(2),
    cs.wins.toString(),
    cs.losses.toString(),
    cs.killsAggregate.toFixed(2), // Limit to 2 decimal places
    cs.deathsAggregate.toFixed(2),
    cs.damageDoneAggregate.toFixed(2),
    cs.finalHpAggregate.toFixed(2),
    cs.finalStaminaAggregate.toFixed(2),
    cs.survivalRoundsAggregate.toFixed(2),
  ])).join('');


// Calculate Win/Loss Ratios
const combatantRatios = combatantSummary.map(combatant => ({
    ...combatant,
    winLossRatio: combatant.losses === 0 ? Number.NEGATIVE_INFINITY : combatant.wins / combatant.losses,
}));

// Calculate mean and standard deviation
const ratios = combatantRatios.filter(c => isFinite(c.winLossRatio)).map(c => c.winLossRatio);
const meanRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
const stdDev = Math.sqrt(ratios.reduce((a, b) => a + Math.pow(b - meanRatio, 2), 0) / ratios.length);

// Tier assignment
const tiers: { [tier: string]: string[] } = {
    'S': [],
    'A': [],
    'B': [],
    'C': [],
    'D': [],
    'E': [],
    'F': [],
};

combatantRatios.forEach(combatant => {
    if (combatant.winLossRatio >= meanRatio + 2 * stdDev) {
        tiers['S'].push(combatant.type);
    } else if (combatant.winLossRatio >= meanRatio + stdDev) {
        tiers['A'].push(combatant.type);
    } else if (combatant.winLossRatio >= meanRatio) {
        tiers['B'].push(combatant.type);
    }
     else if (combatant.winLossRatio >= meanRatio - stdDev) {
        tiers['C'].push(combatant.type);
    }
    else if (combatant.winLossRatio >= meanRatio - 2 * stdDev) {
        tiers['D'].push(combatant.type);
    }
    else if (combatant.winLossRatio >= meanRatio - 3 * stdDev) {
      tiers['E'].push(combatant.type);
    }
    else {
        tiers['F'].push(combatant.type);
    }
});

// Generate Tier List HTML
let tierListHtml = `<h2>Tier List</h2>`;
for (const tier in tiers) {
    if (tiers[tier].length > 0) {
        tierListHtml += `<p><strong>${tier}</strong> - ${tiers[tier].join(', ')}</p>`;
    }
}

  // Generate skill usage table HTML
  const skillTableHeaders = ['Skill', 'Count'];
  const skillTableRows = Object.entries(SkillRecordSummary)
    .sort(([,a], [,b]) => b - a) // Sort by count descending
    .map(([skill, count]) => generateTableRow([skill, count.toString()]))
    .join('');

  const skillTableHtml = `
    <h2>Skill Usage Summary</h2>
    <table>
      <tr>${skillTableHeaders.map(header => `<th>${header}</th>`).join('')}</tr>
      ${skillTableRows}
    </table>
  `;


  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Battles Report for ${time}</title>
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f0f0f0;
        }
        .tier-list {
            margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <h1>Battles Report for ${time}</h1>
      <p>Round Count Average: ${roundCountAvg.toFixed(2)}</p>
      ${bestTeamHtml}
      <table>
        <tr>
          ${tableHeaders.map(header => `<th>${header}</th>`).join('')}
        </tr>
        ${tableRows}
      </table>
      ${skillTableHtml}
      ${tierListHtml}
    </body>
    </html>
  `;

  try {
    const reportFolderPath = "/Users/or.y/Desktop/Real projects/Game-of-Battles/game-of-battles2/tests/battleReports"
    fs.writeFileSync(path.join(reportFolderPath, filename), html);
    console.log(`Report generated: ${filename}`);
  } catch (error) {
    console.error('Error writing HTML report:', error);
  }
}

function generateReportData(matchDataCollection: MatchData[]): ReportData {
  const reportData: ReportData = {
    time: generateDateString(),
    roundCountAvg: matchDataCollection.reduce((acc, curr) => acc + curr.roundCount, 0) / matchDataCollection.length,
    combatantSummary: generateCombatantSummery(matchDataCollection),
    SkillRecordSummary: generateSkillRecordSummary(matchDataCollection)
  };

  return reportData;
}

function generateSkillRecordSummary(matchDataCollection: MatchData[]): Record<string, number> {
  const skillRecordSummary: Record<string, number> = {};
  matchDataCollection.forEach((matchData) => {
    Object.entries(matchData.skillRecord).forEach(([skill, count]) => {
      skillRecordSummary[skill] = (skillRecordSummary[skill] || 0) + count;
    });
  });
  return skillRecordSummary;
}
function generateCombatantSummery(matchDataCollection: MatchData[]): CombatantSummary[] {
  const combatantSummery: CombatantSummary[] = [];
  [CombatantType.Artificer, CombatantType.Defender, CombatantType.FistWeaver,
    CombatantType.Fool, CombatantType.Healer, CombatantType.Hunter, CombatantType.Pikeman,
    CombatantType.Rogue, CombatantType.StandardBearer, CombatantType.Vanguard, CombatantType.Witch,
    CombatantType.Wizard
  ].forEach((type) => {
    combatantSummery.push({
      type: type,
      killsAggregate: 0,
      deathsAggregate: 0,
      finalHpAggregate: 0,
      finalStaminaAggregate: 0,
      survivalRoundsAggregate: 0,
      damageDoneAggregate: 0,
      wins: 0,
      losses: 0,
      matchCount: 0
    });
  });

  matchDataCollection.forEach((matchData) => {
    matchData.combatantStats.forEach((combatantStats) => {
      const combatantSummeryItem = combatantSummery.find((item) => item.type === combatantStats.type);
      if (combatantSummeryItem) {
        combatantSummeryItem.killsAggregate += combatantStats.kills;
        combatantSummeryItem.deathsAggregate += (combatantStats.finalHp <= 0) ? 1 : 0;
        combatantSummeryItem.finalHpAggregate += combatantStats.finalHp;
        combatantSummeryItem.finalStaminaAggregate += combatantStats.finalStamina;
        combatantSummeryItem.survivalRoundsAggregate += combatantStats.survivalRounds;
        combatantSummeryItem.damageDoneAggregate += combatantStats.damageDone;
        combatantSummeryItem.matchCount++;
      }
    });
    
    matchData.winningTeam.combatants.forEach((combatant) => {
      const combatantSummeryItem = combatantSummery.find((item) => item.type === combatant.getCombatantType());
      if (combatantSummeryItem) {
        combatantSummeryItem.wins += 1;
      }
    });

    matchData.losingTeam.combatants.forEach((combatant) => {
      const combatantSummeryItem = combatantSummery.find((item) => item.type === combatant.getCombatantType());
      if (combatantSummeryItem) {
        combatantSummeryItem.losses += 1;
      }
    });
  });

  return combatantSummery;
}

export function generateDateString(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${hours}-${minutes}`;
}

/*
my prediction for tier lists:

A - Hunter, StandardBearer, Defender
B - Wizard, Vanguard, healer, Pikeman, Rogue
C - Fistweaver, Fool, Witch, Artificer
*/
