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
import { StatusEffectType } from "@/logic/StatusEffect";
import { Militia } from "@/logic/Combatants/Militia";
import { CritTarget, PierceTarget } from "@/logic/Combatants/TutorialCom";
import { Hunter } from "@/logic/Combatants/Hunter";
import { Vanguard } from "@/logic/Combatants/Vanguard";
import { WhirlwindAttack } from "@/logic/SpecialMoves/Coop/OffensiveCoop";
import { FeralSwing, Rampage } from "@/logic/SpecialMoves/Singular/Offensive";
import { Artificer } from "@/logic/Combatants/Artificer";
import { CombatantType } from "@/logic/Combatants/CombatantType";

export class Coops implements Tutorial {
    id: number = 6;
    title: string = "Co-op Skills";
    description: string = "Learn about the extra powerful co-op skills";
    steps: DialogStep[] = [
       {
        id: 1,
        text: [
            `Rise and shine, you lazy numbskull! Would you look at that, you clunks were clumsy
            tidying up the place, and now we have a goblin infestation!`,
            `I want you to get rid of them ASAP, I want them gone and their filth picked clean, I want
            this place so sanitary and safe my grand-grandmother would be proud to take a tour around.`,
            `Get moving trashead, double time!`
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return true;
        },
        after: (game: Game, board: Board) => {
            const currentCombatant = game.getCurrentCombatant();
            currentCombatant.getAiAgent()?.playTurn(currentCombatant, game, board);
            game.nextTurn();
        },
        done: false
       },
       {
        id: 2,
        text: [
            `No, no you goddamn half-wit, it will take ages to wipe them all out this way!`,
            `Seems like regular ol' skills won't be enough here. Fine, time for some more extreme measures.`,
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 1 && game.getCurrentRound() === 2;
        },
        done: false
       },
       {
        id: 3,
        text: [
            `See, many combatants have their own feats and skills, but true strength comes from
            teamwork. When warriors are banded together, working as one unit, they soon discover they are able to
            do much more than they thought.`,
            `I have invited the corporal into your team. It is time to unlock Bullseye's true potential!`,
            `Press to co-op button, or press the 'O' key to open to co-op menu. Then, use your newfound power 
            to destroy those maggots!`,
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.SIDE,
        before: (game: Game, board: Board) => {
            const corporal = new StandardBearer('Corpo.', { x: 6, y: 9}, game.teams[0]);
            game.teams[0].addCombatant(corporal);
            board.placeCombatant(corporal, {x: 6, y: 9});
            if(game.getCurrentTeam().getIndex() === 0) {
                const remainingActionPoints = game.getActionsRemaining();
                game.spendActionPoints(-(2 - remainingActionPoints));
                return true;
            }
        },
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 2 && currentDialog.done;
        },
        done: false
       },
       {
        id: 4,
        text: [
            `Right on, those little infestations are gone, almost in the blink of an eye. Instead
            of shooting them down one at a time, your newfound inspiration allowed you to rain a hail of death
            upon their ugly heads!`,
            `A word of caution, though, In case you haven't noticed, many co op skills require more actions and would drain
            more of your combatants of their precious stamina. Watch out for that, and plan accordingly!`,
            `But looks like they aren't truly gone. Here are some more of them. Well, we don't you use
            that big guy over there to knock them out?`
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            const allGoblinsDead = board.isPositionEmpty({x: 7, y: 3}) && 
            board.isPositionEmpty({x: 7, y: 4}) && 
            board.isPositionEmpty({x: 6, y: 3}) && 
            board.isPositionEmpty({x: 8, y: 3});

            return currentDialog.id === 3 && game.getCurrentRound() < 5 && allGoblinsDead;
        },
        after: (game: Game, board: Board) => {
            const vanguard = new Vanguard('Badguy', { x: 2, y: 7}, game.teams[0]);
            game.teams[0].addCombatant(vanguard);
            vanguard.specialMoves = [new WhirlwindAttack(), new Rampage()];
            board.placeCombatant(vanguard, {x: 2, y: 7});

            const goblin = new Militia('Grozz', { x: 1, y: 3}, game.teams[1]);
            const goblin2 = new Militia('Partz', { x: 1, y: 4}, game.teams[1]);
            const goblin3 = new Militia('Magmag', { x: 1, y: 5}, game.teams[1]);
            const goblin4 = new Militia('Shooboo', { x: 3, y: 3}, game.teams[1]);
            const goblin5 = new Militia('Razziz', { x: 3, y: 4}, game.teams[1]);
            const goblin6 = new Militia('Koopla', { x: 3, y: 5}, game.teams[1]);
            const pireceTarget = new CritTarget('Target_1', { x: 2, y: 3}, game.teams[1]);

            board.placeCombatant(goblin, {x: 1, y: 3});
            board.placeCombatant(goblin2, {x: 1, y: 4});
            board.placeCombatant(goblin3, {x: 1, y: 5});
            board.placeCombatant(goblin4, {x: 3, y: 3});
            board.placeCombatant(goblin5, {x: 3, y: 4});
            board.placeCombatant(goblin6, {x: 3, y: 5});
            board.placeCombatant(pireceTarget, {x: 2, y: 3});

            if(game.getCurrentTeam().getIndex() === 0) {
                const remainingActionPoints = game.getActionsRemaining();
                game.spendActionPoints(-(3 - remainingActionPoints));
                return true;
            }
        },
        done: false
       },
       {
        id: 5,
        text: [
            `Just look at the carnage, the hacking of limbs, the cries of the fallen! by using the whirlwing attack,
            the vanguard is able to destroy waves of enemies at once, instead of hacking at them one by`,
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.SIDE,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            const allGoblinsDead = board.isPositionEmpty({x: 1, y: 3}) && 
            board.isPositionEmpty({x: 1, y: 4}) && 
            board.isPositionEmpty({x: 1, y: 5}) && 
            board.isPositionEmpty({x: 3, y: 3}) && 
            board.isPositionEmpty({x: 3, y: 4}) && 
            board.isPositionEmpty({x: 3, y: 5});

            return currentDialog.id === 4 && currentDialog.done && allGoblinsDead && game.getCurrentRound() < 7;
        },
        done: false
       },
       {
         id: 6,
         text: [
            `Grrrr Graaaahhhh!`,
            `Zbaarr nuukk! Itchagara! Graaaaaa!`,
            `Tutor: You hear that? does little bastards are coming back, and they sound angry.
            I want you to take them down, take them down hard and teach them a lesson they'll never forget!`,
            `Here, I'm giving you command of my artillery specialist, he'll give them something to think about. Now,
            use everything your combatants have to destroy every last goblin on the field.`,
         ],
         stepType: stepType.REGULAR,
         mode: StepMode.CENTER,
         trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return currentDialog.id === 5 && currentDialog.done;
         },
         after: (game: Game, board: Board) => {
            const artificer = new Artificer('BoomBoy', { x: 4, y: 8}, game.teams[0]);
            game.teams[0].addCombatant(artificer);
            board.placeCombatant(artificer, {x: 4, y: 8});

            const goblin = new Militia('Harr', { x: 2, y: 1}, game.teams[1]);
            const goblin2 = new Militia('Burra', { x: 3, y: 1}, game.teams[1]);
            const goblin3 = new Militia('Gatag', { x: 4, y: 1}, game.teams[1]);
            const goblin4 = new Militia('Yummar', { x: 5, y: 1}, game.teams[1]);
            const goblin5 = new Militia('Krako', { x: 6, y: 1}, game.teams[1]);
            const goblin6 = new Militia('Gush', { x: 7, y: 1}, game.teams[1]);
            const goblin7 = new Militia('Darrgh', { x: 8, y: 1}, game.teams[1]);

            board.placeCombatant(goblin, {x: 2, y: 1});
            board.placeCombatant(goblin2, {x: 3, y: 1});
            board.placeCombatant(goblin3, {x: 4, y: 1});
            board.placeCombatant(goblin4, {x: 5, y: 1});
            board.placeCombatant(goblin5, {x: 6, y: 1});
            board.placeCombatant(goblin6, {x: 7, y: 1});
            board.placeCombatant(goblin7, {x: 8, y: 1});

            game.teams[1].addCombatant(goblin);
            game.teams[1].addCombatant(goblin2);
            game.teams[1].addCombatant(goblin3);
            game.teams[1].addCombatant(goblin4);
            game.teams[1].addCombatant(goblin5);
            game.teams[1].addCombatant(goblin6);
            game.teams[1].addCombatant(goblin7);

            goblin.insertAiAgent(new ToddlerAIAgent());
            goblin2.insertAiAgent(new ToddlerAIAgent());
            goblin3.insertAiAgent(new ToddlerAIAgent());
            goblin4.insertAiAgent(new ToddlerAIAgent());
            goblin5.insertAiAgent(new ToddlerAIAgent());
            goblin6.insertAiAgent(new ToddlerAIAgent());
            goblin7.insertAiAgent(new ToddlerAIAgent());
         },
         done: false
       },
       {
        id: 6.1,
        text: [
            `Look at the corporal's co op skill. It can give you extra actions in order to 
            carry out your battle plan. Don't sleep on it!`,
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.SIDE,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return [6, 6.2, 6.3].includes(currentDialog.id) && game.getCurrentCombatant().name === "Corpo.";
        },
        done: false
       },
       {
        id: 6.2,
        text: [
            `Boomboy there is a crafty little bastard. His co op skill could allow you to deploy 
            a death instrument capable of raining death on your enemies!`,
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.SIDE,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return [6, 6.1, 6.3].includes(currentDialog.id) && game.getCurrentCombatant().name === "BoomBoy";
        },
        done: false
       },
       {
        id: 6.3,
        text: [
            `Combatants unlock different co op skills according to who is in their team. But beware, if the partners they
            need in order to carry them out are incapacitated, these skills won't be available!`,
        ],
        stepType: stepType.REGULAR,
        mode: StepMode.SIDE,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return [6, 6.1, 6.3].includes(currentDialog.id) && game.getCurrentTeam().getIndex() === 1
        },
        done: false
       },
       {
        id: 7,
        text: [
            `God and all of his angels, what a disgrace that is! How could you let those green garbage grovelers take your
            ENTIRE squad like that? Are you some kind of a special idiot? Are you that stupid you can't beat a bunch
            of ratborn maggots?`,
            `You're no commander, and you never will be. I'm gonna clean this place up myself from the filte, but first I'm going
            tp clean it from the dung heap that is your FACE!`
        ],
        stepType: stepType.FAIL,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            return game.teams[0].isDefeated();
        },
        done: false
       },
       {
        id: 8,
        text: [
            `And so, all the little buggers are dealt with.`,
            `But will you look at that. Dismembered limbs, splattered spleens, puddles of innards and  pools of 
            blood everywhere. You'e turned my hall into a slaughterhouse as filthy as a a thousand goddamn stables!`,
            `What are you waiting for, you shclubs? get them buckets and towels and start scurrbing up the place like you've never scrubbed before.
            I want this place so clean I could eat right off the ground. Move it, On the Double!`
        ],
        stepType: stepType.COMPLETE,
        mode: StepMode.CENTER,
        trigger: (game: Game, board: Board, currentDialog: DialogStep) => {
            const onlyTutorAlive = game.teams[1].getAliveCombatants().length === 1 && game.teams[1].getAliveCombatants()[0].name === "Tutor";
            return currentDialog.id === 6 && currentDialog.done && onlyTutorAlive;
        },
        done: false
       }
    ];
    gamePlan: Game = (() => {
        const board = new Board(10, 10);
        const playerTeam = new Team('Your Team', 0);
        const tutorialTeam = new Team('Tutor', 1,new DummyAIAgent());
        playerTeam.addCombatant(new Hunter('Bullseye', { x: 7, y: 9}, playerTeam));
        const tutor = new StandardBearer('Tutor', { x: 3, y: 0}, tutorialTeam);
        tutor.applyStatusEffect({
            name: StatusEffectType.DRILL_SERGEANT,
            duration: Number.POSITIVE_INFINITY,
        });
        tutor.stats.initiative = 100;
        tutorialTeam.addCombatant(tutor);

        const goblin = new Militia('Grozz', { x: 7, y: 3}, tutorialTeam);
        const goblin2 = new Militia('Brak', { x: 7, y: 4}, tutorialTeam);
        const goblin3 = new Militia('Kruk', { x: 6, y: 3}, tutorialTeam);
        const goblin4 = new Militia('Tartu', { x: 8, y: 3}, tutorialTeam);
        const pireceTarget = new PierceTarget('Target_1', { x: 7, y: 2}, tutorialTeam);

        board.placeCombatant(goblin, {x: 7, y: 3});
        board.placeCombatant(goblin2, {x: 7, y: 4});
        board.placeCombatant(goblin3, {x: 6, y: 3});
        board.placeCombatant(goblin4, {x: 8, y: 3});
        board.placeCombatant(pireceTarget, {x: 7, y: 2});

        const teams = [playerTeam, tutorialTeam];
        return new Game(teams, board);
    })();

    refreshTutorial(game: Game, board: Board) {
        this.steps.forEach((step: DialogStep) => {
            step.done = false;
        });
    }
}