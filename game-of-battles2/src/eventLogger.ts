import { PlayActionType } from "./logic/AI/HeuristicalAgents";

export interface GameEventMessage {
    messageBody: string;
    actionPart?: string;
    actionType: PlayActionType;
}


export class EventLogger {
    private static instance: EventLogger;
    private events: GameEventMessage[] = [];

    private constructor() {
    }

    public static getInstance(): EventLogger {
        if (!EventLogger.instance) {
            EventLogger.instance = new EventLogger();
        }
        return EventLogger.instance;
    }

    public logEvent(message: GameEventMessage): void {
        this.events.push(message);
    }

    public addBreak(): void {
        this.events.push({
            messageBody: '--------------------------------',
            actionPart: undefined,
            actionType: PlayActionType.SKIP
        });
    }

    public getEvents(): GameEventMessage[] {
        return this.events;
    }
}
