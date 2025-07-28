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
import { FistWeaver } from "@/logic/Combatants/FistWeaver";
import { Hunter } from "@/logic/Combatants/Hunter";
import { BlockTarget, CritTarget, NormalTarget } from "@/logic/Combatants/TutorialCom";

export class CombatBasics implements Tutorial {
    id: number = 3;
    title: string = "Combat Basics";
    description: string = "Learn about critical hits, fumbles and action management";
    steps: DialogStep[] = [
       {
         id: 1,
         text: [
            `Remove that stupid smile off your face!
            I know what you're thinking. patting yourself on the back like your'e momma's genius, aren't you?
            Well let's see if you can get into your head how real fighting is going.`
            
         ],
         stepType: stepType.REGULAR,
         mode: StepMode.CENTER,
         trigger: (game: Game, board: Board) => {
            return true;
         },
         done: false
       },
       {
        id: 2,
        text: [
            `This time you've got another pair. Bullseye here is an honest to god damn fine shot. You'll need his help to deal with what comes next.`,
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 1 && currentDialog.done;
        },
        after: (game: Game, board: Board) => {
            const currentCombatant = game.getCurrentCombatant();
            currentCombatant.getAiAgent()?.playTurn(currentCombatant, game, board);
            game.nextTurn();

            const enemy = new NormalTarget('Target_1', { x: 4, y: 8}, game.teams[1]);
            board.placeCombatant(enemy, { x: 4, y: 8});
            return true;

        },
        done: false
       },
       {
        id: 3,
        text: [
            `Now, I'm going to put a target for you to crack at. Go on, have a swing at it.`,
            `To attack, either click on "Attack" in the menu, or click "A". then click on the target.`
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.SIDE,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 2 && currentDialog.done;
        },
        done: false
       },
       {
        id: 4,
        text: [
            `There! how does it feel to swing a weapon? gives you a rush of blood, doesn't it?`,
            `Now sure, my grand-grandmother could swing better, and your target was just a dummy, but we're only warming up.`
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 3 && board.isPositionEmpty({x:4, y:8});
        },
        done: false
       },
       {
        id: 5,
        text: [
            `But wait, here are some more targets for you to crack at!`,
            `Use Bullseye's ranged attack to score the further one if you want to get them both.`
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.SIDE,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 4 && currentDialog.done;
        },
        before: (game: Game, board: Board) => {
            const enemy = new CritTarget('Target_2', { x: 5, y: 8}, game.teams[1]);
            board.placeCombatant(enemy, { x: 5, y: 4});
            const enemy2 = new CritTarget('Target_3', { x: 4, y: 8}, game.teams[1]);
            board.placeCombatant(enemy2, { x: 4, y: 8});
        },
        done: false
       },
       {
        id: 6,
        text: [
            `Noticed that, haven't you, scumbag? You struck critical, and so, every attack only cost you half an action.`,
            `Scoring criticals is a sound strategy, it allows you to achieve more quicker. Remember that!`
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 5 && board.isPositionEmpty({x:4, y:8}) && board.isPositionEmpty({x:5, y:8});
        },
        done: false
       },
       {
        id: 7,
        text: [
            `Well, hotshot, here's another target for you. You look so smug, why don't you try to take that one down?`
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.SIDE,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 6 && currentDialog.done;
        },
        before: (game: Game, board: Board) => {
            const enemy = new BlockTarget('Target_4', { x: 5, y: 8}, game.teams[1]);
            board.placeCombatant(enemy, { x: 5, y: 8});
        },
        done: false
       },
       {
        id: 8,
        text: [
            `Not so full of yourself now, are you? Having your attacks fumbled or blocked will cost you double the action points,
            and will hinder your combat plan. You do that one time too many, and you're done for!`
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            const isEnemyTurn = game.getCurrentTeam().getIndex() === 1
            return currentDialog.id === 7 && isEnemyTurn;
        },
        before: (game: Game, board: Board) => {
            const enemy = board.getCombatantAtPosition({x: 5, y: 8}); 
            if(enemy) {
                enemy.stats.hp = 0;
                board.removeCombatant(enemy);
            }
        },
        done: false
       },
       {
        id: 9,
        text: [
            `Alright, enough with the goddamn handholding. Now we're gonna see if you're only a hand holding a weapon
            or you actually know how to guide it.`,
            `I'm placing a new batch of targets. You've got 1 round to dispose off all of them. Get Moving!`
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 8 && currentDialog.done;
        },
        after: (game: Game, board: Board) => {
            const playerTeam = game.teams[0];
            playerTeam.setTurnOrderIndex(0);

            const enemy = new NormalTarget('Target_5', { x: 7, y: 6}, game.teams[1]);
            board.placeCombatant(enemy, { x: 7, y: 6});
            const enemy2 = new NormalTarget('Target_6', { x: 4, y: 8}, game.teams[1]);
            board.placeCombatant(enemy2, { x: 4, y: 8});
            const enemy3 = new CritTarget('Target_7', { x: 6, y: 7}, game.teams[1]);
            board.placeCombatant(enemy3, { x: 3, y: 7});
            const enemy4 = new BlockTarget('Target_8', { x: 5, y: 6}, game.teams[1]);
            board.placeCombatant(enemy4, { x: 5, y: 6});
        },
        done: false
       },
       {
         id: 10,
         text: [
             `Not bad, private. But Don't rest on your lauerls just yet. That hand of yours is gonna do some more swining
             before I get you off the hook.`,
             `Come on, Here's another batch, let's see if you got what it takes to take'm all off in one round!`
         ],
         stepType: stepType.REGULAR,
         mode: StepMode.CENTER,
         trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 9 && currentDialog.done &&
            board.isPositionEmpty({x:7, y:6}) &&
            board.isPositionEmpty({x:4, y:8}) &&
            board.isPositionEmpty({x:3, y:7});
         },
         after: (game: Game, board: Board) => {
            const leftOver = board.getCombatantAtPosition({x: 5, y: 6}); 
            if(leftOver) {
                leftOver.stats.hp = 0;
                board.removeCombatant(leftOver);
            }

            const playerTeam = game.teams[0];
            playerTeam.setTurnOrderIndex(0);

            const enemy = new CritTarget('Target_9', { x: 7, y: 6}, game.teams[1]);
            board.placeCombatant(enemy, { x: 7, y: 6});
            const enemy2 = new NormalTarget('Target_10', { x: 4, y: 8}, game.teams[1]);
            board.placeCombatant(enemy2, { x: 4, y: 8});
            const enemy3 = new CritTarget('Target_11', { x: 6, y: 7}, game.teams[1]);
            board.placeCombatant(enemy3, { x: 6, y: 7});
            const enemy4 = new CritTarget('Target_12', { x: 4, y: 7}, game.teams[1]);
            board.placeCombatant(enemy4, { x: 4, y: 7});
            const enemy5 = new BlockTarget('Target_13', { x: 5, y: 5}, game.teams[1]);
            board.placeCombatant(enemy5, { x: 5, y: 5});
            const enemy6 = new BlockTarget('Target_13', { x: 2, y: 9}, game.teams[1]);
            board.placeCombatant(enemy6, { x: 2, y: 9});
        },
         done: false
       },
       {
          id: 11,
          text: [
                 `Outstanding! With just two combatants on the filed, in such a short time, you have managed to destroy
                 the entire enemy force. This is the power of clever action management.`,
                 `This is how it'll be from now on. Be smart, you get to act more and win. Be a blockheaded idiot, and your
                 enemies will cut you down like a cake.`,
                 `Alright, dismissed, for now.`
          ],
          stepType: stepType.COMPLETE,
          mode: StepMode.CENTER,
          trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            if(currentDialog.id !== 10) {
                return false;
            }

            return board.isPositionEmpty({x:7, y:6}) &&
            board.isPositionEmpty({x:4, y:8}) &&
            board.isPositionEmpty({x:6, y:7}) && 
            board.isPositionEmpty({x:4, y:7}) &&
            !board.isPositionEmpty({x:2, y:9}) &&
            !board.isPositionEmpty({x:5, y:5});
          },
          done: false
       }

    ];
    gamePlan: Game = (() => {
        const board = new Board(10, 10);
        const playerTeam = new Team('Your Team', 0);
        const tutorialTeam = new Team('Tutor', 1,new DummyAIAgent());
        const defender = new Defender('John Die-For-Me!', { x: 4, y: 9}, playerTeam);
        const hunter = new Hunter('Bullseye', { x: 5, y: 9}, playerTeam);
        hunter.stats.initiative = 2;
        playerTeam.addCombatant(defender);
        playerTeam.addCombatant(hunter);
        tutorialTeam.addCombatant(new StandardBearer('Tutor', { x: 9, y: 0}, tutorialTeam));
        playerTeam.combatants[0].specialMoves = playerTeam.combatants[0].specialMoves.filter((move: SpecialMove) => false);
        playerTeam.combatants[1].specialMoves = playerTeam.combatants[1].specialMoves.filter((move: SpecialMove) => false);
        const teams = [playerTeam, tutorialTeam];
        return new Game(teams, board);
    })();

    refreshTutorial(game: Game, board: Board) {
        this.steps.forEach((step: DialogStep) => {
            step.done = false;
        });
    }
}