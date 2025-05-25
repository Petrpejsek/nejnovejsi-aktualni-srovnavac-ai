declare module 'typed.js' {
  interface TypedOptions {
    strings?: string[]
    typeSpeed?: number
    backSpeed?: number
    backDelay?: number
    startDelay?: number
    loop?: boolean
    showCursor?: boolean
    cursorChar?: string
    attr?: string
  }

  export default class Typed {
    constructor(element: HTMLElement | string, options: TypedOptions)
    destroy(): void
  }
} 