import { Team } from "../logic/Team";
import { Difficulty } from "../GameOverMessageProvider";
import { generateRandomTeam } from "../boardSetups";
import { getEnemyTeam } from "./EnemyRepository";
import { Artificer } from "@/logic/Combatants/Artificer";
import { Defender } from "@/logic/Combatants/Defender";
import { Pikeman } from "@/logic/Combatants/Pikeman";
import { Witch } from "@/logic/Combatants/Witch";
import { Healer } from "@/logic/Combatants/Healer";
import { Vanguard } from "@/logic/Combatants/Vanguard";
import { Wizard } from "@/logic/Combatants/Wizard";
import { Hunter } from "@/logic/Combatants/Hunter";
import { FistWeaver } from "@/logic/Combatants/FistWeaver";
import { VeteranAIAgent } from "@/logic/AI/VeteranAIAgent";


export enum RunsStatus {
    CREATED,
    IN_PROGRESS,
    COMPLETED,
    DIED
}

interface GameRun {
    team: Team;
    score: number;
    currentLevel: number;
    difficulty?: Difficulty;
    status: RunsStatus;
}

export class RunManager {
    private static instance: RunManager;
    private gameRun: GameRun;

    private constructor() {
        // this.gameRun = {
        //     team: new Team('Player Team', 0),
        //     score: -1,
        //     currentLevel: 0,
        //     difficulty: undefined,
        //     status: RunsStatus.CREATED
        // };

        // eslint-disable-next-line no-debugger
        // debugger;
        this.gameRun = {
            team: generateExamplePlayerTeam(),
            score: -1,
            currentLevel: 1,
            difficulty: Difficulty.MEDIUM,
            status: RunsStatus.IN_PROGRESS
        };
    }

    public static getInstance(): RunManager {
        if (!RunManager.instance) {
            RunManager.instance = new RunManager();
        }
        return RunManager.instance;
    }

    // Getters
    public getTeam(): Team {
        return this.gameRun.team;
    }

    public getScore(): number {
        return this.gameRun.score;
    }

    public getCurrentLevel(): number {
        return this.gameRun.currentLevel;
    }

    public getDifficulty(): Difficulty | undefined {
        return this.gameRun.difficulty;
    }

    public getStatus(): RunsStatus {
        return this.gameRun.status;
    }

    // Setters
    public setTeam(team: Team): void {
        this.gameRun.team = team;
    }

    public setScore(score: number): void {
        this.gameRun.score = score;
    }

    public setCurrentLevel(currentLevel: number): void {
        this.gameRun.currentLevel = currentLevel;
    }

    public setDifficulty(difficulty: Difficulty): void {
        this.gameRun.difficulty = difficulty;
    }

    public setStatus(status: RunsStatus): void {
        this.gameRun.status = status;
    }

    // Create new run
    public createRun(team: Team, score: number, level: number, difficulty?: Difficulty): void {
        this.setTeam(team);
        this.setScore(score);
        this.setCurrentLevel(level);
        this.setStatus(RunsStatus.CREATED);
        if (difficulty) {
            this.setDifficulty(difficulty);
        }
    }

    public getRun(): GameRun {
        return this.gameRun;
    }

    // Clear run
    public clear(): void {
        this.gameRun = {
            team: new Team('Player Team', 0),
            score: -1,
            currentLevel: 0,
            difficulty: undefined,
            status: RunsStatus.CREATED
        };
    }

    public getMatchTeams(): Team[] {
        const playerTeam = this.getRun().team;
        // eslint-disable-next-line no-debugger
        debugger;
        const enemyTeam = getEnemyTeam(this.getRun().difficulty as Difficulty, this.getCurrentLevel());
        return [playerTeam, enemyTeam];
    }
}

function generateExamplePlayerTeam(): Team {
    const team = new Team('Your team', 0, new VeteranAIAgent());
    team.addCombatant(new Vanguard('Aragorn', { x: 3, y: 5}, team));
    team.addCombatant(new Wizard('Feloron', { x: 3, y: 5}, team));
    team.addCombatant(new Hunter('Orion', { x: 3, y: 5}, team));
    team.addCombatant(new FistWeaver('Ororo', { x: 3, y: 5}, team));
    team.addCombatant(new Wizard('Irenicus', { x: 3, y: 5}, team));
    return team;
}

