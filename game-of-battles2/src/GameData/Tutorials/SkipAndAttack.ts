import { getEmptyAsType } from "@/logic/LogicFlags";
import { DialogStep, StepMode, Tutorial, stepType } from "../TutorialManager";
import { Game } from "@/logic/Game";
import { Board } from "@/logic/Board";
import { isSamePosition } from "@/logic/Position";
import { StandardBearer } from "@/logic/Combatants/StandardBearer";
import { Team } from "@/logic/Team";
import { Defender } from "@/logic/Combatants/Defender";
import { DummyAIAgent, HollowAIAgent, ToddlerAIAgent } from "@/logic/AI/DeterministicAgents";
import { SpecialMove } from "@/logic/SpecialMove";
import { Fool } from "@/logic/Combatants/Fool";
import { Hunter } from "@/logic/Combatants/Hunter";


export class SkipAndAttack implements Tutorial {
    id: number = 2;
    title: string = "Skip and Attack";
    description: string = "Skip and Attack";
    steps: DialogStep[] = [
        {
            id: 1,
            text: [
                `Alright, listen up! Every half-dumbstruck donkey can move his legs half decently, but it takes a man to actually
                put two and two together to form strategy.`,
                `On this lesson, we'll learn about action management, and see if you've actually got something between these ugly ears
                of yours.`
            ],
            trigger: (game: Game, board: Board) => {
                return true;
            },
            mode: StepMode.CENTER,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 2,
            text: [
                `Today, I've paired you up with a partner. This is Idiot, and he was once a would be player like you.
                He was a TOTAL FAILURE, and was handled accordingly.`,
                "Idiot: MMMPPHHH (That's not true, I-)",
                "Tutor: Zip it, moron, and you better hope this one doesn't end up like you."
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return currentDialog.id === 1 && currentDialog.done;
            },
            mode: StepMode.CENTER,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 3,
            text: [
                `Now, look below the board and you'll see the actions remaining bar. Right now there's only one action left for me,
                but when I'll switch to your side, you'll have two for both you and your partner.`
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return currentDialog.id === 2 && currentDialog.done;
            },
            mode: StepMode.SIDE,
            after: (game: Game, board: Board) => {
                const currentCombatant = game.getCurrentCombatant();
                currentCombatant.getAiAgent()?.playTurn(currentCombatant, game, board);
                game.nextTurn();
                return true;
            },
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 4,
            text: [
                `Alright, now you can see that together, you have two actions left. every time You get your turn, you'll have
                as many actions as allies in your team. You should plan ahead how to use them, unles you
                want to make a disgrace of yourself and be beaten like a twat.`,
                `So, I've already taught you how to move, now I want you to learn a tactial technque called quick skip.`,
                `Until now, you skipped to end your turn when you had nothing better to do. But, if you skip your turn
                without ever moving, you'll find out you only waste half an action.`,
                `Do it now, click on skip in the actions menu, or just press "k"`
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                const currentCombatant = game.getCurrentCombatant();
                const isPlayerTurn = currentCombatant.team.index === 0;
                return isPlayerTurn
            },
            mode: StepMode.SIDE,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 5,
            text: [
                `Right on. See how instead of losing an action icon, it only became damp? that means you still have half an action off it.`,
                `If you ever find yourself with only half an action left, you can still use it as if it was a whole!`, 
                `Now, keep skipping until all actions are out. Then we'll put this to practical use.`
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return game.getActionsRemaining() === 1.5 || game.getActionsRemaining() === 0.5;
            },
            mode: StepMode.SIDE,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 6,
            text: [
                `Alright, that's enough.
                Now, In a real fight, the enemy won't just be waiting you to walk your way willy-nilly to it just so
                you can have you go at them.`,
                `Forget it, scumbag. They will pelt you with arrows and spears and god knows
                whay kind of bullcrap and you'll be dead before you'll even get close.`,
                `so I'm gonna drop put you in front of death itself, and see if you're smart enough to survive.`

            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return currentDialog.id === 5 && game.getCurrentRound() === 2;
            },
            after: (game: Game, board: Board) => {
                const currentCombatant = game.getCurrentCombatant();
                currentCombatant.getAiAgent()?.playTurn(currentCombatant, game, board);
                game.nextTurn();

                const enemy = new Hunter('Bullseye', { x: 4, y: 3}, game.teams[1]);
                game.teams[1].addCombatant(enemy);
                board.placeCombatant(enemy, { x: 4, y: 3});
                enemy.insertAiAgent(new ToddlerAIAgent());

                const playerTeam = game.teams[0];
                playerTeam.setTurnOrderIndex(0);
            },
            mode: StepMode.CENTER,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 7,
            text: [
                `I want you to get right to Bullseye's face in 1 round. 2 actions points, that's all you have
                to get into melee so he can't shoot you down like a dog!`
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return currentDialog.id === 6 && currentDialog.done;
            },
            mode: StepMode.SIDE,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 8,
            text: [
                `Too late, and you've got an arrow between your eyes! Try again, trashead, before you get another one!`
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                const gameRound = game.getCurrentRound();
                const currentCombatant = game.getCurrentCombatant();
                const enemyTeamTurn = currentCombatant.team.index === 1;
                return gameRound === 3 && enemyTeamTurn;
            },
            before: (game: Game, board: Board) => {
                game.teams[0].combatants[0].move({ x: 4, y: 9}, board);
                game.teams[0].setTurnOrderIndex(0);
            },
            mode: StepMode.SIDE,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 9,
            text: [
                `Dropped the ball again, you good for nothing idiot! maybe I should put you in a clown suit and 
                parade you around. Get in his face already!`
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                const gameRound = game.getCurrentRound();
                const currentCombatant = game.getCurrentCombatant();
                const enemyTeamTurn = currentCombatant.team.index === 1;
                return gameRound === 4 && enemyTeamTurn;
            },
            before: (game: Game, board: Board) => {
                game.teams[0].combatants[0].move({ x: 4, y: 9}, board);
                game.teams[0].setTurnOrderIndex(0);
            },
            mode: StepMode.SIDE,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 9,
            text: [
                `What on gods earth are you DOING? Are you completely retarded? Why can't you
                put simple two and two together you little useless slime!? Get there already, you have 
                1 round and if you don't I swear you regret it!`
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                const gameRound = game.getCurrentRound();
                const currentCombatant = game.getCurrentCombatant();
                const enemyTeamTurn = currentCombatant.team.index === 1;
                return gameRound === 5 && enemyTeamTurn;
            },
            before: (game: Game, board: Board) => {
                game.teams[0].combatants[0].move({ x: 4, y: 9}, board);
                game.teams[0].setTurnOrderIndex(0);
            },
            mode: StepMode.SIDE,
            done: false,
            stepType: stepType.REGULAR
        },
        {
            id: 11,
            text: [
                `Your body's full of holes, you insipid little maggot! you're dead and slain, and
                I don't see the point of teaching someone who can't put two and two together. Get the hell out of here!`
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return game.getCurrentRound() === 6;
            },
            mode: StepMode.CENTER,
            done: false,
            stepType: stepType.FAIL
        },
        {
            id: 12,
            text: [
                `Oustanding! Now, up close, his bow isn't worth a damn and you can slice him up like a hot knife through butter.`,
                `But before you can become a real killer, you need to learn how to attack. So get yourself, moving to the next
                lesson.`,
            ],
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                const currentCombatant = game.getCurrentCombatant();
                const isPlayerTurn = currentCombatant.team.index === 0;
                return isPlayerTurn && currentCombatant.position.y === 4 && currentCombatant.position.x === 4;
            },
            mode: StepMode.CENTER,
            done: false,
            stepType: stepType.COMPLETE
        }
    ];
    gamePlan: Game = (() => {
        const board = new Board(10, 10);
        const playerTeam = new Team('Your Team', 0);
        const tutorialTeam = new Team('Tutor', 1, new DummyAIAgent());
        playerTeam.addCombatant(new Defender('John Die-For-Me!', { x: 4, y: 9}, playerTeam));
        playerTeam.addCombatant(new Fool('Idiot', { x: 5, y: 9}, playerTeam));
        tutorialTeam.addCombatant(new StandardBearer('Tutor', { x: 5, y: 0}, tutorialTeam));
        playerTeam.combatants[0].specialMoves = playerTeam.combatants[0].specialMoves.filter((move: SpecialMove) => false);
        playerTeam.combatants[1].specialMoves = playerTeam.combatants[1].specialMoves.filter((move: SpecialMove) => false);
        playerTeam.combatants[0].stats.initiative = 1;
        const teams = [playerTeam, tutorialTeam];
        return new Game(teams, board);
    })();

    refreshTutorial(game: Game, board: Board) {
        this.steps.forEach((step: DialogStep) => {
            step.done = false;
        });
    }
}