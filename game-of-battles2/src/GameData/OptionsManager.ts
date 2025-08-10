export interface GameOptions {
   soundOn: boolean;
   showGridBars: boolean;
   disableBattleComments: boolean;
   disablePostBattleComments: boolean;
   sfxVolume: number;
   musicVolume: number;
} 

const GAME_PREFIX = 'dieForMe';

const LOCAL_STORAGE_KEYS = {
    soundOn: `${GAME_PREFIX}_soundOn`,
    showGridBars: `${GAME_PREFIX}_showGridBars`,
    disableBattleComments: `${GAME_PREFIX}_disableBattleComments`,
    disablePostBattleComments: `${GAME_PREFIX}_disablePostBattleComments`,
    sfxVolume: `${GAME_PREFIX}_sfxVolume`,
    musicVolume: `${GAME_PREFIX}_musicVolume`
}

export class OptionsManager {

    private static instance: OptionsManager;
    private options: GameOptions;

    private constructor() {
        // Initialize with defaults, then try to load from localStorage
        this.options = {
            soundOn: false,
            showGridBars: false,
            disableBattleComments: false,
            disablePostBattleComments: false,
            sfxVolume: 0.7,
            musicVolume: 0.7
        };

        // Load any saved values from localStorage
        const savedSoundOn = localStorage.getItem(LOCAL_STORAGE_KEYS.soundOn);
        if (savedSoundOn !== null) this.options.soundOn = savedSoundOn === 'true';

        const savedShowGridBars = localStorage.getItem(LOCAL_STORAGE_KEYS.showGridBars);
        if (savedShowGridBars !== null) this.options.showGridBars = savedShowGridBars === 'true';

        const savedDisableBattleComments = localStorage.getItem(LOCAL_STORAGE_KEYS.disableBattleComments);
        if (savedDisableBattleComments !== null) this.options.disableBattleComments = savedDisableBattleComments === 'true';

        const savedDisablePostBattleComments = localStorage.getItem(LOCAL_STORAGE_KEYS.disablePostBattleComments);
        if (savedDisablePostBattleComments !== null) this.options.disablePostBattleComments = savedDisablePostBattleComments === 'true';

        const savedSFXVolume = localStorage.getItem(LOCAL_STORAGE_KEYS.sfxVolume);
        if (savedSFXVolume !== null) this.options.sfxVolume = parseFloat(savedSFXVolume);

        const savedMusicVolume = localStorage.getItem(LOCAL_STORAGE_KEYS.musicVolume);
        if (savedMusicVolume !== null) this.options.musicVolume = parseFloat(savedMusicVolume);
    }

    public static getInstance(): OptionsManager {
        if (!OptionsManager.instance) {
            OptionsManager.instance = new OptionsManager();
        }
        return OptionsManager.instance;
    }

    // Getters
    public getSoundOn(): boolean {
        return this.options.soundOn;
    }

    public getShowGridBars(): boolean {
        return this.options.showGridBars;
    }

    public getDisableBattleComments(): boolean {
        return this.options.disableBattleComments;
    }

    public getDisablePostBattleComments(): boolean {
        return this.options.disablePostBattleComments;
    }

    public getSFXVolume(): number {
        return this.options.sfxVolume;
    }

    public getMusicVolume(): number {
        return this.options.musicVolume;
    }
    // Setters
    public setSoundOn(value: boolean): void {
        this.options.soundOn = value;
        localStorage.setItem(LOCAL_STORAGE_KEYS.soundOn, value.toString());
    }

    public setShowGridBars(value: boolean): void {
        this.options.showGridBars = value;
        localStorage.setItem(LOCAL_STORAGE_KEYS.showGridBars, value.toString());
    }

    public setDisableBattleComments(value: boolean): void {
        this.options.disableBattleComments = value;
        localStorage.setItem(LOCAL_STORAGE_KEYS.disableBattleComments, value.toString());
    }

    public setDisablePostBattleComments(value: boolean): void {
        this.options.disablePostBattleComments = value;
        localStorage.setItem(LOCAL_STORAGE_KEYS.disablePostBattleComments, value.toString());
    }

    public setSFXVolume(value: number): void {
        this.options.sfxVolume = value;
        localStorage.setItem(LOCAL_STORAGE_KEYS.sfxVolume, value.toString());
    }

    public setMusicVolume(value: number): void {
        this.options.musicVolume = value;
        localStorage.setItem(LOCAL_STORAGE_KEYS.musicVolume, value.toString());
    }
}

export default OptionsManager;