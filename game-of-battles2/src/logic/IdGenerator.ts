

export class IdGenerator {
    private static idGenerated: number = 1;

    static generateId(): number {
        return IdGenerator.idGenerated++;
    }
}