export type Theme = 'light' | 'dark'
export type Density = 'compact' | 'default' | 'comfortable'
export type ReplyBehavior = 'reply' | 'replyAll'

export interface Settings {
  theme: Theme
  density: Density
  defaultReplyBehavior: ReplyBehavior
}
