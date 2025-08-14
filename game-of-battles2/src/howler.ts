declare module 'howler' {
    export class Howl {
      constructor(options: any); // Very basic type - improve if needed
      play(): number;
      pause(): void;
      stop(): void;
      volume(volume: number): void;
      playing(): boolean;
      loop(loop: boolean): void;
      on(event: string, callback: () => void): void;
      // Add other methods you use
    }
  }