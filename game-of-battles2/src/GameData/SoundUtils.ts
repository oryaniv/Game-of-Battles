import { SoundManager } from "./SoundManager";
import { SoundByte, Track } from "./SoundLibrary";
import { RunManager, RunType } from "./RunManager";
import { Difficulty } from "@/logic/Difficulty";

export function playWalkingSound() {
    const soundManager = SoundManager.getInstance();
    const difficulty = RunManager.getInstance().getDifficulty();
    if(difficulty === Difficulty.EASY) {
        const randomSound = [SoundByte.FOREST_WALK1, SoundByte.FOREST_WALK2, SoundByte.FOREST_WALK3][Math.floor(Math.random() * 3)];
        soundManager.playSound(randomSound);
    } else if(difficulty === Difficulty.MEDIUM) {
        const randomSound = [SoundByte.CAVE_WALK1, SoundByte.CAVE_WALK2, SoundByte.CAVE_WALK3][Math.floor(Math.random() * 3)];
        soundManager.playSound(randomSound);
    } else if(difficulty === Difficulty.HARD) {
        const randomSound = [SoundByte.STONE_WALK1, SoundByte.STONE_WALK2][Math.floor(Math.random() * 2)];
        soundManager.playSound(randomSound);
    }
}

export function getBattleTrack() {
    const difficulty = RunManager.getInstance().getDifficulty();
    if(RunManager.getInstance().isBossFight()) {
        return Track.BOSS_FIGHT_THEME;
    }
    if(RunManager.getInstance().getRunType() === RunType.TUTORIAL) {
        return Track.TUTORIAL_FIGHT_THEME;
    }
    if(difficulty === Difficulty.EASY) {
        return Track.EASY_FIGHT_THEME;
    } else if(difficulty === Difficulty.MEDIUM) {
        return Track.MEDIUM_FIGHT_THEME;
    } else if(difficulty === Difficulty.HARD) {
        return Track.HARD_FIGHT_THEME;
    }
    return Track.MEDIUM_FIGHT_THEME;
}

// export function getPostBattleTrack() {
//     // eslint-disable-next-line
//     debugger
//     const runManager = RunManager.getInstance();
//     if(runManager.getRunType() === RunType.MULTI_PLAYER) {
//         return Track.VICTORY;
//     }

//     if(!window.history || !window.history.state) {
//         return Track.GAME_OVER;
//     }
      
//     const playerSurvived = window.history.state.playerSurvived;
//     return playerSurvived ? Track.VICTORY : Track.GAME_OVER;
// }

export function playPostMatchMusic(isVictory: boolean) {
    if(isVictory) {
        SoundManager.getInstance().playMusic(Track.VICTORY);
    } else {
        SoundManager.getInstance().playMusic(Track.GAME_OVER);
    }
}

export function playCancelSound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.CANCEL);
}

export function playMenuButtonSound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.MENU_BUTTON_CLICK);
}

export function playDefendSound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.ARMOR);
}

export function playMenuButtonClickSound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.MENU_BUTTON_CLICK);
}

export function playActionButtonClickSound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.ACTION_BUTTON_CLICK);
}

export function playHoverSound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.MENU_SCROLL);
}

export function playPromptSound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.PROMPT);
}

export function playCheckboxCheckSound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.CHECKBOX_CHECK);
}

export function playTowerTraversalSound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.TOWER_TRAVERSAL);
}

export function playTowerAscendSound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.TOWER_ASCEND);
}

export function playChooseJourneySound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.CHOOSE_YOUR_JOURNEY);
}

export function playWelcomeToDieForMeSound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.WELCOME_TO_DIE_FOR_ME);
}

export function stopCurrentMusic() {
    const soundManager = SoundManager.getInstance();
    soundManager.stopMusic();
}