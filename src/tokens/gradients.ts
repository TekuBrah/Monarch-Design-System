export const gradients = {
  'subtle': {
    var: '--gradient-subtle',
    value: 'linear-gradient(0deg, #ffffff 0%, #ffffff00 100%)',
    description: 'Nav/mobile/section',
  },
  'default': {
    var: '--gradient-default',
    value: 'linear-gradient(0deg, #ffffff 10%, #ffffff80 100%)',
    description: 'For footer, during list of selections',
  },
} as const

export type Gradients = typeof gradients
