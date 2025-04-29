export class EventLogger {
    private static instance: EventLogger;
    private events: string[] = [];

    private constructor() {
    }

    public static getInstance(): EventLogger {
        if (!EventLogger.instance) {
            EventLogger.instance = new EventLogger();
        }
        return EventLogger.instance;
    }

    public logEvent(message: string): void {
        this.events.push(message);
    }

    public addBreak(): void {
        this.events.push('--------------------------------');
    }

    public getEvents(): string[] {
        return this.events;
    }
}
