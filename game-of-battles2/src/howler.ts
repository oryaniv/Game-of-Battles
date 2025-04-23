declare module 'howler' {
    export class Howl {
      constructor(options: any); // Very basic type - improve if needed
      play(): number;
      pause(): void;
      stop(): void;
      // Add other methods you use
    }
  }