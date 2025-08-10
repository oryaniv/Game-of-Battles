import { SoundByte, Track } from "./SoundLibrary";
import { Howl } from "howler";

export interface soundReference {
    name: SoundByte;
    path: string;
}

export interface musicReference {
    name: Track;
    path: string;
}

export interface SoundAsset {
    name: SoundByte;
    asset: Howl;
}

export interface MusicAsset {
    name: Track;
    asset: Howl;
}

const soundReferences: soundReference[] = [
    {name:SoundByte.Blight, path:require('.././sound/acid_splash_sound.mp3')},
    {name:SoundByte.CRUSH, path:require('.././sound/fist_sound.mp3')},
    {name:SoundByte.DARK, path:require('.././sound/dark_attack_sound.mp3')},
    {name:SoundByte.FIRE, path:require('.././sound/flame_sound.mp3')},
    {name:SoundByte.HEALING, path:require('.././sound/healing_sound.mp3')},
    {name:SoundByte.HOLY, path:require('.././sound/holy_attack_sound.mp3')},
    {name:SoundByte.ICE, path:require('.././sound/Ice_sound.mp3')},
    {name:SoundByte.PIERCE, path:require('.././sound/pierce_attack_sound.mp3')},
    {name:SoundByte.SLASH, path:require('.././sound/sword_slash_sound.mp3')},
    {name:SoundByte.LIGHTNING, path:require('.././sound/thunder_sound.mp3')},
    {name:SoundByte.BUFF, path:require('.././sound/buff.mp3')},
    {name:SoundByte.DEBUFF, path:require('.././sound/debuff.mp3')},
    {name:SoundByte.TURN_START, path:require('.././sound/sword_clash.mp3')},
    {name:SoundByte.FOOL_LAUGH, path:require('.././sound/fool_laugh_1.25.mp3')},
    {name:SoundByte.FOOL_LAUGH_FASTER, path:require('.././sound/fool_laugh_1.50.mp3')},
    {name:SoundByte.EVIL_LAUGH, path:require('.././sound/evil_laugh_1.50.mp3')},
    {name:SoundByte.SEDUCE, path:require('.././sound/mmm_sound_0.75.wav')},
    {name:SoundByte.ARMOR, path:require('.././sound/armor_sound.mp3')},
    {name:SoundByte.SMITH, path:require('.././sound/smith.mp3')},
    {name:SoundByte.COUGH, path:require('.././sound/cough.mp3')},
    {name:SoundByte.SCREAM, path:require('.././sound/scream.mp3')},
    {name:SoundByte.SNORING, path:require('.././sound/snoring.mp3')},
    {name:SoundByte.MISS, path:require('.././sound/miss_2.mp3')},
    {name:SoundByte.AIM, path:require('.././sound/aim.mp3')},
    {name:SoundByte.SHADOW_STEP, path:require('.././sound/shadow_step.mp3')},
    {name:SoundByte.RAGE, path:require('.././sound/rage.mp3')},
    {name:SoundByte.WRITING, path:require('.././sound/save.mp3')},
    {name:SoundByte.ARCANE, path:require('.././sound/arcane.mp3')},

    {name:SoundByte.FOREST_WALK1, path:require('.././sound/forest_walk1.mp3')},
    {name:SoundByte.FOREST_WALK2, path:require('.././sound/forest_walk2.mp3')},
    {name:SoundByte.FOREST_WALK3, path:require('.././sound/forest_walk3.mp3')},
    {name:SoundByte.CAVE_WALK1, path:require('.././sound/cave_walk1.mp3')},
    {name:SoundByte.CAVE_WALK2, path:require('.././sound/cave_walk2.mp3')},
    {name:SoundByte.CAVE_WALK3, path:require('.././sound/cave_walk3.mp3')},
    {name:SoundByte.STONE_WALK1, path:require('.././sound/stone_walk1.mp3')},
    {name:SoundByte.STONE_WALK2, path:require('.././sound/stone_walk2.mp3')},

    {name:SoundByte.DEFEAT_SOUND, path:require('.././sound/crash_2.mp3')},

    {name:SoundByte.CANCEL, path:require('.././sound/cancel_1.mp3')},
    {name:SoundByte.ACTION_BUTTON_CLICK, path:require('.././sound/action_click.mp3')},
    {name:SoundByte.MENU_BUTTON_CLICK, path:require('.././sound/menu_click_3.mp3')},
]

const musicReferences: musicReference[] = [
    {name:Track.MAIN_MENU, path:require('.././music/main_menu.mp3')},
];


export class SoundLoader {
    constructor() {

    }

    public loadSounds(soundTable: { [key in SoundByte]: SoundAsset }, sfxVolume: number) {
        for(const [sound, soundAsset] of Object.entries(soundTable)) {
            const soundName:SoundByte = soundAsset.name;
            const soundPath:string | undefined = soundReferences.find(soundReference => soundReference.name === soundName)?.path;
            if(!soundPath) {
                throw new Error(`Sound path not found for ${soundName}`);
            }
            soundAsset.asset = new Howl({
                src: [soundPath],
                preload: true,
                volume: sfxVolume,
                onload: () => {
                    console.log(`${soundName} sound preloaded Boomboy!`);
                }
            });
            soundTable[soundName] = soundAsset;
        }
    }

    public loadMusic(musicTable: { [key in Track]: MusicAsset }, musicVolume: number) {
        for(const [music, musicAsset] of Object.entries(musicTable)) {
            const musicName:Track = musicAsset.name;
            const musicPath:string | undefined = musicReferences.find(musicReference => musicReference.name === musicName)?.path;
            if(!musicPath) {
                throw new Error(`Music path not found for ${musicName}`);
            }
            musicAsset.asset = new Howl({
                src: [musicPath],
                preload: true,
                volume: musicVolume,
            });
            musicTable[musicName] = musicAsset;
        }
    }
}