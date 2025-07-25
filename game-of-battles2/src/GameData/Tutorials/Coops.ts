import { Game } from "@/logic/Game";
import { DialogStep, StepMode, stepType, Tutorial } from "../TutorialManager";
import { Board } from "@/logic/Board";
import { Team } from "@/logic/Team";
import { DummyAIAgent } from "@/logic/AI/DeterministicAgents";
import { Defender } from "@/logic/Combatants/Defender";
import { Fool } from "@/logic/Combatants/Fool";
import { StandardBearer } from "@/logic/Combatants/StandardBearer";
import { SpecialMove } from "@/logic/SpecialMove";
import { getEmptyAsType } from "@/logic/LogicFlags";

export class Coops implements Tutorial {
    id: number = 6;
    title: string = "Coops";
    description: string = "Coops";
    steps: DialogStep[] = [
       
    ];
    gamePlan: Game = (() => {
        return getEmptyAsType<Game>();
    })();

    refreshTutorial(game: Game, board: Board) {
        this.steps.forEach((step: DialogStep) => {
            step.done = false;
        });
    }
}