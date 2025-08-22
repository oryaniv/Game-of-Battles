import { Howl } from "howler";
import { SoundAsset, SoundLoader, MusicAsset } from "./SoundLoader";
import { SoundByte, Track } from "./SoundLibrary";
import { getEmptyAsType } from "@/logic/LogicFlags";
import { OptionsManager } from "./OptionsManager";


const soundTable: { [key in SoundByte]: SoundAsset } = {
    // damage
    [SoundByte.Blight]: {name:SoundByte.Blight, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.CRUSH]: {name:SoundByte.CRUSH, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.DARK]: {name:SoundByte.DARK, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.FIRE]: {name:SoundByte.FIRE, asset: getEmptyAsType<Howl>(), standardVolume: 0.8},
    [SoundByte.HEALING]: {name:SoundByte.HEALING, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.HOLY]: {name:SoundByte.HOLY, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.ICE]: {name:SoundByte.ICE, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.PIERCE]: {name:SoundByte.PIERCE, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.SLASH]: {name:SoundByte.SLASH, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.LIGHTNING]: {name:SoundByte.LIGHTNING, asset: getEmptyAsType<Howl>(), standardVolume: 0.7},
    [SoundByte.UNSTOPPABLE]: {name:SoundByte.UNSTOPPABLE, asset: getEmptyAsType<Howl>(), standardVolume: 1},

    // buffs and debuffs
    [SoundByte.BUFF]: {name:SoundByte.BUFF, asset: getEmptyAsType<Howl>(), standardVolume: 1 },
    [SoundByte.DEBUFF]: {name:SoundByte.DEBUFF, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.HOLY_BUFF]: {name:SoundByte.HOLY_BUFF, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.TURN_START]: {name:SoundByte.TURN_START, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.FOOL_LAUGH_FASTER]: {name:SoundByte.FOOL_LAUGH_FASTER, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.SEDUCE]: {name:SoundByte.SEDUCE, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.ARMOR]: {name:SoundByte.ARMOR, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.SMITH]: {name:SoundByte.SMITH, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.COUGH]: {name:SoundByte.COUGH, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.SCREAM]: {name:SoundByte.SCREAM, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.SNORING]: {name:SoundByte.SNORING, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.MISS]: {name:SoundByte.MISS, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.AIM]: {name:SoundByte.AIM, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.SHADOW_STEP]: {name:SoundByte.SHADOW_STEP, asset: getEmptyAsType<Howl>(), standardVolume: 0.7}, // volume should be lowered
    [SoundByte.RAGE]: {name:SoundByte.RAGE, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    
    [SoundByte.ARCANE]: {name:SoundByte.ARCANE, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.TELEPORTATION]: {name:SoundByte.TELEPORTATION, asset: getEmptyAsType<Howl>(), standardVolume: 1},

    // walking sounds
    [SoundByte.FOREST_WALK1]: {name:SoundByte.FOREST_WALK1, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.FOREST_WALK2]: {name:SoundByte.FOREST_WALK2, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.FOREST_WALK3]: {name:SoundByte.FOREST_WALK3, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.CAVE_WALK1]: {name:SoundByte.CAVE_WALK1, asset: getEmptyAsType<Howl>(), standardVolume: 1},
                        [SoundByte.CAVE_WALK2]: {name:SoundByte.CAVE_WALK2, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.CAVE_WALK3]: {name:SoundByte.CAVE_WALK3, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.STONE_WALK1]: {name:SoundByte.STONE_WALK1, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.STONE_WALK2]: {name:SoundByte.STONE_WALK2, asset: getEmptyAsType<Howl>(), standardVolume: 1},

    // laughter
    [SoundByte.FOOL_LAUGH]: {name:SoundByte.FOOL_LAUGH, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.EVIL_LAUGH]: {name:SoundByte.EVIL_LAUGH, asset: getEmptyAsType<Howl>(), standardVolume: 1},

    [SoundByte.DEFEAT_SOUND]: {name:SoundByte.DEFEAT_SOUND, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.VICTORY_SOUND]: {name:SoundByte.VICTORY_SOUND, asset: getEmptyAsType<Howl>(), standardVolume: 1},

    [SoundByte.MENU_BUTTON_CLICK]: {name:SoundByte.MENU_BUTTON_CLICK, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.ACTION_BUTTON_CLICK]: {name:SoundByte.ACTION_BUTTON_CLICK, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.CANCEL]: {name:SoundByte.CANCEL, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.MENU_SCROLL]: {name:SoundByte.MENU_SCROLL, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    // [SoundByte.MENU_SCROLL_MINOR]: {name:SoundByte.MENU_SCROLL_MINOR, asset: getEmptyAsType<Howl>()},
    [SoundByte.SKILL_SELECT]: {name:SoundByte.SKILL_SELECT, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.CHECKBOX_CHECK]: {name:SoundByte.CHECKBOX_CHECK, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.WRITING]: {name:SoundByte.WRITING, asset: getEmptyAsType<Howl>(), standardVolume: 1}, 
    [SoundByte.PROMPT]: {name:SoundByte.PROMPT, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.TOWER_TRAVERSAL]: {name:SoundByte.TOWER_TRAVERSAL, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.TOWER_ASCEND]: {name:SoundByte.TOWER_ASCEND, asset: getEmptyAsType<Howl>(), standardVolume: 1},

    [SoundByte.DEFENDER_SELECT]: {name:SoundByte.DEFENDER_SELECT, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.CHAMPION_SELECT]: {name:SoundByte.CHAMPION_SELECT, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.HUNTER_SELECT]: {name:SoundByte.HUNTER_SELECT, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.VANGUARD_SELECT]: {name:SoundByte.VANGUARD_SELECT, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.WIZARD_SELECT]: {name:SoundByte.WIZARD_SELECT, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.ARTIFICER_SELECT]: {name:SoundByte.ARTIFICER_SELECT, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.WITCH_SELECT]: {name:SoundByte.WITCH_SELECT, asset: getEmptyAsType<Howl>(), standardVolume: 1}, 
    [SoundByte.PIKEMAN_SELECT]: {name:SoundByte.PIKEMAN_SELECT, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.FIST_WEAVER_SELECT]: {name:SoundByte.FIST_WEAVER_SELECT, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.HEALER_SELECT]: {name:SoundByte.HEALER_SELECT, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.ROGUE_SELECT]: {name:SoundByte.ROGUE_SELECT, asset: getEmptyAsType<Howl>(), standardVolume: 1},

    [SoundByte.WELCOME_TO_DIE_FOR_ME]: {name:SoundByte.WELCOME_TO_DIE_FOR_ME, asset: getEmptyAsType<Howl>(), standardVolume: 1},
    [SoundByte.CHOOSE_YOUR_JOURNEY]: {name:SoundByte.CHOOSE_YOUR_JOURNEY, asset: getEmptyAsType<Howl>(), standardVolume: 1 },

};

// const musicTable: { [key in Track]: MusicAsset } = {
//     [Track.MAIN_MENU]: {name:Track.MAIN_MENU, asset: getEmptyAsType<Howl>()}, // volume should be amplified
//     [Track.BUILD_TEAM]: {name:Track.BUILD_TEAM, asset: getEmptyAsType<Howl>()},
//     [Track.JOURNEY]: {name:Track.JOURNEY, asset: getEmptyAsType<Howl>()},
//     [Track.TUTORIAL_FIGHT_THEME]: {name:Track.TUTORIAL_FIGHT_THEME, asset: getEmptyAsType<Howl>()},
//     [Track.EASY_FIGHT_THEME]: {name:Track.EASY_FIGHT_THEME, asset: getEmptyAsType<Howl>()},
//     [Track.MEDIUM_FIGHT_THEME]: {name:Track.MEDIUM_FIGHT_THEME, asset: getEmptyAsType<Howl>()},
//     [Track.HARD_FIGHT_THEME]: {name:Track.HARD_FIGHT_THEME, asset: getEmptyAsType<Howl>()},
//     [Track.BOSS_FIGHT_THEME]: {name:Track.BOSS_FIGHT_THEME, asset: getEmptyAsType<Howl>()},
//     [Track.GAME_OVER]: {name:Track.GAME_OVER, asset: getEmptyAsType<Howl>()},
//     [Track.VICTORY]: {name:Track.VICTORY, asset: getEmptyAsType<Howl>()},
//     // [Track.CREDITS]: {name:Track.CREDITS, asset: getEmptyAsType<Howl>()},
// };



export class SoundManager {
    private static instance: SoundManager;
    private soundLoader: SoundLoader;
    private currentPlayingMusic: Howl | null = null;
    private soundCooldowns: Map<SoundByte, boolean>;
    private readonly sfxCooldownTime: number = 200;

    private constructor() {
        this.soundLoader = new SoundLoader();
        this.preloadSounds();
        this.soundCooldowns = new Map();
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
        // const musicVolume = OptionsManager.getInstance().getMusicVolume();
        // this.soundLoader.loadMusic(musicTable, musicVolume);
    }

    playSound(sound: SoundByte) {
        const isSoundOn = OptionsManager.getInstance().getSoundOn();
        if(!isSoundOn) {
            return;
        }

        const isOnCooldown = this.soundCooldowns.get(sound);
        if(isOnCooldown) {
            return;
        }

        const soundHowl:Howl = soundTable[sound].asset;
        soundHowl.play();
        this.soundCooldowns.set(sound, true);

        setTimeout(() => {
            this.soundCooldowns.set(sound, false);
        }, this.sfxCooldownTime);
    }
    
    playMusic(track: Track) {
        // const isSoundOn = OptionsManager.getInstance().getSoundOn();
        // if(!isSoundOn) {
        //     return;
        // }

        // if(this.currentPlayingMusic && this.currentPlayingMusic.playing()) {
        //     return;
        // }

        // const musicHowl:Howl = musicTable[track].asset;
        // musicHowl.play();
        // this.currentPlayingMusic = musicHowl;

        const isSoundOn = OptionsManager.getInstance().getSoundOn();
        if(!isSoundOn) {
            return;
        }

        const musicVolume = OptionsManager.getInstance().getMusicVolume();
        const musicHowl = this.soundLoader.createMusicHowl(track, musicVolume);

        this.currentPlayingMusic = musicHowl;

        musicHowl.play();        
    }

    // playMusicDelayedLoop(track: Track, delay: number = 0) {
    //     const isSoundOn = OptionsManager.getInstance().getSoundOn();
    //     if(!isSoundOn) {
    //         return;
    //     }
    //     const musicHowl:Howl = musicTable[track].asset;
    //     musicHowl.play();
    //     this.currentPlayingMusic = musicHowl;

    //     musicHowl.on('end', () => {
    //         this.timeoutId = setTimeout(() => {
    //             musicHowl.play();
    //         }, delay);
    //     });
    // }

    // playMusicSimpleLoop(track: Track) {
    //     const isSoundOn = OptionsManager.getInstance().getSoundOn();
    //     if(!isSoundOn) {
    //         return;
    //     }
    //     const musicHowl:Howl = musicTable[track].asset;
    //     musicHowl.loop(true);
    //     musicHowl.play();
    //     this.currentPlayingMusic = musicHowl;
    // }

    // playDefinedLoop(howl: Howl, start: number = 0, end: number = 0) {
        
    // }

    stopMusic() {
        if(this.currentPlayingMusic) {
            this.currentPlayingMusic.stop();
            this.currentPlayingMusic.unload();
            this.currentPlayingMusic = null;
        }
    }

    updateSFXVolume(volume: number) {
        for(const [sound, soundAsset] of Object.entries(soundTable)) {
            const soundHowl:Howl = soundAsset.asset;
            soundHowl.volume(volume * soundAsset.standardVolume);
        }
    }

    updateMusicVolume(volume: number) {
        // for(const [music, musicAsset] of Object.entries(musicTable)) {
        //     const musicHowl:Howl = musicAsset.asset;
        //     musicHowl.volume(volume);
        // }

        if(this.currentPlayingMusic) {
            this.currentPlayingMusic.volume(volume);
        }
    }

    getCurrentPlayingMusic() {
        return this.currentPlayingMusic;
    }
}