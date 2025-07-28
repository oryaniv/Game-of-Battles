import { DummyAIAgent } from "@/logic/AI/DeterministicAgents";
import { Board } from "@/logic/Board";
import { Defender } from "@/logic/Combatants/Defender";
import { StandardBearer } from "@/logic/Combatants/StandardBearer";
import { Game } from "@/logic/Game";
import { getEmptyAsType } from "@/logic/LogicFlags";
import { isSamePosition } from "@/logic/Position";
import { SpecialMove } from "@/logic/SpecialMove";
import { Team } from "@/logic/Team";
import { IntroTutorial } from "./Tutorials/Tutorial1";
import { SkipAndAttack } from "./Tutorials/SkipAndAttack";
import { CombatBasics } from "./Tutorials/CombatBasics";
import { SkillsAndWeakness } from "./Tutorials/SkillsAndWeakness";
import { StatusEffectsTutorial } from "./Tutorials/StatusEffects";
import { TrainingMatch } from "./Tutorials/TrainingMatch";
import { Coops } from "./Tutorials/Coops";
// import { Coops } from "./Tutorials/Coops";

export class TutorialManager { 
    private static instance: TutorialManager;

    private constructor() {

    }

    public static getInstance() {
        if(!TutorialManager.instance) {
            TutorialManager.instance = new TutorialManager();
        }
        return TutorialManager.instance;
    }

    public getTutorial(tutorialId: number) {
        return tutorials.find(tutorial => tutorial.id === tutorialId);
    }

    public getTutorialCount() {
        return tutorials.length;
    }
}

export enum StepMode {
    CENTER,
    SIDE
}

export enum stepType {
    REGULAR,
    FAIL,
    COMPLETE
}

const tutorials: Tutorial[] = [
    new IntroTutorial(),
    new SkipAndAttack(),
    new CombatBasics(),
    new SkillsAndWeakness(),
    new StatusEffectsTutorial(),
    new Coops(),
    new TrainingMatch()
]

export interface Tutorial {
    id: number;
    title: string;
    description: string;
    steps: DialogStep[];
    gamePlan: Game;
}


export interface DialogStep {
    id: number;
    text: string[];
    trigger: (game: Game, board: Board, currentDialog: DialogStep) => boolean;
    mode: StepMode;
    done: boolean;
    before?: (game: Game, board: Board) => void | boolean;
    after?: (game: Game, board: Board) => void | boolean;
    stepType: stepType;
}