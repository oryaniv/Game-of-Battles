import { SoundManager } from "./SoundManager";
import { SoundByte } from "./SoundLibrary";
import { RunManager } from "./RunManager";
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

export function playCancelSound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.CANCEL);
}

export function playMenuButtonSound() {
    const soundManager = SoundManager.getInstance();
    soundManager.playSound(SoundByte.MENU_BUTTON_CLICK);
}