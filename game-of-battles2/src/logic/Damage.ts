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


  export enum DamageReaction {
    NONE= "None",
    WEAKNESS= "Weakness",
    RESISTANCE= "Resistance",
    IMMUNITY= "Immunity",
  }

  export interface Resistance {
    type: DamageType;
    reaction: DamageReaction;
  }
  
  export interface Damage {
    amount: number;
    type: DamageType;
  }

  