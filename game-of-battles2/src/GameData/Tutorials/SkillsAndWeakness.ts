import { Game } from "@/logic/Game";
import { DialogStep, StepMode, stepType, Tutorial } from "../TutorialManager";
import { Board } from "@/logic/Board";
import { Team } from "@/logic/Team";
import { DummyAIAgent, HollowAIAgent, KidAIAgent, ToddlerAIAgent } from "@/logic/AI/DeterministicAgents";
import { Defender } from "@/logic/Combatants/Defender";
import { Fool } from "@/logic/Combatants/Fool";
import { Wizard } from "@/logic/Combatants/Wizard";
import { StandardBearer } from "@/logic/Combatants/StandardBearer";
import { SpecialMove } from "@/logic/SpecialMove";
import { getEmptyAsType } from "@/logic/LogicFlags";
import { Hunter } from "@/logic/Combatants/Hunter";
import { Flame, Icicle, LightningBolt, Ricochet, Slicer, Stinger, ToxicArrow } from "@/logic/SpecialMoves/Singular/Offensive";
import { BlightTarget, FireTarget, IceTarget, LightningTarget, PierceTarget } from "@/logic/Combatants/TutorialCom";
import { Vanguard } from "@/logic/Combatants/Vanguard";
import { StatusEffectType } from "@/logic/StatusEffect";
import { Artificer } from "@/logic/Combatants/Artificer";
import { Combatant } from "@/logic/Combatant";

export class SkillsAndWeakness implements Tutorial {
    id: number = 4;
    title: string = "Skills and Weakness";
    description: string = "Learn about combatant skills and enemy weaknesses";
    steps: DialogStep[] = [
    //    {
    //     id: 1,
    //     text: [
    //         `Alright you little punk, Fun's over. We're done with the rookie nonesense, and are about to go into the real stuff so pay attention!`,
    //         `So far all you did was swing a weapon. But real combat entails using advanced weapons and tools, and that's what we're going to see today.`
    //     ],
    //     stepType: stepType.REGULAR,
    //     mode: StepMode.CENTER,
    //     trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
    //         return true;
    //     },
    //     done: false
    //    },
    //    {
    //     id: 2,
    //     text: [
    //         `Now look in front of you. Those targets won't just take a critical from you, and you won't be able to take them down so fast
    //         as you did the last ones.`,
    //         `Instead, you're gonna need special skills to take them down quickly.`,
    //         `I've given you command over our home wizard here, he may be arrogant and weird but he does the job.`,
    //         `Merlin: Respectfully, O drill seargent, it is my duty to inform thou that-`,
    //         `Tutor: Yeah yeah, Blah blah blah. Just get them sparks ready, will you?`
    //     ],
    //     stepType: stepType.REGULAR,
    //     mode: StepMode.CENTER,
    //     trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
    //         return currentDialog.id === 1 && currentDialog.done;
    //     },
    //     after: (game: Game, board: Board) => {
    //         const currentCombatant = game.getCurrentCombatant();
    //         currentCombatant.getAiAgent()?.playTurn(currentCombatant, game, board);
    //         game.nextTurn();
    //         return true;
    //     },
    //     done: false
    //    },
    //    {
    //     id: 3,
    //     text: [
    //         `It's time you get to know a new function, one which is of utmost importance. To anyone with a little ounce
    //         of brain, that is`,
    //         `As a soldier, you have the ability to examine the other combatants on the field. You can see their 
    //         strengthes, weaknesses, and how they fare.`,
    //         `Do it now, click on Examine, or press the 'X' key, then choose the target you want to examine.`,
    //         `When you are done, just skip your turn.`
    //     ],
    //     stepType: stepType.REGULAR,
    //     mode: StepMode.SIDE,
    //     // before: (game: Game, board: Board) => {
    //     //     game.spendActionPoints(1.5);
    //     // },
    //     trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
    //         return currentDialog.id === 2 && currentDialog.done;
    //     },
    //     done: false
    //    },
    //    {
    //     id: 4,
    //     text: [
    //         `By now, If you have paid attention, and if you actually examined the targets, you should have
    //         some idea what could make them crumble like dust.`,
    //         `But to actually act on that, you'll need the right tools. You are not granted the right to use
    //         the most important skills in a killer's kit - skills.`,
    //         `Press the skill button from the menu, or press the 'S' key, and choose the skill you want to use.`,
    //         `Choose the right skill for the job, and strike down the target with everything you've got!`
    //     ],
    //     stepType: stepType.REGULAR,
    //     mode: StepMode.CENTER,
    //     trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
    //         return currentDialog.id === 3 && game.getActionsRemaining() === 1.5;
    //     },
    //     after: (game: Game, board: Board) => {
    //         game.spendActionPoints(-0.5);
    //         return true;
    //     },
    //     done: false
    //    },
    //    {
    //     id: 5,
    //     text: [
    //         `Yes! See how this works? every time you hit an enemy's weakness, you only waste
    //         half an action, effectively doubling your killing momentum.`,
    //         `This is the way to win a fight. You don't wait for your enemies to respond,
    //         you blast them where it hurts, and you bring them down hard while they're just standing there
    //         like dolts, falling like wheat before your scythe!`
    //     ],
    //     stepType: stepType.REGULAR,
    //     mode: StepMode.CENTER,
    //     trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
    //         return currentDialog.id === 4 && 
    //         board.isPositionEmpty({x: 3, y: 6}) &&
    //         board.isPositionEmpty({x: 4, y: 6}) &&
    //         board.isPositionEmpty({x: 5, y: 6}) &&
    //         board.isPositionEmpty({x: 6, y: 6});
    //     },
    //     done: false
    //    },
    //    {
    //     id: 6,
    //     text: [
    //         `Oh ho! and who's that bad boy? look at him, walking around like he owns the goddamn place.`,
    //         `Listen scumbag, I want you to take him down. Hit him where it hurts, and bring him down
    //         before he gets to come at you. DO IT NO!`
    //     ],
    //     stepType: stepType.REGULAR,
    //     mode: StepMode.SIDE,
    //     trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
    //         return currentDialog.id === 5 && currentDialog.done;
    //     },
    //     before: (game: Game, board: Board) => {
    //         const redVanguard = new Vanguard('Dudley', { x: 5, y: 6}, game.teams[1]);
    //         redVanguard.applyStatusEffect({
    //             name: StatusEffectType.ALWAYS_BY_HIT,
    //             duration: Number.POSITIVE_INFINITY,
    //         });
    //         redVanguard.applyStatusEffect
    //         game.teams[1].addCombatant(redVanguard);
    //         board.placeCombatant(redVanguard, {x: 5, y: 6});
    //     },
    //     done: false
    //    },
    //    {
    //     id: 7,
    //     text: [
    //         `That's it! look at his him, sprawiling on the ground like an idiot, look at his stupid face. So big and tough
    //         and he doesn't even know what hit him. That big sword of his meant nothing, he didn't even get close enough to use it!`
    //     ],
    //     stepType: stepType.REGULAR,
    //     mode: StepMode.CENTER,
    //     trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
    //         return currentDialog.id === 6 && board.isPositionEmpty({x: 5, y: 6});
    //     },
    //     done: false 
    //    },
    //    {
    //     id: 8,
    //     text: [
    //         `Don't stop now, here are two more dunderheads, why don't you show them who's boss?`,
    //         `I've let your soliders get some new skills. 
    //         Come on private, examine them, get the right skills, and shoot them down where they stand!`
    //     ],
    //     stepType: stepType.REGULAR,
    //     mode: StepMode.SIDE,
    //     trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
    //         return currentDialog.id === 7 && currentDialog.done;
    //     },
    //     before: (game: Game, board: Board) => {
    //         const humpty = new Artificer('Humpty', { x: 4, y: 6}, game.teams[1]);
    //         const Dumpty = new Artificer('Dumpty', { x: 5, y: 6}, game.teams[1]);
    //         Dumpty.applyStatusEffect({
    //             name: StatusEffectType.ALWAYS_BY_HIT,
    //             duration: Number.POSITIVE_INFINITY,
    //         });
    //         humpty.applyStatusEffect({
    //             name: StatusEffectType.ALWAYS_BY_HIT,
    //             duration: Number.POSITIVE_INFINITY,
    //         });
    //         board.placeCombatant(humpty, {x: 4, y: 6});
    //         board.placeCombatant(Dumpty, {x: 5, y: 6});

    //         const merlin = game.teams[0].combatants.find((combatant: Combatant) => combatant.name === 'Merlin');
    //         merlin!.specialMoves = [new Flame(), new Icicle, new LightningBolt];
    //         const bullseye = game.teams[0].combatants.find((combatant: Combatant) => combatant.name === 'Bullseye');
    //         bullseye!.specialMoves = [new Stinger(), new ToxicArrow()];

    //         const currentTeamIndex = game.getCurrentTeam().getIndex();
    //         if(currentTeamIndex === 0) {
    //             const remainingActionPoints = game.getActionsRemaining();
    //             game.spendActionPoints(-(2 - remainingActionPoints));
    //             return true;
    //         }
    //     },
    //     done: false
    //    },
       {
        id: 9,
        text: [
            `Excellent, two of them against the two of you, yet they fell down like nothing, unable to do anything
            against your superior tactics. How does it feel, knowing you can dominate your enemy, that they cannot counterplay since
            there is no play for them?`,
            `But look out!`
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return true || currentDialog.id === 8 
            && board.isPositionEmpty({x: 4, y: 6})
            && board.isPositionEmpty({x: 5, y: 6});
        },
        after: (game: Game, board: Board) => {
            const merlin = game.teams[0].combatants.find((combatant: Combatant) => combatant.name === 'Merlin');
            merlin!.applyStatusEffect({
                name: StatusEffectType.ALWAYS_BY_HIT,
                duration: Number.POSITIVE_INFINITY,
            });
            const merlinPosition = merlin!.position;
            const attackFromPosition = {x: merlinPosition.x - 1, y: merlinPosition.y};
            const tutor = game.teams[1].combatants.find((combatant: Combatant) => combatant.name === 'Tutor');
            tutor!.move(attackFromPosition, board);
            tutor?.insertAiAgent(new KidAIAgent());

            if(game.getCurrentTeam().getIndex() === 0) {
                const remainingActionPoints = game.getActionsRemaining();
                game.spendActionPoints(remainingActionPoints);
                game.nextTurn();
                return true;
            }
        },
        done: false
       },
       {
        id: 10,
        text: [
            `Merlin: Ugggh...`,
            `Tutor: How about that, Smartass? did you think the same thing can't be done to you? why, good morning sunshine,
            your wizard got ragdolled, and your only remaining fighter's next!`,
            `Now, if you don't me to crush him down like an ant, you better learn fast. If you don't want a combatant
            on your side to be exposed to attacks on his weakness, have him use the defend action.`,
            `To defend, either hit the Defend button, or press the 'D' key. Do it before I kick ya to kingdom come.`,
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            const merlin = game.teams[0].combatants.find((combatant: Combatant) => combatant.name === 'Merlin');
            return currentDialog.id === 9 && currentDialog.done && merlin!.isKnockedOut();
        },
        after: (game: Game, board: Board) => {
            const bullseye = game.teams[0].combatants.find((combatant: Combatant) => combatant.name === 'Bullseye');
            bullseye!.applyStatusEffect({
                name: StatusEffectType.ALWAYS_BY_HIT,
                duration: Number.POSITIVE_INFINITY,
            });
        },
        done: false
       },
       {
        id: 11,
        text: [
            `Here it comes, sucker!`,
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.SIDE,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            const bullseye = game.teams[0].combatants.find((combatant: Combatant) => combatant.name === 'Bullseye');
            return currentDialog.id === 10 && currentDialog.done && bullseye!.hasStatusEffect(StatusEffectType.DEFENDING);
        },
        done: false
       },
       {
        id: 12,
        text: [
            `Magnificent! My blow was sound and direct, but you were able to deflect much of it.
            When you defend, any incoming attack will only do half damage, and will never score critical or 
            hit your weakness. Use it whenever you expect your enemy to come up with something devestating against you.
            You may lose an option to take the offense, but oftentimes, it is well worth it.`,
            `Oh, and another tip: you cannot defend after moving. Securing youreself demands dediaction, watch out for that.`,
            `Merlin: Ohhhh, my head...`,
            `Tutor: Ah, you're still here? fine, let's get done with it. MEDIC!!!`,
        ],
        stepType: stepType.COMPLETE,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            const bullseye = game.teams[0].combatants.find((combatant: Combatant) => combatant.name === 'Bullseye');
            const playerTurn = game.getCurrentTeam().getIndex() === 0;
            return currentDialog.id === 11 && playerTurn && !bullseye!.isKnockedOut();
        },
        done: false
       },
       {
        id: 13,
        text: [
            `Are your ears filled with Paper you scum-eating, brain-rotten, pig header maggot? I told you to defend, 
            DEFEND not whatever the hell you just did.`,
            `Bullseye: Bleaah...`,
            `Tutor: and now he's dead, and your'e officially in for a court martial for your infinite stupidity. GET THE 
            HELL OUT OF MY FACE!`,
        ],
        stepType: stepType.FAIL,
        mode: StepMode.CENTER,
        before: (game: Game, board: Board) => {
            const tutor = game.teams[1].combatants.find((combatant: Combatant) => combatant.name === 'Tutor');
            tutor!.insertAiAgent(new HollowAIAgent());
        },
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            const bullseye = game.teams[0].combatants.find((combatant: Combatant) => combatant.name === 'Bullseye');
            return bullseye!.isKnockedOut();
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
        playerTeam.combatants[1].specialMoves = [new Stinger(), new ToxicArrow()];

        const tutor = new StandardBearer('Tutor', { x: 9, y: 0}, tutorialTeam);
        tutor.specialMoves = [new Slicer()];
        tutor.stats.initiative = 100;
        tutor.applyStatusEffect({
            name: StatusEffectType.DRILL_SERGEANT,
            duration: Number.POSITIVE_INFINITY,
        });
        // tutor.stats.attackPower = 120;
        tutorialTeam.addCombatant(tutor);


        // const fireTarget = new FireTarget('Target_1', { x: 3, y: 6}, tutorialTeam);
        // const iceTarget = new IceTarget('Target_2', { x: 4, y: 6}, tutorialTeam);
        // const blightTarget = new BlightTarget('Target_1', { x: 5, y: 6}, tutorialTeam);
        // const pierceTarget = new PierceTarget('Target_1', { x: 6, y: 6}, tutorialTeam);
         
        // board.placeCombatant(fireTarget, {x: 3, y: 6});
        // board.placeCombatant(iceTarget, {x: 4, y: 6});
        // board.placeCombatant(blightTarget, {x: 5, y: 6});
        // board.placeCombatant(pierceTarget, {x: 6, y: 6});

        const teams = [playerTeam, tutorialTeam];
        return new Game(teams, board);
    })();

    refreshTutorial(game: Game, board: Board) {
        this.steps.forEach((step: DialogStep) => {
            step.done = false;
        });
    }
}