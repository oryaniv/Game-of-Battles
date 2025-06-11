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
import { SpecialMoveTriggerType } from '@/logic/SpecialMove';
import { CoopMove } from '@/logic/SpecialMoves/Coop/CoopMove';


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
                sources: [CombatantType.FistWeaver, CombatantType.Pikeman, CombatantType.StandardBearer, CombatantType.Defender]
            },
            {
                type: DamageType.Fire,
                sources: [CombatantType.Wizard, CombatantType.Hunter]
            },
            {
                type: DamageType.Ice,
                sources: [CombatantType.Wizard, CombatantType.Pikeman]
            },
            {
                type: DamageType.Blight,
                sources: [CombatantType.Rogue, CombatantType.Hunter]
            },
            {
                type: DamageType.Lightning,
                sources: [CombatantType.Wizard, CombatantType.Vanguard, CombatantType.FistWeaver]
            },
            {
                type: DamageType.Dark,
                sources: [CombatantType.Witch, CombatantType.Rogue]
            },
            {
                type: DamageType.Holy,
                sources: [CombatantType.Healer, CombatantType.FistWeaver]
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

    it('base stats report', () => {
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

        const baseStatsData = combatantTypes.map(combatant => ({
            type: combatant.getCombatantType(),
            attackPower: combatant.baseStats.attackPower,
            defense: combatant.baseStats.defensePower,
            agility: combatant.baseStats.agility,
            luck: combatant.baseStats.luck,
            initiative: combatant.baseStats.initiative,
            hp: combatant.baseStats.hp,
            stamina: combatant.baseStats.stamina,
            movementSpeed: combatant.baseStats.movementSpeed,
            range: combatant.baseStats.range
        }));

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Base Stats Report</title>
                <style>
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 20px 0;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                        cursor: pointer;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                </style>
                <script>
                    function sortTable(n) {
                        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
                        table = document.getElementById("statsTable");
                        switching = true;
                        dir = "asc";
                        
                        while (switching) {
                            switching = false;
                            rows = table.rows;
                            
                            for (i = 1; i < (rows.length - 1); i++) {
                                shouldSwitch = false;
                                x = rows[i].getElementsByTagName("TD")[n];
                                y = rows[i + 1].getElementsByTagName("TD")[n];
                                
                                if (dir == "asc") {
                                    if (n === 0) {
                                        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                                            shouldSwitch = true;
                                            break;
                                        }
                                    } else {
                                        if (Number(x.innerHTML) > Number(y.innerHTML)) {
                                            shouldSwitch = true;
                                            break;
                                        }
                                    }
                                } else if (dir == "desc") {
                                    if (n === 0) {
                                        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                                            shouldSwitch = true;
                                            break;
                                        }
                                    } else {
                                        if (Number(x.innerHTML) < Number(y.innerHTML)) {
                                            shouldSwitch = true;
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            if (shouldSwitch) {
                                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                                switching = true;
                                switchcount++;
                            } else {
                                if (switchcount == 0 && dir == "asc") {
                                    dir = "desc";
                                    switching = true;
                                }
                            }
                        }
                    }
                </script>
            </head>
            <body>
                <h1>Base Stats Report</h1>
                <table id="statsTable">
                    <tr>
                        <th onclick="sortTable(0)">Combatant Type</th>
                        <th onclick="sortTable(1)">Attack Power</th>
                        <th onclick="sortTable(2)">Defense</th>
                        <th onclick="sortTable(3)">Agility</th>
                        <th onclick="sortTable(4)">Luck</th>
                        <th onclick="sortTable(5)">Initiative</th>
                        <th onclick="sortTable(6)">HP</th>
                        <th onclick="sortTable(7)">Stamina</th>
                        <th onclick="sortTable(8)">Movement Speed</th>
                        <th onclick="sortTable(9)">Range</th>
                    </tr>
                    ${baseStatsData.map(stat => `
                        <tr>
                            <td>${stat.type}</td>
                            <td>${stat.attackPower}</td>
                            <td>${stat.defense}</td>
                            <td>${stat.agility}</td>
                            <td>${stat.luck}</td>
                            <td>${stat.initiative}</td>
                            <td>${stat.hp}</td>
                            <td>${stat.stamina}</td>
                            <td>${stat.movementSpeed}</td>
                            <td>${stat.range}</td>
                        </tr>
                    `).join('')}
                </table>
            </body>
            </html>
        `;

        const fs = require('fs');
        const path = require('path');
        const reportFolderPath = path.join(__dirname, 'baseStatsReports');
        const filename = `base_stats_report_${generateDateString()}.html`;

        try {
            if (!fs.existsSync(reportFolderPath)){
                fs.mkdirSync(reportFolderPath);
            }
            fs.writeFileSync(path.join(reportFolderPath, filename), html);
            console.log(`Base stats report generated: ${filename}`);
        } catch (error) {
            console.error('Error writing base stats report:', error);
        }
    });

    it.only('Co op skills report', () => {
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

        const coopMovesByType = new Map<string, {moveName: string, partners: string[]}[]>();

        // Gather co-op moves for each combatant type
        combatantTypes.forEach(combatant => {
            const coopMoves = combatant.specialMoves.filter(move => move.triggerType === SpecialMoveTriggerType.Cooperative) as CoopMove[];
            
            const moveDetails = coopMoves.map(move => {
                const partnerTypes = move.coopRequiredPartners.map(req => 
                    req.combatantTypeOptions.join(' or ')
                );
                
                return {
                    moveName: move.name,
                    partners: partnerTypes
                };
            });

            if(moveDetails.length > 0) {
                coopMovesByType.set(combatant.constructor.name, moveDetails);
            }
        });

        // Create a map to track co-op move requirements for each combatant type
        const coopRequirementStats = new Map<string, {
            requiredFor: number,
            notRequiredFor: number,
            neverNeededBy: number
        }>();

        // Initialize stats for all combatant types
        combatantTypes.forEach(combatant => {
            coopRequirementStats.set(combatant.constructor.name, {
                requiredFor: 0,
                notRequiredFor: 0,
                neverNeededBy: 0
            });
        });

        // Count how many times each type is required for co-op moves
        coopMovesByType.forEach((moves, _combatantType) => {
            moves.forEach(move => {
                // Get all unique combatant types from the partners requirements
                const requiredTypes = new Set(move.partners.flatMap(partner => 
                    partner.split(' or ')
                ));

                // Update stats for all combatant types
                combatantTypes.forEach(combatant => {
                    const combatantName = combatant.constructor.name;
                    const stats = coopRequirementStats.get(combatantName)!;
                    
                    if (requiredTypes.has(combatantName)) {
                        stats.requiredFor++;
                    } else {
                        stats.notRequiredFor++;
                    }
                });
            });
        });

        // Count combatants that never need each type
        combatantTypes.forEach(combatant => {
            const combatantName = combatant.constructor.name;
            let neverNeededCount = 0;

            combatantTypes.forEach(otherCombatant => {
                const otherName = otherCombatant.constructor.name;
                if (otherName === combatantName) return;

                const otherMoves = coopMovesByType.get(otherName) || [];
                const isNeverNeeded = otherMoves.every(move => 
                    !move.partners.some(partner => 
                        partner.split(' or ').includes(combatantName)
                    )
                );

                if (isNeverNeeded) {
                    neverNeededCount++;
                }
            });

            coopRequirementStats.get(combatantName)!.neverNeededBy = neverNeededCount;
        });

        // Add the requirement stats table to HTML
        const requirementStatsHtml = `
            <h2>Co-op Move Requirements Statistics</h2>
            <table>
                <tr>
                    <th>Combatant Type</th>
                    <th>Required For # of Skills</th>
                    <th>Not Required For # of Skills</th>
                    <th># of Combatants Never Needing Them</th>
                </tr>
                ${Array.from(coopRequirementStats.entries()).map(([combatantType, stats]) => `
                    <tr>
                        <td>${combatantType}</td>
                        <td>${stats.requiredFor}</td>
                        <td>${stats.notRequiredFor}</td>
                        <td>${stats.neverNeededBy}</td>
                    </tr>
                `).join('')}
            </table>
        `;

        // Generate HTML table
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin-bottom: 20px;
                    }
                    th, td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <h2>Co-op Moves by Combatant Type</h2>
                <table>
                    <tr>
                        <th>Combatant Type</th>
                        <th>Co-op Move</th>
                        <th>Required Partners</th>
                    </tr>
                    ${Array.from(coopMovesByType.entries()).map(([combatantType, moves]) => 
                        moves.map((move, index) => `
                            <tr>
                                ${index === 0 ? `<td rowspan="${moves.length}">${combatantType}</td>` : ''}
                                <td>${move.moveName}</td>
                                <td>${move.partners.join(' AND ')}</td>
                            </tr>
                        `).join('')
                    ).join('')}
                </table>
                <br>
                <br>
                ${requirementStatsHtml}
            </body>
            </html>
        `;

        const fs = require('fs');
        const path = require('path');
        const reportFolderPath = path.join(__dirname, 'coopMovesReports');
        const filename = `coop_moves_report_${generateDateString()}.html`;

        try {
            if (!fs.existsSync(reportFolderPath)){
                fs.mkdirSync(reportFolderPath);
            }
            fs.writeFileSync(path.join(reportFolderPath, filename), html);
            console.log(`Co-op moves report generated: ${filename}`);
        } catch (error) {
            console.error('Error writing co-op moves report:', error);
        }
    });
});