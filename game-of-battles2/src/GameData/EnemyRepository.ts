import { CombatantType } from "@/logic/Combatants/CombatantType";
import { Difficulty } from "../GameOverMessageProvider";


export const getEnemyTeamCombatantTypes = (difficulty: Difficulty, level: number) => {
    return enemyData[difficulty][level - 1];
}


const enemyData = {
    Easy: [
        [
          CombatantType.Defender,
          CombatantType.Witch,
          CombatantType.Hunter,
          CombatantType.Healer,
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
          CombatantType.Wizard,
          CombatantType.Defender,
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