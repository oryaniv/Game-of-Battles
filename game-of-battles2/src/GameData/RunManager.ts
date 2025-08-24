import { Team } from "../logic/Team";
import { Difficulty, ResultGap } from "../logic/Difficulty";
import { generateExamplePlayerTeam } from "@/boardSetups";




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
    record: ResultGap[]
}

export class RunManager {
    private static instance: RunManager;
    private gameRun: GameRun;

    private constructor() {
        this.gameRun = {
            team: new Team('Player Team', 0),
            score: -1,
            currentLevel: 1,
            status: RunsStatus.CREATED,
            type: undefined,
            record: []
        };

        // this.gameRun = {
        //     team: generateExamplePlayerTeam(),
        //     score: -1,
        //     currentLevel: 1,
        //     difficulty: Difficulty.MEDIUM,
        //     status: RunsStatus.IN_PROGRESS,
        //     type: RunType.SINGLE_PLAYER,
        //     record: []
        // };

        // this.gameRun = {
        //     team: generateExamplePlayerTeam(),
        //     score: -1,
        //     currentLevel: 6,
        //     difficulty: Difficulty.EASY,
        //     status: RunsStatus.IN_PROGRESS,
        //     type: RunType.TUTORIAL,
        //     record: []
        // };

        // this.gameRun = {
        //     team: generateExamplePlayerTeam(),
        //     score: -1,
        //     currentLevel: 1,
        //     status: RunsStatus.CREATED,
        //     type: RunType.SINGLE_PLAYER,
        //     record: []
        // };

        // this.gameRun = {
        //     team: generateExamplePlayerTeam(),
        //     score: -1,
        //     currentLevel: 2,
        //     difficulty: Difficulty.MEDIUM,
        //     status: RunsStatus.IN_PROGRESS,
        //     type: RunType.SINGLE_PLAYER,
        //     record: [ResultGap.COMICAL, ResultGap.SMALL]
        // };

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

    public getHasPerferctStreak(): boolean {
        return this.gameRun.record.length > 0 && 
        this.gameRun.record.every(result => result === ResultGap.COMICAL);
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

    public addResultGap(resultGap: ResultGap): void {
        this.gameRun.record.push(resultGap);
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
            type: undefined,
            record: []
        };
    }

    public isBossFight(): boolean {
        return this.gameRun.type === RunType.SINGLE_PLAYER && 
        (
            (this.gameRun.difficulty === Difficulty.HARD && this.gameRun.currentLevel === 7) ||
            (this.gameRun.difficulty === Difficulty.MEDIUM && this.gameRun.currentLevel === 5) ||
            (this.gameRun.difficulty === Difficulty.EASY && this.gameRun.currentLevel === 3)
        );
    }
}

