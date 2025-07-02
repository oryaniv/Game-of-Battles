import { Team } from "../logic/Team";
import { Difficulty } from "../GameOverMessageProvider";
import { generateRandomTeam } from "../boardSetups";


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
        this.gameRun = {
            team: new Team('', 0),
            score: -1,
            currentLevel: 0,
            difficulty: undefined,
            status: RunsStatus.CREATED
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
        // return this.gameRun;
        return {
            team: generateRandomTeam(0),
            score: -1,
            currentLevel: 0,
            difficulty: undefined,
            status: RunsStatus.CREATED
        };

        // return {
        //     team: generateRandomTeam(0),
        //     score: -1,
        //     currentLevel: 1,
        //     difficulty: Difficulty.EASY,
        //     status: RunsStatus.IN_PROGRESS
        // };
    }

    // Clear run
    public clear(): void {
        this.gameRun = {
            team: new Team('', 0),
            score: -1,
            currentLevel: 0,
            difficulty: undefined,
            status: RunsStatus.CREATED
        };
    }
}

