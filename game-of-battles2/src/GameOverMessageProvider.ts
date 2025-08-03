import { Team } from './logic/Team';
import {  KidAIAgent, TeenagerAIAgent, RookieAIAgent } from './logic/AI/DeterministicAgents';
import { VeteranAIAgent } from './logic/AI/VeteranAIAgent';
import { stepType } from './GameData/TutorialManager';

const enum VitriolLevel {
    LOW,
    MEDIUM,
    HIGH,
}

export const enum ResultGap {
    SMALL,
    MEDIUM,
    LARGE,
    COMICAL,
}

export enum GameResult {
    WIN,
    LOSS,
}

export enum Difficulty {
    EASY = 'Easy',
    MEDIUM = 'Normal',
    HARD = 'Hard',
}

export function getGameOverMessage(team1: Team, team2: Team) {
    if(!isPvP(team1, team2)) {
        if(determineIsHumanWinner(team1, team2)) {
            return 'Enemy Died';
        } else {
            return 'YOU DIED';
        }
    } 
    const winner = determineWinner(team1, team2);
    if(winner.getName() === team1.getName()) {
        return team2.getName() + ' Died';
    } else {
        return team1.getName() + ' Died';
    }
}

export function getGameResultMessage(team1: Team, team2: Team) {
    if(isPvP(team1, team2)) {
        return getPvPMessages(team1, team2);
    } 
    return getPvAIMessages(team1, team2);
}

export function getTutorialCompleteMessage(type: stepType) {
    if(type === stepType.COMPLETE) {
        return 'Lesson Complete';
    }
    return 'Lesson Failed';
}

export function getTutorialResultMessage(type: stepType) {
    if(type === stepType.COMPLETE) {
        return 'Good boy, go on!';
    }
    return 'Dishonorably discharged';
}

function isPvP(team1: Team, team2: Team): boolean {
    return (team1.isHumanPlayerTeam() && team2.isHumanPlayerTeam()) || 
           (!team1.isHumanPlayerTeam() && !team2.isHumanPlayerTeam());
}

function getPvPMessages(team1: Team, team2: Team): string {
    const vitriolLevel = getVitriolLevelForPVP(team1, team2);
    const qualifiedMessages = PVP_MESSAGES[vitriolLevel];
    const pickedMessage = qualifiedMessages[Math.floor(Math.random() * qualifiedMessages.length)];
    const winner = determineWinner(team1, team2);
    const loser = winner.getName() === team1.getName() ? team2 : team1;
    return pickedMessage.replace("<winner>", winner.getName()).replace("<loser>", loser.getName());
}

function getPvAIMessages(team1: Team, team2: Team): string {
    const isHumanWinner = determineIsHumanWinner(team1, team2);
    const vitriolLevel = getVitriolLevelForPVAI(team1, team2, isHumanWinner);
    const qualifiedMessages = isHumanWinner? PVAI_MESSAGES[GameResult.WIN][vitriolLevel] : PVAI_MESSAGES[GameResult.LOSS][vitriolLevel];
    return qualifiedMessages[Math.floor(Math.random() * qualifiedMessages.length)];
}

function getVitriolLevelForPVAI(team1: Team, team2: Team, isHumanWinner: boolean): VitriolLevel {
    const resultGap = getResultGap(team1, team2);
    const difficulty = getDifficulty(team2);
    if(isHumanWinner) {
        if(difficulty === Difficulty.HARD || (difficulty === Difficulty.MEDIUM && resultGap === ResultGap.SMALL)) {
            return VitriolLevel.LOW;
        } else if(difficulty === Difficulty.MEDIUM || (difficulty === Difficulty.EASY && resultGap === ResultGap.SMALL)) {
            return VitriolLevel.MEDIUM;
        } else {
            return VitriolLevel.HIGH;
        }
    } else {
        if(difficulty === Difficulty.HARD || (difficulty === Difficulty.MEDIUM && resultGap === ResultGap.SMALL)) {
            return VitriolLevel.LOW;
        } else if(difficulty === Difficulty.MEDIUM || (difficulty === Difficulty.EASY && resultGap === ResultGap.SMALL)) {
            return VitriolLevel.MEDIUM;
        } else {
            return VitriolLevel.HIGH;
        }
    }
}

function getVitriolLevelForPVP(team1: Team, team2: Team): VitriolLevel {
    const resultGap = getResultGap(team1, team2);
    if(resultGap === ResultGap.SMALL) {
        return VitriolLevel.LOW;
    } else if(resultGap === ResultGap.MEDIUM) {
        return VitriolLevel.MEDIUM;
    } else {    
        return VitriolLevel.HIGH;
    }
}

function getDifficulty(aiTeam: Team): Difficulty {
    const agent =  aiTeam.aiAgent;
    if(agent instanceof VeteranAIAgent) {
        return Difficulty.HARD;
    } else if(agent instanceof KidAIAgent) {
        return Difficulty.EASY;
    } else {
        return Difficulty.MEDIUM;
    }
}

function getResultGap(team1: Team, team2: Team): ResultGap {
    const winnerTeam = determineWinner(team1, team2);
    const loserTeam = winnerTeam.getName() === team1.getName() ? team2 : team1;
    const winnerTeamCombatants = winnerTeam.combatants.filter(combatant => !combatant.isExpendable());
    const winnerTeamSurvivors = winnerTeam.getAliveCombatants().filter(combatant => !combatant.isExpendable());
    const loserTeamSurvivors = loserTeam.getAliveCombatants().filter(combatant => !combatant.isExpendable());
    const survivorsGap = Math.abs(winnerTeamSurvivors.length - loserTeamSurvivors.length);
    const winnerTeamSurvivorsHealth = winnerTeamSurvivors.reduce((acc, combatant) => acc + combatant.stats.hp, 0);
    const winnerTeamFullHealth = winnerTeamCombatants.reduce((acc, combatant) => acc + combatant.baseStats.hp, 0);
    const winnerTeamHealthPercentLeft = (winnerTeamSurvivorsHealth/winnerTeamFullHealth)*100;

    if((survivorsGap === 5 && winnerTeamHealthPercentLeft > 25) || (survivorsGap === 4 && winnerTeamHealthPercentLeft > 50)) {
        return ResultGap.COMICAL;
    } else if(survivorsGap === 4 && winnerTeamHealthPercentLeft > 20 || survivorsGap === 3 && winnerTeamHealthPercentLeft > 35) {
        return ResultGap.LARGE;
    } else if(survivorsGap === 3 && winnerTeamHealthPercentLeft > 15 || survivorsGap === 2 && winnerTeamHealthPercentLeft > 25) {
        return ResultGap.MEDIUM;
    } else {
        return ResultGap.SMALL;
    }
}

function determineWinner(team1: Team, team2: Team): Team {
    if(team1.isDefeated()) {
        return team2;
    }
    return team1;
}

function determineIsHumanWinner(team1: Team, team2: Team): boolean {
    const winner = determineWinner(team1, team2);
    if(winner.isHumanPlayerTeam()) {
        return true;
    }
    return false;
}

const PVP_MESSAGES = {
    [VitriolLevel.LOW]: [
        "Good game, you two.",
        "<winner>, winner winner, chicken dinner!",
    ],
    [VitriolLevel.MEDIUM]: [
        "<winner> wins, decisive victory!",
        "<loser> didn't stand a chance",
    ],
    [VitriolLevel.HIGH]: [
        "go on <loser>, give him your lunch money",
        "if I were you <winner>, I would be embarrassed to know <loser>",
        "You're not even trying, <loser>",
        "<loser> that was no slaughter, that was genocide",
        "<winner> wins, flawless victory",
    ],
}

const PVAI_MESSAGES = {
    [GameResult.LOSS]: {
        [VitriolLevel.HIGH]: [
            "That was pathetic",
            "You will never win!",
            "They whooped your a**",
            "Are you even trying?",
            "You should really try the tutorial",
            "They'll charge me for murder because of you..."
        ],
        [VitriolLevel.MEDIUM]: [
            "Git gud, scrub",
            "Clearly a skill issue...",
            "Was that your best?",
            "Learn the game, buddy",
            "Welcome to Die",
            "You are dead, dead, dead.",
            "life's hard, get over it!",
            "You went full retard"
        ],
        [VitriolLevel.LOW]: [
            "You thought you were hot. Guess what? you're not!",
            "Almost, but no.",
            "So close... try again",
            "Valiant, yet not enough",
            "You're playing with the big boys now...",
            "You are not worthy...",
            "God have mercy on your soul"
        ],
    },
    [GameResult.WIN]: {
        [VitriolLevel.LOW]: [
            "Superb!",
            "GG, care for a rematch?",
            "That was fun, let's do it again!",
            "Outstanding. Think you can do this again?",
        ],
        [VitriolLevel.MEDIUM]: [
            "Well done, but don't rest in your laurels yet",
            "Good, ready for a real challenge?",
            "Not bad, for a rookie",
            "Not too shabby, I'll give you that"
        ],
        [VitriolLevel.HIGH]: [
            "You may have won that, but don't get cocky.",
            "Good job beating up a kid, ready for a real challenge?",
            "Feeling lucky, punk? go for a high difficulty",
            "This was just an appetizer. Now go for the main course",
        ],
    },
}

