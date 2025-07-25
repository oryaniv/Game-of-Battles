import { Game } from "@/logic/Game";
import { DialogStep, StepMode, stepType, Tutorial } from "../TutorialManager";
import { Board } from "@/logic/Board";
import { Team } from "@/logic/Team";
import { DummyAIAgent } from "@/logic/AI/DeterministicAgents";
import { Defender } from "@/logic/Combatants/Defender";
import { Fool } from "@/logic/Combatants/Fool";
import { Wizard } from "@/logic/Combatants/Wizard";
import { StandardBearer } from "@/logic/Combatants/StandardBearer";
import { SpecialMove } from "@/logic/SpecialMove";
import { getEmptyAsType } from "@/logic/LogicFlags";
import { Hunter } from "@/logic/Combatants/Hunter";
import { Flame, Icicle, LightningBolt, Ricochet, ToxicArrow } from "@/logic/SpecialMoves/Singular/Offensive";
import { BlightTarget, FireTarget, IceTarget, LightningTarget, PierceTarget } from "@/logic/Combatants/TutorialCom";

export class SkillsAndWeakness implements Tutorial {
    id: number = 4;
    title: string = "Skills and Weakness";
    description: string = "Skills and Weakness";
    steps: DialogStep[] = [
       {
        id: 1,
        text: [
            `Alright you little punk, Fun's over. We're done with the rookie nonesense, and are about to go into the real stuff so pay attention!`,
            `So far all you did was swing a weapon. But real combat entails using advanced weapons and tools, and that's what we're going to see today.`
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return true;
        },
        done: false
       },
       {
        id: 2,
        text: [
            `Now look in front of you. Those targets won't just take a critical from you, and you won't be able to take them down so fast
            as you did the last ones.`,
            `Instead, you're gonna need special skills to take them down quickly.`,
            `I've given you command over our home wizard here, he may be arrogant and weird but he does the job.`,
            `Merlin: Respectfully, O drill seargent, it is my duty to inform thou that-`,
            `Tutor: Yeah yeah, Blah blah blah. Just get them sparks ready, will you?`
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.SIDE,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 1 && currentDialog.done;
        },
        done: false
       }
    ];
    gamePlan: Game = (() => {
        const board = new Board(10, 10);
        const playerTeam = new Team('Your Team', 0);
        const tutorialTeam = new Team('Tutor', 1,new DummyAIAgent());
        const wizard = new Wizard('Merlin', { x: 4, y: 9}, playerTeam);
        const hunter = new Hunter('Bullseye', { x: 5, y: 9}, playerTeam);
        hunter.stats.initiative = 2;
        playerTeam.addCombatant(wizard);
        playerTeam.addCombatant(hunter);
        playerTeam.combatants[0].specialMoves = [new Flame(), new Icicle, new LightningBolt];
        playerTeam.combatants[1].specialMoves = [new Ricochet(), new ToxicArrow()];

        tutorialTeam.addCombatant(new StandardBearer('Tutor', { x: 9, y: 0}, tutorialTeam));
        tutorialTeam.addCombatant(new FireTarget('Target_1', { x: 3, y: 6}, tutorialTeam));
        tutorialTeam.addCombatant(new IceTarget('Target_2', { x: 4, y: 6}, tutorialTeam));
        tutorialTeam.addCombatant(new BlightTarget('Target_1', { x: 5, y: 6}, tutorialTeam));
        tutorialTeam.addCombatant(new LightningTarget('Target_1', { x: 6, y: 6}, tutorialTeam));
        tutorialTeam.addCombatant(new PierceTarget('Target_1', { x: 7, y: 6}, tutorialTeam));
        const teams = [playerTeam, tutorialTeam];
        return new Game(teams, board);
    })();

    refreshTutorial(game: Game, board: Board) {
        this.steps.forEach((step: DialogStep) => {
            step.done = false;
        });
    }
}