import { Howl } from "howler";


export enum SoundType {
    DAMAGE,
    EFFECT,
    MOVE,
    CLICK,
    OST,
    MISC,
}

const damageSounds = [
    {name:'Blight', path:require('./sound/acid_splash_sound.mp3')},
    {name:'Crush', path:require('./sound/fist_sound.mp3')},
    {name:'Dark', path:require('./sound/dark_attack_sound.mp3')},
    {name:'Fire', path:require('./sound/flame_sound.mp3')},
    {name:'Healing', path:require('./sound/healing_sound.mp3')},
    {name:'Holy', path:require('./sound/holy_attack_sound.mp3')},
    {name:'Ice', path:require('./sound/Ice_sound.mp3')},
    {name:'Pierce', path:require('./sound/pierce_attack_sound.mp3')},
    {name:'Slash', path:require('./sound/sword_slash_sound.mp3')},
    {name:'Lightning', path:require('./sound/thunder_sound.mp3')},
  ];

const effectSounds = [
    {name: 'Buff', path: require('./sound/buff_sound.mp3')},
]

const moveSounds = [
    {name: 'Move', path: require('./sound/move_sound_1.mp3')},
]

const clickSounds = [
    {name: 'Click', path: require('./sound/click_sound.mp3')},
]

const ostSounds = [
    {name: 'OST', path: require('./sound/OST.mp3')},
]

const miscSounds = [
    {name: 'Fool Laugh', path: require('./sound/fool_laugh.mp3')},
]


export class SoundManager {
    private static instance: SoundManager;

    private constructor() {

    }

    public static getInstance() {
        if(!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    public preloadSounds() {
    }

    private getSound(soundType: SoundType, soundName: string) {
        switch(soundType) {
            case SoundType.DAMAGE:
                return damageSounds;
            case SoundType.EFFECT:
                return effectSounds;
            case SoundType.MOVE:
                return moveSounds;
            case SoundType.CLICK:
                return clickSounds;
            case SoundType.OST:
                return ostSounds;
            case SoundType.MISC:
                return miscSounds;
        }
    }


}