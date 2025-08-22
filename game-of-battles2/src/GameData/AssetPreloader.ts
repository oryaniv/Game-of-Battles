// let mainMenuLoaded = false;
// let logoScreenLoaded = false;
// let introLoaded = false;
// let buildTeamLoaded = false;
// let journeyLoaded = false;
// let matchLoaded = false;

import { Howl } from "howler";
import { screenAssets } from "./AssetManifest";

interface AssetMap {
    images?: string[];
    svgs?: string[];
    audio?: string[];
}


export class AssetPreloader {
  private static instance: AssetPreloader;
  private loadedAssets: Set<string> = new Set();
  private loadedFonts: Set<string> = new Set();

  private constructor() {
  }

  public static getInstance(): AssetPreloader {
    if (!AssetPreloader.instance) {
      AssetPreloader.instance = new AssetPreloader();
    }
    return AssetPreloader.instance;
  }

   /**
   * Loads a single image and returns a Promise.
   * @param url The URL of the image.
   */
   private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedAssets.has(url)) {
        console.log(`Asset already loaded (image): ${url}`);
        resolve();
        return;
      }
      const img = new Image();
      img.src = url;
      // img.src = require(`@/assets/Logo/FCOH_without_50mt.png`);
      img.onload = () => {
        this.loadedAssets.add(url);
        console.log(`Loaded image: ${url}`);
        resolve();
      };
      img.onerror = (e) => {
        // eslint-disable-next-line
        debugger;  
        console.error(`Failed to load image: ${url}`, e);
        reject(new Error(`Failed to load image: ${url}`));
      };
    });
  }

  /**
   * Loads a single SVG (treated like an image for simplicity here) and returns a Promise.
   * For more complex SVG handling (e.g., embedding in DOM directly), you might use fetch.
   * @param url The URL of the SVG.
   */
  private preloadSvg(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedAssets.has(url)) {
        console.log(`Asset already loaded (SVG): ${url}`);
        resolve();
        return;
      }
      // For SVGs, using Image object is simplest if you just need to cache it.
      // If you need to manipulate its DOM, you'd use fetch().
      const svg = new Image();
      svg.src = url;
      svg.onload = () => {
        this.loadedAssets.add(url);
        console.log(`Loaded SVG: ${url}`);
        resolve();
      };
      svg.onerror = (e) => {
        console.error(`Failed to load SVG: ${url}`, e);
        reject(new Error(`Failed to load SVG: ${url}`));
      };
    });
  }

  private preloadFont(family: string, url: string, descriptors?: FontFaceDescriptors): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedFonts.has(family)) {
        console.log(`Font already loaded: ${family}`);
        resolve();
        return;
      }

      // Check if FontFace API is supported
      if (!('FontFace' in window)) {
        console.warn('FontFace API not supported. Font preloading skipped.');
        this.loadedFonts.add(family); // Mark as loaded to avoid repeated warnings
        resolve();
        return;
      }

      const font = new FontFace(family, `url(${url})`, descriptors);
      font.load()
        .then(() => {
          document.fonts.add(font); // Add font to the document for use
          this.loadedFonts.add(family);
          console.log(`Loaded font: ${family} from ${url}`);
          resolve();
        })
        .catch((error) => {
          console.error(`Failed to load font: ${family} from ${url}`, error);
          reject(new Error(`Failed to load font: ${family}`));
        });
    });
  }

  private  preloadAudio(url: string): Promise<void> {
      return new Promise((resolve, reject) => {
        if (this.loadedAssets.has(url)) {
          console.log(`Asset already loaded (audio): ${url}`);
          resolve();
          return;
        }
        const sound = new Howl({
          src: [url],
          preload: true,
          onload: () => {
            this.loadedAssets.add(url);
            console.log(`Loaded audio: ${url}`);
            resolve();
          },
          onloaderror: (id: any, error: any) => {
            console.error(`Failed to load audio: ${url}`, error);
            reject(new Error(`Failed to load audio: ${url}`));
          }
        });
        // If the sound is already loaded (e.g., from a previous instance or direct play),
        // Howler.js might not trigger onload. Check its state.
        if (sound.state() === 'loaded') {
            this.loadedAssets.add(url);
            resolve();
        }
      });
    }

  public async preloadIntro(): Promise<void> {
    const assetsToLoad: Promise<void>[] = [];
    console.log("preloading intro");

    for (const svg of screenAssets.intro.svgs) {
      assetsToLoad.push(this.preloadSvg(svg));
    }

    try {
        await Promise.all(assetsToLoad);
        console.log("All Intro assets preloaded successfully!"); 
      } catch (error) {
        console.error("Failed to preload some Intro assets:", error);
        throw error;
    }
  }

  public async preloadLogoScreen(): Promise<void> {
    const assetsToLoad: Promise<void>[] = [];
    console.log("preloading logo screen");
    const imagesToLoad: string[] = screenAssets.logoScreen.images;
    for (const image of imagesToLoad) {
      assetsToLoad.push(this.preloadImage(image));
    } 

    try {
        await Promise.all(assetsToLoad);
        console.log("All Logo screen assets preloaded successfully!"); 
      } catch (error) {
        console.error("Failed to preload some Intro assets:", error);
        throw error;
      }
  }

  public async preloadMainMenu(): Promise<void> {
    const assetsToLoad: Promise<void>[] = [];
    console.log("preloading main menu");
    const imagesToLoad: string[] = screenAssets.mainMenu.images;
    for (const image of imagesToLoad) {
      assetsToLoad.push(this.preloadImage(image));
    } 

    for (const font of screenAssets.mainMenu.fonts) {
      assetsToLoad.push(this.preloadFont(font.family, font.url));
    }

    for (const audio of screenAssets.mainMenu.audio) {
      assetsToLoad.push(this.preloadAudio(audio));
    }


    try {
        await Promise.all(assetsToLoad);
        console.log("All Main menu assets preloaded successfully!"); 
      } catch (error) {
        console.error("Failed to preload some Main menu assets:", error);
        throw error;
    }
  }
  
  public async preloadBuildTeam(): Promise<void> {
    const assetsToLoad: Promise<void>[] = [];
    console.log("preloading build team");
    const imagesToLoad: string[] = screenAssets.buildTeam.images;
    for (const image of imagesToLoad) {
      assetsToLoad.push(this.preloadImage(image));
    } 

    for (const svg of screenAssets.buildTeam.svgs) {
      assetsToLoad.push(this.preloadSvg(svg));
    }

    for (const audio of screenAssets.buildTeam.audio) {
        assetsToLoad.push(this.preloadAudio(audio));
    }


    try {
        await Promise.all(assetsToLoad);
        console.log("All Build team assets preloaded successfully!"); 
      } catch (error) {
        console.error("Failed to preload some Build team assets:", error);
        throw error;
    }
  }

  public async preloadJourney(): Promise<void> {
    const assetsToLoad: Promise<void>[] = [];
    console.log("preloading journey");
    const imagesToLoad: string[] = screenAssets.journey.images;
    for (const image of imagesToLoad) {
      assetsToLoad.push(this.preloadImage(image));
    } 

    for (const audio of screenAssets.journey.audio) {
        assetsToLoad.push(this.preloadAudio(audio));
    }


    try {
        await Promise.all(assetsToLoad);
        console.log("All Journey assets preloaded successfully!"); 
      } catch (error) {
        console.error("Failed to preload some Journey assets:", error);
        throw error;
    }
  }

  public async preloadMatch(): Promise<void> {
    const assetsToLoad: Promise<void>[] = [];
    console.log("preloading match");
    const imagesToLoad: string[] = screenAssets.match.images;
    for (const image of imagesToLoad) {
      assetsToLoad.push(this.preloadImage(image));
    } 

    for (const svg of screenAssets.match.svgs) {
      assetsToLoad.push(this.preloadSvg(svg));
    }

    for (const audio of screenAssets.match.audio) {
        assetsToLoad.push(this.preloadAudio(audio));
    }

    try {
        await Promise.all(assetsToLoad);
        console.log("All Match assets preloaded successfully!"); 
      } catch (error) {
        console.error("Failed to preload some Match assets:", error);
        throw error;
    }
  }

  public async preloadPostMatch(): Promise<void> {
    const assetsToLoad: Promise<void>[] = [];
    console.log("preloading post match");

    for (const audio of screenAssets.postMatch.audio) {
        assetsToLoad.push(this.preloadAudio(audio));
    }

    try {
        await Promise.all(assetsToLoad);
        console.log("All Post Match assets preloaded successfully!"); 
      } catch (error) {
        console.error("Failed to preload some Post Match assets:", error);
        throw error;
    }
  }
}
