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
import { generateCombatantIdenticalTeam, generateRandomTeam, placeAllCombatants, refreshTeam, theATeam, theBTeam, theGorillaTeam } from '@/boardSetups';
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
import { Rogue } from '@/logic/Combatants/Rogue';


interface CombatantWeaknessStats {
    type: CombatantType;
    weaknesses: DamageType[];
    resistances: DamageType[];
    weakNumber: number;
    resistantNumber: number;
    exploiters: CombatantType[];
    exploitersNumber: number;
}

interface DamageTypeStats {
    type: DamageType;
    weakTo: CombatantType[];
    resistantTo: CombatantType[];
    weakNumber: number;
    resistantNumber: number;
    sources: CombatantType[];
    powerFactor: number;
}

interface DamageTypeSource {
    type: DamageType;
    sources: CombatantType[];
}

describe('misc', () => {
    it('collect and report weaknesses', () => {
        const team = new Team("test", 0);
        const combatantTypes = [
            new StandardBearer("test", {x: 0, y: 0}, team),
            new Healer("test", {x: 0, y: 0}, team),
            new Defender("test", {x: 0, y: 0}, team), 
            new Wizard("test", {x: 0, y: 0}, team),
            new Hunter("test", {x: 0, y: 0}, team),
            new FistWeaver("test", {x: 0, y: 0}, team),
            new Fool("test", {x: 0, y: 0}, team),
            new Pikeman("test", {x: 0, y: 0}, team),
            new Witch("test", {x: 0, y: 0}, team),
            new Vanguard("test", {x: 0, y: 0}, team),
            new Rogue("test", {x: 0, y: 0}, team),
        ];

        const damageTypeSources: DamageTypeSource[] = [
            {
                type: DamageType.Slash,
                sources: [CombatantType.Vanguard, CombatantType.Rogue, CombatantType.Defender]
            },
            {
                type: DamageType.Pierce,
                sources: [CombatantType.Pikeman, CombatantType.Hunter]
            },
            {
                type: DamageType.Crush,
                sources: [CombatantType.FistWeaver, CombatantType.Pikeman, CombatantType.StandardBearer]
            },
            {
                type: DamageType.Fire,
                sources: [CombatantType.Wizard]
            },
            {
                type: DamageType.Ice,
                sources: [CombatantType.Wizard]
            },
            {
                type: DamageType.Blight,
                sources: [CombatantType.Rogue, CombatantType.Hunter]
            },
            {
                type: DamageType.Lightning,
                sources: [CombatantType.Wizard]
            },
            {
                type: DamageType.Dark,
                sources: [CombatantType.Witch]
            },
            {
                type: DamageType.Holy,
                sources: [CombatantType.Healer]
            }
        ]

        const combatantWeaknessStats: CombatantWeaknessStats[] = combatantTypes.map(combatant => ({
            type: combatant.getCombatantType(),
            weaknesses: combatant.resistances
                .filter(dr => dr.reaction === DamageReaction.WEAKNESS)
                .map(dr => dr.type),
            resistances: combatant.resistances
                .filter(dr => dr.reaction === DamageReaction.RESISTANCE || dr.reaction === DamageReaction.IMMUNITY)
                .map(dr => dr.type),
            weakNumber: combatant.resistances
                .filter(dr => dr.reaction === DamageReaction.WEAKNESS)
                .length,
            resistantNumber: combatant.resistances
                .filter(dr => dr.reaction === DamageReaction.RESISTANCE || dr.reaction === DamageReaction.IMMUNITY)
                .length,
            exploiters: combatant.resistances
                .filter(dr => dr.reaction === DamageReaction.WEAKNESS)
                .map(dr => dr.type)
                .flatMap(weakType => 
                    damageTypeSources.find(dts => dts.type === weakType)?.sources || []
                ),
            exploitersNumber: combatant.resistances
                .filter(dr => dr.reaction === DamageReaction.WEAKNESS)
                .map(dr => dr.type)
                .flatMap(weakType => 
                    damageTypeSources.find(dts => dts.type === weakType)?.sources || []
                ).length
        })).sort((a, b) => b.weakNumber - a.weakNumber);

        const damageTypeStats: DamageTypeStats[] = Object.values(DamageType).map(damageType => {
            const weakTo = combatantWeaknessStats
                .filter(stats => stats.weaknesses.includes(damageType))
                .map(stats => stats.type);

                
            const resistantTo = combatantWeaknessStats
                .filter(stats => stats.resistances.includes(damageType))
                .map(stats => stats.type);

            const sources = damageTypeSources.filter(dts => dts.type === damageType)
            .flatMap(dts => dts.sources);

            const powerFactor = weakTo.length * sources.length;
            return {
                type: damageType,
                weakTo,
                resistantTo,
                weakNumber: weakTo.length,
                resistantNumber: resistantTo.length,
                sources,
                powerFactor
            };
        }).sort((a, b) => b.powerFactor - a.powerFactor);

        // Generate HTML report
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Weakness Analysis Report</title>
                <style>
                    table { border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid black; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>Weakness Analysis Report</h1>
                
                <h2>Damage Type Statistics</h2>
                <table>
                    <tr>
                        <th>Damage Type</th>
                        <th>Number of Weak To</th>
                        <th>Number of Resistant To</th>
                        <th>Weak Combatants</th>
                        <th>Resistant Combatants</th>
                        <th>Sources</th>
                        <th>Power Factor</th>
                    </tr>
                    ${damageTypeStats.map(stat => `
                        <tr>
                            <td>${stat.type}</td>
                            <td>${stat.weakNumber}</td>
                            <td>${stat.resistantNumber}</td>
                            <td>${stat.weakTo.join(', ')}</td>
                            <td>${stat.resistantTo.join(', ')}</td>
                            <td>${stat.sources.join(', ')}</td>
                            <td>${stat.powerFactor}</td>
                        </tr>
                    `).join('')}
                </table>

                <h2>Combatant Weaknesses</h2>
                <table>
                    <tr>
                        <th>Combatant Type</th>
                        <th>Weaknesses</th>
                        <th>Resistances</th>
                        <th>Number of Weaknesses</th>
                        <th>Number of Resistances</th>
                        <th>Exploiters</th>
                        <th>Number of Exploiters</th>
                    </tr>
                    ${combatantWeaknessStats.map(stat => `
                        <tr>
                            <td>${stat.type}</td>
                            <td>${stat.weaknesses.join(', ')}</td>
                            <td>${stat.resistances.join(', ')}</td>
                            <td>${stat.weakNumber}</td>
                            <td>${stat.resistantNumber}</td>
                            <td>${stat.exploiters.join(', ')}</td>
                            <td>${stat.exploitersNumber}</td>
                        </tr>
                    `).join('')}
                </table>
            </body>
            </html>
        `;

        const fs = require('fs');
        const path = require('path');
        const reportFolderPath = path.join(__dirname, 'weaknessReports');
        const filename = `weakness_report_${generateDateString()}.html`;

        try {
            fs.writeFileSync(path.join(reportFolderPath, filename), html);
            console.log(`Weakness report generated: ${filename}`);
        } catch (error) {
            console.error('Error writing weakness report:', error);
        }
    });
});