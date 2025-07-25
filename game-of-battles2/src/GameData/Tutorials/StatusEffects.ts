import { Game } from "@/logic/Game";
import { DialogStep, StepMode, stepType, Tutorial } from "../TutorialManager";
import { Board } from "@/logic/Board";
import { Team } from "@/logic/Team";
import { DummyAIAgent, ToddlerAIAgent } from "@/logic/AI/DeterministicAgents";
import { Defender } from "@/logic/Combatants/Defender";
import { Fool } from "@/logic/Combatants/Fool";
import { StandardBearer } from "@/logic/Combatants/StandardBearer";
import { SpecialMove } from "@/logic/SpecialMove";
import { getEmptyAsType } from "@/logic/LogicFlags";
import { Vanguard } from "@/logic/Combatants/Vanguard";
import { Healer } from "@/logic/Combatants/Healer";
import { Witch } from "@/logic/Combatants/Witch";
import { Heal } from "@/logic/SpecialMoves/Singular/Support";
import { CallOfStrength } from "@/logic/SpecialMoves/Singular/Buffs";
import { Weaken } from "@/logic/SpecialMoves/Singular/Debuffs";
import { Wall } from "@/logic/Combatants/ArtificerConstructs";
import { StatusEffectType } from "@/logic/StatusEffect";
import { Combatant } from "@/logic/Combatant";
import { CombatantType } from "@/logic/Combatants/CombatantType";
import { YouScumBag } from "@/logic/SpecialMoves/Singular/Offensive";

export class StatusEffectsTutorial implements Tutorial {
    id: number = 5;
    title: string = "Status Effects";
    description: string = "Status Effects";
    steps: DialogStep[] = [
       {
        id: 1,
        text: [
            `All right, silence, all of you!`,
            `You've seen weapon attacks and skills. You know how to wipe out the enemy before they can move, but combat entails much 
            more than that!`
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return true;
        },
        done: false
       },
       {
         id:2,
         text :[
            `This lesson, I've Invited a few specialists to help you out. These Combatants are not about bashing and beating, but instead
            they're about healing, empowering and harassing your enemies.`,
            `Don't you give me attitude! you think just because that warrior is holding up a big sword he ain't need any of those, huh?
            Fine, have it your way!`
         ],
         stepType: stepType.REGULAR,
         mode: StepMode.SIDE,
         trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 1 && currentDialog.done;
         },
         after: (game: Game, board: Board) => {
            const targetWall = new Wall('Wall_1', { x: 5, y: 7}, game.teams[1]);
            targetWall.applyStatusEffect({
                name: StatusEffectType.ALWAYS_BY_HIT,
                duration: 3,
            }); 
            targetWall.stats.defensePower = 40;
            board.placeCombatant(targetWall, { x: 5, y: 7});
            
            
            const currentCombatant = game.getCurrentCombatant();
            currentCombatant.getAiAgent()?.playTurn(currentCombatant, game, board);
            game.nextTurn();


            // const playerTeam = game.teams[0];
            // playerTeam.combatants[0].applyStatusEffect({
            //     name: StatusEffectType.STRENGTH_BOOST,
            //     duration: 3,
            // }); 

            return true;
         },
         done: false
       },
       {
        id: 3,
        text: [
            `Oh, what's that, buster? not enough juice on that swing? that pile of blocks is just standing there, mocking you, as it should.`,
            `But we can do better, and Ill show you just how!`,
            `I'm giving you command over the coroproal here. He's not a big brain basher, but he knows how to give proper motivation.`,
            `Now, I want you to use his speciality to give your basher the extra muscle he needs to succeed.`,
            `To do this, open the skill menu, or press the "S" key.`,
            `Now, select the "Call of Strength" skill, and use it on your basher. Then, attack the wall again!`,
        ],
        mode: StepMode.SIDE,
        stepType: stepType.REGULAR,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            const wall = board.getCombatantAtPosition({x: 5, y: 7});
            if(!wall) {
                return false;
            }
            const wallIsDamaged = wall.stats.hp < 60;
            return currentDialog.id === 2 && currentDialog.done && wallIsDamaged;
        },
        after: (game: Game, board: Board) => {
            const wall = board.getCombatantAtPosition({x: 5, y: 7});
            if(!wall) {
                return false;
            }
            wall.stats.hp = 60;

            const standardBearer = board.getCombatantAtPosition({x: 2, y: 7});
            if(!standardBearer) {
                return false;
            }
            const playerTeam = game.teams[0];
            standardBearer.team = playerTeam; 
            playerTeam.addCombatant(standardBearer);
            playerTeam.setTurnOrderIndex(0);
            game.spendActionPoints(-1);

        },
        done: false
       },
       {
         id: 4,
         text: [
            `Well now look at that, just a little encouragement, and the wall is down with one strike!`,
            `But that's not all these specialists can give ya.`
         ],
         mode: StepMode.CENTER,
         stepType: stepType.REGULAR,
         trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            const wallDestroyed = board.isPositionEmpty({x: 5, y: 7});
            return currentDialog.id === 3 && currentDialog.done && wallDestroyed;
         },
         after: (game: Game, board: Board) => {
            game.executeSkill(new YouScumBag(), game.getCurrentCombatant(), {x: 4, y: 7}, board);

            const healer = board.getCombatantAtPosition({x: 4, y: 5});
            if(!healer) {
                return false;
            }
            const playerTeam = game.teams[0];
            healer.team = playerTeam; 
            playerTeam.addCombatant(healer);
         },
         done: false
       },
       {
        id: 5,
        text: [
            `Cut your whining! yes, it stings a bit but if you're supposed to be a killer you should take it like a champ!`,
            `Now, I'm giving you control over the medic, she'll be able to help you pass that sting. use her skill, do it now.`
        ],
        mode: StepMode.SIDE,
        stepType: stepType.REGULAR,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 4 && currentDialog.done;
        },
        done: false
       },
       {
        id: 6,
        text: [
            `Works like magic, every goddamn time, I swear.`,
            `We're not done here yet. Just like you can use your allies to support and heal you, you can also use them
            to turn your enemies into worthless worms.`,
            `Here, look at this bad boy, look what he can do.`
        ],
        mode: StepMode.SIDE,
        stepType: stepType.REGULAR,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 5 && currentDialog.done && game.teams[0]
            .combatants.find((combatant: Combatant) => combatant.getCombatantType() === CombatantType.Vanguard)?.stats.hp === 110;
        },
        after: (game: Game, board: Board) => {
            const redVanguard = new Vanguard('Crusher', { x: 7, y: 7}, game.teams[1]);
            redVanguard.applyStatusEffect({
                name: StatusEffectType.STRENGTH_BOOST,
                duration: Number.POSITIVE_INFINITY,
            });
            const blueWall = new Wall('Wall_2', { x: 6, y: 7}, game.teams[0]);
            blueWall.stats.defensePower = 40;
            blueWall.applyStatusEffect({
                name: StatusEffectType.ALWAYS_BY_HIT,
                duration: Number.POSITIVE_INFINITY,
            });

            game.teams[1].addCombatant(redVanguard);
            board.placeCombatant(redVanguard, { x: 7, y: 7});
            redVanguard.insertAiAgent(new ToddlerAIAgent());
            board.placeCombatant(blueWall, { x: 6, y: 7});
        },
        done: false
       },
       {
         id: 7,
         text: [
            
         ],
         mode: StepMode.SIDE,
         stepType: stepType.REGULAR,
         trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 6 && currentDialog.done;
         },
         done: false
       }
    ];
    gamePlan: Game = (() => {
        const board = new Board(10, 10);
        const playerTeam = new Team('Your Team', 0);
        const tutorialTeam = new Team('Tutor', 1,new DummyAIAgent());
        const vanguard = new Vanguard('Basher', { x: 4, y: 7}, playerTeam);
        vanguard.specialMoves = vanguard.specialMoves.filter((move: SpecialMove) => false);
        const medic = new Healer('Medic', { x: 4, y: 5}, tutorialTeam);
        medic.specialMoves = [new Heal()];
        const corporal = new StandardBearer('Corpo.', { x: 2, y: 7}, tutorialTeam);
        corporal.stats.initiative = 10;
        corporal.specialMoves = [new CallOfStrength()];
        const activist = new Witch('Karen', { x: 4, y: 9}, tutorialTeam);
        activist.specialMoves = [new Weaken()];
        activist.stats.movementSpeed = 0;
        corporal.stats.movementSpeed = 0;
        medic.stats.movementSpeed = 0;
        playerTeam.addCombatant(vanguard);
        board.placeCombatant(medic, { x: 4, y: 5});
        board.placeCombatant(corporal, { x: 2, y: 7});
        board.placeCombatant(activist, { x: 4, y: 9});
        const tutor = new StandardBearer('Tutor', { x: 3, y: 0}, tutorialTeam);
        tutor.stats.initiative = 100;
        tutorialTeam.addCombatant(tutor);
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