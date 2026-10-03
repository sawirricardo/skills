export type CacheMark = { at: number; model: string }

declare module 'claude-code' {
  interface PluginState {
    'cache-timer': { last: CacheMark | null; warned: boolean }
  }
}
