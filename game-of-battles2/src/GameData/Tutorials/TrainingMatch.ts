import { Game } from "@/logic/Game";
import { DialogStep, StepMode, stepType, Tutorial } from "../TutorialManager";
import { Board } from "@/logic/Board";
import { Team } from "@/logic/Team";
import { KidAIAgent } from "@/logic/AI/DeterministicAgents";
import { Defender } from "@/logic/Combatants/Defender";
import { placeAllCombatants } from "@/boardSetups";
import { Hunter } from "@/logic/Combatants/Hunter";
import { Vanguard } from "@/logic/Combatants/Vanguard";
import { Healer } from "@/logic/Combatants/Healer";
import { Wizard } from "@/logic/Combatants/Wizard";

export class TrainingMatch implements Tutorial {
    id: number = 7;
    title: string = "Training Match";
    description: string = "Training Match";
    steps: DialogStep[] = [
        {
            id: 1,
            text: [
                `The time has finally come.`,
                `After today, You shall become a commander, a man who leads warriors to battle, to harvest, fame, glory, and
                everything that comes along with a good, bloody victory.`,
                `But before that happens, there is one final test before you.`
            ],
            mode: StepMode.CENTER,
            stepType: stepType.REGULAR,
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return true;
            },
            done: false
        },
        {
            id: 2,
            text: [
                `Your team is ready to fight under your command. On the others side, those punk busters are here
                in order to shove your head back into the hole. If they win, it means you didn't actually learn anything,
                and they'll give you all punishment you deserve and more.`,
                `So go, kick them to the curve, Break their bones, punch their teeth and make they regret they tried to face you.
                FIGHT!` 
            ],
            mode: StepMode.SIDE,
            stepType: stepType.REGULAR,
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return currentDialog.id === 1 && currentDialog.done;
            },
            done: false
        },
        {
            id: 3,
            text: [
                `Sweet god, what is that? What the HELL is that?`,
                `You better not be losing here you buster, or there will be a hell to pay, you hear me!?`
            ],
            mode: StepMode.SIDE,
            stepType: stepType.REGULAR,
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return game.teams[0].getAliveCombatants().length <= 2;
            },
            done: false
        },
        {
            id: 4,
            text: [
                `Yes, yes, goodamnit! you're almost there. One more to go, take them down, be a killer!!!`,
            ],
            mode: StepMode.SIDE,
            stepType: stepType.REGULAR,
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return game.teams[1].getAliveCombatants().length === 1;
            },
            done: false
        },
        {
            id: 5,
            text: [
                `What kind of lousy, miserable, pathetic excuse for a fight was this? How could you let this bunch of 
                knucklheaded brats beat you?`,
                `You not only have failed yourself and your team, you have failed ME, and for that I shall never forgive you.`,
                `Out of here, you scum sucking MAGGOT!`
            ],
            mode: StepMode.CENTER,
            stepType: stepType.FAIL,
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return game.teams[0].isDefeated();
            },
            done: false
        },
        {
            id: 6,
            text: [
                `Can you feel it? the dying cries, the smell of carnage, and the echoes of adrenalin?`,
                `This is how victory feels like, and as long as you get to expereince it, you will go on living.`,
                `Combat is a about many things: tactics, prepration, knowing the enemy, and knowing yourself.`,
                `But above anything, in order to win, you must have GUTS. the guts to go in, and give it all.`,
                `Some would even say, that guts is enough.`
            ],
            mode: StepMode.CENTER,
            stepType: stepType.COMPLETE,
            trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
                return game.teams[1].isDefeated();
            },
            done: false
        },
       
    ];
    gamePlan: Game = (() => {
        const board = new Board(10, 10);
        const playerTeam = new Team('Your Team', 0);
        const enemyTeam = new Team('Punk-Busters', 1,new KidAIAgent());
        playerTeam.addCombatant(new Defender('John Die-For-Me!', { x: 1, y: 1}, playerTeam));
        playerTeam.addCombatant(new Hunter('Bullseye', { x: 1, y: 2}, playerTeam));
        playerTeam.addCombatant(new Vanguard('Basher', { x: 0, y: 0}, playerTeam));
        playerTeam.addCombatant(new Healer('Medic', { x: 0, y: 0}, playerTeam));
        playerTeam.addCombatant(new Wizard('Merlin', { x: 0, y: 0}, playerTeam));

        enemyTeam.addCombatant(new Defender('Bighead', { x: 0, y: 0}, enemyTeam));
        enemyTeam.addCombatant(new Hunter('Hornet', { x: 0, y: 0}, enemyTeam));
        enemyTeam.addCombatant(new Vanguard('Puncher', { x: 0, y: 0}, enemyTeam));
        enemyTeam.addCombatant(new Healer('Bella', { x: 0, y: 0}, enemyTeam));
        enemyTeam.addCombatant(new Wizard('Lucius', { x: 2, y: 2}, enemyTeam));

        placeAllCombatants(playerTeam, enemyTeam, board);
        const teams = [playerTeam, enemyTeam];
        return new Game(teams, board);
    })();

    refreshTutorial(game: Game, board: Board) {
        this.steps.forEach((step: DialogStep) => {
            step.done = false;
        });
    }
}