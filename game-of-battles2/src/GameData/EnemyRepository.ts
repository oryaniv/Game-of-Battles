import { CombatantType } from "@/logic/Combatants/CombatantType";
import { Difficulty } from "../logic/Difficulty";
import { Team } from "@/logic/Team";
import { getNewCombatantName } from "@/CombatantNameProvider";
import { getCombatantByType } from "@/boardSetups";
import { GorillaAIAgent, KidAIAgent, RookieAIAgent, TrollAIAgent } from "@/logic/AI/DeterministicAgents";
import { VeteranAIAgent } from "@/logic/AI/VeteranAIAgent";


export const getEnemyTeamCombatantTypes = (difficulty: Difficulty, level: number) => {
    return enemyData[difficulty][level - 1];
}

export const getEnemyTeam = (difficulty: Difficulty, level: number) => {
  const enemyTeamCombatantTypes = getEnemyTeamCombatantTypes(difficulty, level);
  const aiAgent = getAiAgent(difficulty, level);
  const enemyTeam = new Team('Enemy Team', 1, aiAgent);
  for(let i = 0; i < enemyTeamCombatantTypes.length; i++) {
    createCombatantFromType(enemyTeamCombatantTypes[i], enemyTeam);
  }
  
  return enemyTeam;
}

export const getDifficulyLevelCount = (difficulty: Difficulty) => {
  switch(difficulty) {
    case Difficulty.EASY:
      return 3;
    case Difficulty.MEDIUM:
      return 5;
    case Difficulty.HARD:
      return 7;
  }
}

function createCombatantFromType(combatantType: CombatantType, team: Team) {
  const combatantToPush = getCombatantByType(combatantType, team);
  combatantToPush.name = getNewCombatantName(combatantType, team.combatants.map(c => c.name));
  team.addCombatant(combatantToPush);
}

function getAiAgent(difficulty: Difficulty, level: number) {
  switch(difficulty) {
    case Difficulty.EASY:
      if(level === 3) {
        return new GorillaAIAgent();
      } else {
        return new KidAIAgent();
      }
    case Difficulty.MEDIUM:
      if(level === 5) {
        return new TrollAIAgent();
      } else {
        return new RookieAIAgent();
      }
    case Difficulty.HARD: 
      return new VeteranAIAgent();
  }
}

const enemyData = {
    Easy: [
        [
          CombatantType.Defender,
          CombatantType.Witch,
          CombatantType.Hunter,
          CombatantType.StandardBearer,
          CombatantType.Vanguard,
        ], 
        [
          CombatantType.Pikeman,
          CombatantType.Rogue,
          CombatantType.Hunter,
          CombatantType.Wizard,
          CombatantType.FistWeaver
        ],
        [
          CombatantType.Gorilla,
        ]
    ],
    Normal: [
        [
          CombatantType.StandardBearer,
          CombatantType.Healer,
          CombatantType.Wizard,
          CombatantType.FistWeaver,
          CombatantType.Artificer
        ],
        [
          CombatantType.Rogue,
          CombatantType.Witch,
          CombatantType.Pikeman,
          CombatantType.Hunter,
          CombatantType.Hunter
        ],
        [
          CombatantType.OozeGolem,
          CombatantType.OozeGolem,
          CombatantType.WeaveEater,
          CombatantType.WeaveEater,
        ],
        [
          CombatantType.Wizard,
          CombatantType.Pikeman,
          CombatantType.Witch,
          CombatantType.Hunter,
          CombatantType.Vanguard
        ],
        [
          CombatantType.Troll
        ]
    ],
    Hard: [
        [
          CombatantType.Vanguard,
          CombatantType.FistWeaver,
          CombatantType.Hunter,
          CombatantType.Fool,
          CombatantType.Pikeman
        ],
        [
          CombatantType.Wizard,
          CombatantType.Artificer,
          CombatantType.Defender,
          CombatantType.Healer,
          CombatantType.StandardBearer
        ],
        [
          CombatantType.OozeGolem,
          CombatantType.OozeGolem,
          CombatantType.WeaveEater,
          CombatantType.WeaveEater,
        ],
        [
           CombatantType.Witch,
           CombatantType.Fool,
           CombatantType.FistWeaver,
           CombatantType.Healer,
           CombatantType.Hunter
        ],
        [
            CombatantType.StandardBearer,
            CombatantType.Vanguard,
            CombatantType.Defender,
            CombatantType.Pikeman,
            CombatantType.Wizard,
        ],
        [
            CombatantType.TwinBlades,
            CombatantType.TwinBlades
        ],
        [
            CombatantType.Dragon
        ]
    ],
}