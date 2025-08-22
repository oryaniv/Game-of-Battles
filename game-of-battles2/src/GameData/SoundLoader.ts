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
    standardVolume: number;
}

export interface MusicAsset {
    name: Track;
    asset: Howl;
}

const soundReferences: soundReference[] = [
    {name:SoundByte.Blight, path:require('.././sound/acid_splash_sound.mp3')},
    {name:SoundByte.CRUSH, path:require('.././sound/fist_sound.mp3')},
    {name:SoundByte.DARK, path:require('.././sound/dark_attack_sound_2.mp3')},
    {name:SoundByte.FIRE, path:require('.././sound/flame_sound_louder.mp3')},
    {name:SoundByte.HEALING, path:require('.././sound/healing_sound.mp3')},
    {name:SoundByte.HOLY, path:require('.././sound/holy_attack_sound.mp3')},
    {name:SoundByte.ICE, path:require('.././sound/Ice_sound.mp3')},
    {name:SoundByte.PIERCE, path:require('.././sound/pierce_attack_sound.mp3')},
    {name:SoundByte.SLASH, path:require('.././sound/sword_slash_sound.mp3')},
    {name:SoundByte.LIGHTNING, path:require('.././sound/thunder_sound.mp3')},
    {name:SoundByte.UNSTOPPABLE, path:require('.././sound/unstoppable_sound.mp3')},
    {name:SoundByte.BUFF, path:require('.././sound/buff_2.mp3')},
    {name:SoundByte.DEBUFF, path:require('.././sound/debuff_sound.mp3')},
    {name:SoundByte.HOLY_BUFF, path:require('.././sound/holy_buff.mp3')},
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
    {name:SoundByte.TELEPORTATION, path:require('.././sound/teleportation.mp3')},

    {name:SoundByte.FOREST_WALK1, path:require('.././sound/forest_walk1.mp3')},
    {name:SoundByte.FOREST_WALK2, path:require('.././sound/forest_walk2.mp3')},
    {name:SoundByte.FOREST_WALK3, path:require('.././sound/forest_walk3.mp3')},
    {name:SoundByte.CAVE_WALK1, path:require('.././sound/cave_walk1.mp3')},
    {name:SoundByte.CAVE_WALK2, path:require('.././sound/cave_walk2.mp3')},
    {name:SoundByte.CAVE_WALK3, path:require('.././sound/cave_walk3.mp3')},
    {name:SoundByte.STONE_WALK1, path:require('.././sound/stone_walk1.mp3')},
    {name:SoundByte.STONE_WALK2, path:require('.././sound/stone_walk2.mp3')},

    {name:SoundByte.DEFEAT_SOUND, path:require('.././sound/crash_2_out.mp3')},
    {name:SoundByte.VICTORY_SOUND, path:require('.././sound/cheer.mp3')},

    {name:SoundByte.CANCEL, path:require('.././sound/cancel_1_out_louder.mp3')},
    {name:SoundByte.ACTION_BUTTON_CLICK, path:require('.././sound/action_click_out.mp3')},
    {name:SoundByte.MENU_BUTTON_CLICK, path:require('.././sound/menu_click_3_fast.mp3')},
    {name:SoundByte.SKILL_SELECT, path:require('.././sound/choice_click.mp3')},
    {name:SoundByte.MENU_SCROLL, path:require('.././sound/scroll_4_out_louder.mp3')},
    // {name:SoundByte.MENU_SCROLL_MINOR, path:require('.././sound/scroll_1_out.mp3')},
    {name:SoundByte.PROMPT, path:require('.././sound/prompt.mp3')},
    {name:SoundByte.CHECKBOX_CHECK, path:require('.././sound/menu_click_1_fast.mp3')},
    {name:SoundByte.TOWER_TRAVERSAL, path:require('.././sound/tower_traversal.mp3')},
    {name:SoundByte.TOWER_ASCEND, path:require('.././sound/tower_ascend_out.mp3')},

    {name:SoundByte.DEFENDER_SELECT, path:require('.././sound/defender_louder.mp3')},
    {name:SoundByte.CHAMPION_SELECT, path:require('.././sound/champion_louder.mp3')},
    {name:SoundByte.HUNTER_SELECT, path:require('.././sound/hunter.mp3')},
    {name:SoundByte.VANGUARD_SELECT, path:require('.././sound/vanguard_louder.mp3')},
    {name:SoundByte.WIZARD_SELECT, path:require('.././sound/wizard_louder.mp3')},
    {name:SoundByte.ARTIFICER_SELECT, path:require('.././sound/artificer.mp3')},
    {name:SoundByte.WITCH_SELECT, path:require('.././sound/witch_louder.mp3')},
    {name:SoundByte.PIKEMAN_SELECT, path:require('.././sound/pikeman_louder.mp3')},
    {name:SoundByte.FIST_WEAVER_SELECT, path:require('.././sound/fistweaver_louder.mp3')},
    {name:SoundByte.HEALER_SELECT, path:require('.././sound/healer_louder.mp3')},
    {name:SoundByte.ROGUE_SELECT, path:require('.././sound/rogue_louder.mp3')},
    {name:SoundByte.WELCOME_TO_DIE_FOR_ME, path:require('.././sound/welcome.mp3')},
    {name:SoundByte.CHOOSE_YOUR_JOURNEY, path:require('.././sound/choose_journey.mp3')},
]

const musicReferences: musicReference[] = [
    {name:Track.MAIN_MENU, path:require('.././music/main_menu.mp3')},
    {name:Track.BUILD_TEAM, path:require('.././music/build_team_full.mp3')},
    {name:Track.JOURNEY, path:require('.././music/journey.mp3')},
    {name:Track.TUTORIAL_FIGHT_THEME, path:require('.././music/tutorial.mp3')},
    {name:Track.EASY_FIGHT_THEME, path:require('.././music/easy_combat.mp3')},
    {name:Track.MEDIUM_FIGHT_THEME, path:require('.././music/normal_combat.mp3')},
    {name:Track.HARD_FIGHT_THEME, path:require('.././music/hard_combat.mp3')},
    {name:Track.BOSS_FIGHT_THEME, path:require('.././music/boss_combat.mp3')},
    {name:Track.GAME_OVER, path:require('.././music/game_over.mp3')},
    {name:Track.VICTORY, path:require('.././music/victory.mp3')},
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
                html5: false,
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
                html5: true,
            });
            musicTable[musicName] = musicAsset;
        }
    }

    public createMusicHowl(track: Track, musicVolume: number) {
        const musicPath:string | undefined = musicReferences.find(musicReference => musicReference.name === track)?.path;
        if(!musicPath) {
            throw new Error(`Music path not found for ${track}`);
        }

        return new Howl({
            src: [musicPath],
            preload: true,
            volume: musicVolume,
            html5: false,
            loop: true,
        });
    }
}