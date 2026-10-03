export type Frame = number | null

declare module 'claude-code' {
  interface PluginState {
    'spider-verse-crawler': { frame: Frame }
  }
}
