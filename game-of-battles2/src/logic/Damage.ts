export enum DamageType {
    Slash = "Slash",
    Pierce = "Pierce",
    Crush = "Crush",
    Fire = "Fire",
    Ice = "Ice",
    Blight = "Blight",
    Lightning = "Lightning",
    Holy = "Holy",
    Dark = "Dark",
    Unstoppable = "Unstoppable",
  }
  
  export interface Damage {
    amount: number;
    type: DamageType;
  }