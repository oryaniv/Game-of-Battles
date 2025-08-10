import { Howl } from "howler";
import { SoundAsset, SoundLoader, MusicAsset } from "./SoundLoader";
import { SoundByte, Track } from "./SoundLibrary";
import { getEmptyAsType } from "@/logic/LogicFlags";
import { OptionsManager } from "./OptionsManager";


const soundTable: { [key in SoundByte]: SoundAsset } = {
    // damage
    [SoundByte.Blight]: {name:SoundByte.Blight, asset: getEmptyAsType<Howl>()},
    [SoundByte.CRUSH]: {name:SoundByte.CRUSH, asset: getEmptyAsType<Howl>()},
    [SoundByte.DARK]: {name:SoundByte.DARK, asset: getEmptyAsType<Howl>()},
    [SoundByte.FIRE]: {name:SoundByte.FIRE, asset: getEmptyAsType<Howl>()},
    [SoundByte.HEALING]: {name:SoundByte.HEALING, asset: getEmptyAsType<Howl>()},
    [SoundByte.HOLY]: {name:SoundByte.HOLY, asset: getEmptyAsType<Howl>()},
    [SoundByte.ICE]: {name:SoundByte.ICE, asset: getEmptyAsType<Howl>()},
    [SoundByte.PIERCE]: {name:SoundByte.PIERCE, asset: getEmptyAsType<Howl>()},
    [SoundByte.SLASH]: {name:SoundByte.SLASH, asset: getEmptyAsType<Howl>()},
    [SoundByte.LIGHTNING]: {name:SoundByte.LIGHTNING, asset: getEmptyAsType<Howl>()},

    // buffs and debuffs
    [SoundByte.BUFF]: {name:SoundByte.BUFF, asset: getEmptyAsType<Howl>()},
    [SoundByte.DEBUFF]: {name:SoundByte.DEBUFF, asset: getEmptyAsType<Howl>()},
    [SoundByte.TURN_START]: {name:SoundByte.TURN_START, asset: getEmptyAsType<Howl>()},
    [SoundByte.FOOL_LAUGH_FASTER]: {name:SoundByte.FOOL_LAUGH_FASTER, asset: getEmptyAsType<Howl>()},
    [SoundByte.SEDUCE]: {name:SoundByte.SEDUCE, asset: getEmptyAsType<Howl>()},
    [SoundByte.ARMOR]: {name:SoundByte.ARMOR, asset: getEmptyAsType<Howl>()},
    [SoundByte.SMITH]: {name:SoundByte.SMITH, asset: getEmptyAsType<Howl>()},
    [SoundByte.COUGH]: {name:SoundByte.COUGH, asset: getEmptyAsType<Howl>()},
    [SoundByte.SCREAM]: {name:SoundByte.SCREAM, asset: getEmptyAsType<Howl>()},
    [SoundByte.SNORING]: {name:SoundByte.SNORING, asset: getEmptyAsType<Howl>()},
    [SoundByte.MISS]: {name:SoundByte.MISS, asset: getEmptyAsType<Howl>()},
    [SoundByte.AIM]: {name:SoundByte.AIM, asset: getEmptyAsType<Howl>()},
    [SoundByte.SHADOW_STEP]: {name:SoundByte.SHADOW_STEP, asset: getEmptyAsType<Howl>()}, // volume should be lowered
    [SoundByte.RAGE]: {name:SoundByte.RAGE, asset: getEmptyAsType<Howl>()},
    
    [SoundByte.ARCANE]: {name:SoundByte.ARCANE, asset: getEmptyAsType<Howl>()},

    // walking sounds
    [SoundByte.FOREST_WALK1]: {name:SoundByte.FOREST_WALK1, asset: getEmptyAsType<Howl>()},
    [SoundByte.FOREST_WALK2]: {name:SoundByte.FOREST_WALK2, asset: getEmptyAsType<Howl>()},
    [SoundByte.FOREST_WALK3]: {name:SoundByte.FOREST_WALK3, asset: getEmptyAsType<Howl>()},
    [SoundByte.CAVE_WALK1]: {name:SoundByte.CAVE_WALK1, asset: getEmptyAsType<Howl>()},
    [SoundByte.CAVE_WALK2]: {name:SoundByte.CAVE_WALK2, asset: getEmptyAsType<Howl>()},
    [SoundByte.CAVE_WALK3]: {name:SoundByte.CAVE_WALK3, asset: getEmptyAsType<Howl>()},
    [SoundByte.STONE_WALK1]: {name:SoundByte.STONE_WALK1, asset: getEmptyAsType<Howl>()},
    [SoundByte.STONE_WALK2]: {name:SoundByte.STONE_WALK2, asset: getEmptyAsType<Howl>()},

    // laughter
    [SoundByte.FOOL_LAUGH]: {name:SoundByte.FOOL_LAUGH, asset: getEmptyAsType<Howl>()},
    [SoundByte.EVIL_LAUGH]: {name:SoundByte.EVIL_LAUGH, asset: getEmptyAsType<Howl>()},

    [SoundByte.DEFEAT_SOUND]: {name:SoundByte.DEFEAT_SOUND, asset: getEmptyAsType<Howl>()},
    // [SoundByte.VICTORY_SOUND]: {name:SoundByte.VICTORY_SOUND, asset: getEmptyAsType<Howl>()},

    [SoundByte.MENU_BUTTON_CLICK]: {name:SoundByte.MENU_BUTTON_CLICK, asset: getEmptyAsType<Howl>()},
    [SoundByte.ACTION_BUTTON_CLICK]: {name:SoundByte.ACTION_BUTTON_CLICK, asset: getEmptyAsType<Howl>()},
    [SoundByte.CANCEL]: {name:SoundByte.CANCEL, asset: getEmptyAsType<Howl>()},
    // [SoundByte.MENU_SCROLL]: {name:SoundByte.MENU_SCROLL, asset: getEmptyAsType<Howl>()},
    // [SoundByte.SKILL_SELECT]: {name:SoundByte.SKILL_SELECT, asset: getEmptyAsType<Howl>()},
    // [SoundByte.CHECKBOX_CHECK]: {name:SoundByte.CHECKBOX_CHECK, asset: getEmptyAsType<Howl>()},
    [SoundByte.WRITING]: {name:SoundByte.WRITING, asset: getEmptyAsType<Howl>()}, // volume should be amplified
    // [SoundByte.TOWER_TRAVERSAL]: {name:SoundByte.TOWER_TRAVERSAL, asset: getEmptyAsType<Howl>()},

};

const musicTable: { [key in Track]: MusicAsset } = {
    [Track.MAIN_MENU]: {name:Track.MAIN_MENU, asset: getEmptyAsType<Howl>()}, // volume should be amplified
    // [Track.BUILD_TEAM]: {name:Track.BUILD_TEAM, asset: getEmptyAsType<Howl>()},
    // [Track.JOURNEY]: {name:Track.JOURNEY, asset: getEmptyAsType<Howl>()},
    // [Track.TUTORIAL_FIGHT_THEME]: {name:Track.TUTORIAL_FIGHT_THEME, asset: getEmptyAsType<Howl>()},
    // [Track.EASY_FIGHT_THEME]: {name:Track.EASY_FIGHT_THEME, asset: getEmptyAsType<Howl>()},
    // [Track.MEDIUM_FIGHT_THEME]: {name:Track.MEDIUM_FIGHT_THEME, asset: getEmptyAsType<Howl>()},
    // [Track.HARD_FIGHT_THEME]: {name:Track.HARD_FIGHT_THEME, asset: getEmptyAsType<Howl>()},
    // [Track.BOSS_FIGHT_THEME]: {name:Track.BOSS_FIGHT_THEME, asset: getEmptyAsType<Howl>()},
    // [Track.GAME_OVER]: {name:Track.GAME_OVER, asset: getEmptyAsType<Howl>()},
    // [Track.VICTORY]: {name:Track.VICTORY, asset: getEmptyAsType<Howl>()},
};



export class SoundManager {
    private static instance: SoundManager;
    private soundLoader: SoundLoader;
    private currentPlayingMusic: Howl | null = null;

    private constructor() {
        this.soundLoader = new SoundLoader();
        this.preloadSounds();
        this.preloadMusic();
    }

    public static getInstance() {
        if(!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    public preloadSounds() {
        const sfxVolume = OptionsManager.getInstance().getSFXVolume();
        this.soundLoader.loadSounds(soundTable, sfxVolume);
    }

    public preloadMusic() {
        const musicVolume = OptionsManager.getInstance().getMusicVolume();
        this.soundLoader.loadMusic(musicTable, musicVolume);
    }

    playSound(sound: SoundByte) {
        const isSoundOn = OptionsManager.getInstance().getSoundOn();
        if(!isSoundOn) {
            return;
        }
        const soundHowl:Howl = soundTable[sound].asset;
        soundHowl.play();
    }
    
    playMusic(track: Track) {
        const isSoundOn = OptionsManager.getInstance().getSoundOn();
        if(!isSoundOn) {
            return;
        }

        if(this.currentPlayingMusic && this.currentPlayingMusic.playing()) {
            return;
        }

        const musicHowl:Howl = musicTable[track].asset;
        musicHowl.play();
        this.currentPlayingMusic = musicHowl;
    }

    updateSFXVolume(volume: number) {
        for(const [sound, soundAsset] of Object.entries(soundTable)) {
            const soundHowl:Howl = soundAsset.asset;
            soundHowl.volume(volume);
        }
    }

    updateMusicVolume(volume: number) {
        for(const [music, musicAsset] of Object.entries(musicTable)) {
            const musicHowl:Howl = musicAsset.asset;
            musicHowl.volume(volume);
        }
    }
}