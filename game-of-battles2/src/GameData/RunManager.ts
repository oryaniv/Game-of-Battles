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

export enum RunType {
    TUTORIAL,
    SINGLE_PLAYER,
    MULTI_PLAYER
}

interface GameRun {
    team: Team;
    score: number;
    currentLevel: number;
    difficulty?: Difficulty;
    status: RunsStatus;
    type?: RunType;
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
        //     status: RunsStatus.CREATED,
        //     type: undefined
        // };

        // eslint-disable-next-line no-debugger
        // debugger;

        // this.gameRun = {
        //     team: generateExamplePlayerTeam(),
        //     score: -1,
        //     currentLevel: 1,
        //     difficulty: Difficulty.MEDIUM,
        //     status: RunsStatus.IN_PROGRESS,
        //     type: RunType.SINGLE_PLAYER
        // };

        this.gameRun = {
            team: generateExamplePlayerTeam(),
            score: -1,
            currentLevel: 7,
            difficulty: Difficulty.EASY,
            status: RunsStatus.IN_PROGRESS,
            type: RunType.TUTORIAL
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

    public getRunType(): RunType | undefined {
        return this.gameRun.type;
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

    public setRunType(type: RunType): void {
        this.gameRun.type = type;
    }

    // Create new run
    public createRun(team: Team, score: number, level: number, type: RunType, difficulty?: Difficulty): void {
        this.setTeam(team);
        this.setScore(score);
        this.setCurrentLevel(level);
        this.setStatus(RunsStatus.CREATED);
        this.setRunType(type);
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
            status: RunsStatus.CREATED,
            type: undefined
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

