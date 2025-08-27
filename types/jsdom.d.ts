// Minimal ambient declaration to satisfy TypeScript in production builds
// This does not affect runtime; jsdom is used only in Node contexts.
declare module 'jsdom' {
  export class JSDOM {
    constructor(html?: string, options?: any)
    window: any
  }
}


