export const gradients = {
  'subtle': {
    kind: 'scrim',
    var: '--gradient-subtle',
    value: 'linear-gradient(0deg, #ffffff 0%, #ffffff00 100%)',
    mappedVar: '--mapped-gradient-subtle',
    mappedValue: 'linear-gradient(0deg, var(--gradient-surface) 0%, transparent 100%)',
    description: 'Nav/mobile/section',
  },
  'default': {
    kind: 'scrim',
    var: '--gradient-default',
    value: 'linear-gradient(0deg, #ffffff 10%, #ffffff80 100%)',
    mappedVar: '--mapped-gradient-default',
    mappedValue: 'linear-gradient(0deg, var(--gradient-surface) 10%, color-mix(in srgb, var(--gradient-surface) 50%, transparent) 100%)',
    description: 'For footer, during list of selections',
  },
  'primary-default': {
    kind: 'brand',
    stopsVar: '--mapped-gradient-primary-stops',
    stopsValue: 'var(--mapped-surface-primary-default) 0%, var(--mapped-surface-information-default) 100%',
    description: 'Brand band — primary to information',
  },
} as const

export type Gradients = typeof gradients
