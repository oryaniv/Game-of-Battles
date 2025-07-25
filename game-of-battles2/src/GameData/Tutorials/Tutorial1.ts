import { getEmptyAsType } from "@/logic/LogicFlags";
import { DialogStep, StepMode, Tutorial, stepType } from "../TutorialManager";
import { Game } from "@/logic/Game";
import { Board } from "@/logic/Board";
import { isSamePosition } from "@/logic/Position";
import { StandardBearer } from "@/logic/Combatants/StandardBearer";
import { Team } from "@/logic/Team";
import { Defender } from "@/logic/Combatants/Defender";
import { DummyAIAgent } from "@/logic/AI/DeterministicAgents";
import { SpecialMove } from "@/logic/SpecialMove";
import { NormalTarget, CritTarget, BlockTarget } from "@/logic/Combatants/TutorialCom";


export class IntroTutorial implements Tutorial {
    id: number = 1;
    title: string = "Introduction";
    description: string = "Tutorial 1";
    steps: DialogStep[] = [
        {
            id: 1,
            text: [`Welcome to “Die For Me” trashhead! The developer begged me to leave my beloved island and get over here to be your drill instructor. 
And I can clearly see why! You must be the most pathetic maggot scum I’ve seen in years.
`,
`HOWEVER, you do what I say when I say just the way I say, and maybe you won’t leave here just to embarrass yourself, me and this game. I will review your progress, and should you fail me like the scumbag you are, I’m gonna claim your head. IS THAT CLEAR?`
],
            trigger: (game: Game, board: Board) => {
                console.log('Tutorial 1 step 1');
                return true;
            },
            mode: StepMode.CENTER,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 2, 
            text: [
                 `Now, look around. This is the battlefield, this is your new home, this is everything to you until you die. On one side, you stand with your team, your brothers and sisters to arm. On the other side, the enemy. `,
                 'The goal of this game is simple: Crush your enemies, kill them all to the last, and do it without a shred of mercy. You must become a killer, and that’s what I’ll turn you maggot into.'
                ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return currentDialog.id === 1 && currentDialog.done;
            },
            mode: StepMode.SIDE,
            done: false,
            after: (game: Game, board: Board, ) => {
                const currentCombatant = game.getCurrentCombatant();
                currentCombatant.getAiAgent()?.playTurn(currentCombatant, game, board);
                game.nextTurn();
            },
            stepType: stepType.REGULAR
        },
        {
            id: 3,
            text: [
                "Ok, enough talk, let's get your a** moving. I want you to walk over here and stand by me.",
                "What do you mean how? You've got hands, don't you, dumbass? click on the move button or press “m” and then click on the tile to move."
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return currentDialog.id === 2 && currentDialog.done;
            },
            mode: StepMode.SIDE,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 4,
            text: [
                "Tired Already, you lazy maggot? Press skip or 'k' to pass your sorry turn."
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                const currentCombatant = game.getCurrentCombatant();
                const isPlayer = currentCombatant.team.index === 0;
                const position = currentCombatant.position;
                return !isSamePosition(position, { x: 2, y: 9}) && isPlayer;
            },
            mode: StepMode.SIDE,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 5,
            text: [
                "You're up again, lazy butt. Come over here!"
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return game.getCurrentRound() > 1 && game.getCurrentTeam().index === 0;
            },
            mode: StepMode.SIDE,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 6,
            text: [
                "Just a little more, quickly!"
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return game.getCurrentRound() > 2 && game.getCurrentTeam().index === 0 &&
                 game.getCurrentCombatant().position.y <= 3;
            },
            mode: StepMode.SIDE,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 7,
            text: [
                "Very good. Now don't congrtulate youself, there's still a lot to go from here. Straighten up, we're moving on."
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                const currentCombatant = game.getCurrentCombatant();
                const isPlayer = currentCombatant.team.index === 0;
                return currentCombatant.position.y === 0 && isPlayer;
            },
            mode: StepMode.CENTER,
            done: false,
            stepType: stepType.COMPLETE
        },
        {
            id: 8,
            text: [
                "What by the nine hells are you doing, you braindead scum? Get your a** over here right now!"
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                const currentCombatant = game.getCurrentCombatant();
                const isPlayer = currentCombatant.team.index === 0;
                const position = currentCombatant.position;
                return game.getCurrentRound() > 4 && position.y > 3 && isPlayer;
            },
            mode: StepMode.SIDE,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 9,
            text: [
                "Why you little maggot, you make me wanna vomit! Get out of my training hall, I don't want to see your worthless hide again!"
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return game.getCurrentRound() > 6;
            },
            mode: StepMode.CENTER,
            done: false,
            stepType: stepType.FAIL
        }
    ];
    gamePlan: Game = (() => {
        const board = new Board(10, 10);
        const playerTeam = new Team('Your Team', 0);
        const tutorialTeam = new Team('Tutor', 1,new DummyAIAgent());
        playerTeam.addCombatant(new Defender('John Die-For-Me!', { x: 2, y: 9}, playerTeam));
        tutorialTeam.addCombatant(new StandardBearer('Tutor', { x: 3, y: 0}, tutorialTeam));
        playerTeam.combatants[0].specialMoves = playerTeam.combatants[0].specialMoves.filter((move: SpecialMove) => false);
        const teams = [playerTeam, tutorialTeam];
        return new Game(teams, board);
    })();

    refreshTutorial(game: Game, board: Board) {
        this.steps.forEach((step: DialogStep) => {
            step.done = false;
        });
    }
}