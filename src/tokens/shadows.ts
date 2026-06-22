export const shadows = {
  'medium': {
    var: '--shadow-medium',
    value: '0px 0px 24px 0px #00000040',
    description: 'Navigation bar',
  },
  'subtle': {
    var: '--shadow-subtle',
    value: '0px 2px 8px 0px #00000026',
    description: 'Side navigation / desktop',
  },
  'subtlest': {
    var: '--shadow-subtlest',
    value: '0px 0px 10px 0px #00000008',
    description: 'Cards',
  },
} as const

export type Shadows = typeof shadows
