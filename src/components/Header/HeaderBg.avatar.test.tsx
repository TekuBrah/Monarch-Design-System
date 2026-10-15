import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { axe } from 'jest-axe'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { HeaderBg } from './HeaderBg'
import type { HeaderBgProps, HeaderBgVariant } from './HeaderBg'
import { Avatar } from '../Avatar'
import { readGlobals, environment, resolveToken } from '../../test/tokenCss'

/* Gate 86 (v2.9.0) — the avatar tap hook: `onAvatarClick` + `avatarAriaLabel`.

   WHY THE STATES ARE READ FROM THE STYLESHEET, NOT THE DOM. `vitest.config.ts`
   sets no `test.css`, so no stylesheet is applied in jsdom: `:active`,
   `:hover` and `:focus-visible` never match and every rect is zero. A
   computed-style test would pass against anything. The rules are therefore
   read out of HeaderBg.css and their tokens resolved through globals.css.
   The hit area is arithmetic over those same declarations. */

// ── The no-handler baseline cases ───────────────────────────────────────────
// Every prop combination HeaderBg.test.tsx and the showcase's Header section
// render, plus a matrix over the props that reach the avatar row (avatar
// source × variant) and every other optional prop. None passes onAvatarClick.
const TEST_BG = <div data-testid="bg" />
const SHOWCASE_BG = (
  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, #1a1f6e 0%, #2a4dbd 40%, #4f7fe0 70%, #cfa64a 100%)' }} />
)
const VARIANT_LIST: HeaderBgVariant[] = ['default', 'noSearchBar', 'compact']
const AVATARS = {
  none: {},
  name: { avatarName: 'Margaret Tan' },
  photo: { avatarSrc: '/margaret.jpg', avatarName: 'Margaret Tan' },
  photoNoName: { avatarSrc: '/margaret.jpg' },
} as const
const noop = () => {}

const BASELINE_CASES: [string, HeaderBgProps][] = [
  ['test: no variant', { background: TEST_BG }],
  ...VARIANT_LIST.map((v): [string, HeaderBgProps] => [`test: ${v}`, { background: TEST_BG, variant: v }]),
  ['showcase: default', { variant: 'default', background: SHOWCASE_BG }],
  ['showcase: noSearchBar', { variant: 'noSearchBar', background: SHOWCASE_BG }],
  ['showcase: compact', { variant: 'compact', title: 'Finance', background: SHOWCASE_BG }],
  ...VARIANT_LIST.flatMap(v =>
    (Object.keys(AVATARS) as (keyof typeof AVATARS)[]).map((a): [string, HeaderBgProps] => [
      `matrix: ${v} / avatar ${a}`,
      { background: TEST_BG, variant: v, ...AVATARS[a] },
    ]),
  ),
  ...VARIANT_LIST.map((v): [string, HeaderBgProps] => [
    `matrix: ${v} / every other prop`,
    {
      background: TEST_BG,
      variant: v,
      greeting: 'Hello',
      title: 'Plans',
      statusBarTime: '10:41',
      searchValue: 'rent',
      onSearchChange: noop,
      hasNotification: false,
      onNotificationsClick: noop,
      className: 'consumer-class',
      ...AVATARS.photo,
    },
  ]),
]

/** sha256 of `renderToStaticMarkup` for each case, captured from the
 *  UNEDITED v2.8.0 component (HEAD b5b7b29) before the first edit of Gate 86.
 *  The full strings are kept outside the repo, in the gate's hand-over. */
const V2_8_0_MARKUP_SHA256: Record<string, string> = {
  'test: no variant': '12962a2ce9e00f4df05dca2d46e41d0c275e4b6e6015fde079fa41f0462c4a8b',
  'test: default': '12962a2ce9e00f4df05dca2d46e41d0c275e4b6e6015fde079fa41f0462c4a8b',
  'test: noSearchBar': 'dccc8d81a73bedef7313bb6fff181a291d57d2db9515559fc0dc78d2a3e9a7f1',
  'test: compact': '61fe681061952fd7b8a5d9fcb66705db0321c8e22efa8d3127371f78ea700520',
  'showcase: default': '0914658d7984ec729761ec7375a8a429b086ed81b9811c4d8db29ac6e0537b07',
  'showcase: noSearchBar': '3b9ff76a5462d4232115e14926faec92981ed8ad2b18e6543c8890746ee268ee',
  'showcase: compact': 'f39e59552aefbe73fd783f8b0ef30fa86675a3b8eeb9d07ff9395c54d5162344',
  'matrix: default / avatar none': '12962a2ce9e00f4df05dca2d46e41d0c275e4b6e6015fde079fa41f0462c4a8b',
  'matrix: default / avatar name': 'b83d053baf5f22c5c5e06f6dff336ac0375587f2ce0387404c20230d79bab164',
  'matrix: default / avatar photo': '40153e47b6a714518b419490fa70c8280923e0472edf2585347d9f991064d849',
  'matrix: default / avatar photoNoName': 'b56076c622ffcd08a21a929b94a96eae0fa0ae46754e8b3d84732de6457b5b4a',
  'matrix: noSearchBar / avatar none': 'dccc8d81a73bedef7313bb6fff181a291d57d2db9515559fc0dc78d2a3e9a7f1',
  'matrix: noSearchBar / avatar name': 'd5f084193e68d20d97019ec2fdf51e96540a21327beaf632f2b3fcd55dbeded8',
  'matrix: noSearchBar / avatar photo': 'd8155a6670d0a9990c06068df5c80a0469eb8cd65ba3e8eac7f75d649d2d390b',
  'matrix: noSearchBar / avatar photoNoName': 'ca09417e8c888f73a2a57648a706c42a03ecb8b11fac28cfccb8d90ec582be0a',
  'matrix: compact / avatar none': '61fe681061952fd7b8a5d9fcb66705db0321c8e22efa8d3127371f78ea700520',
  'matrix: compact / avatar name': '41624dfbf1a68d1593c8e6e181b7d691d5ba4a13f85212efe0b277d84f4b6ff9',
  'matrix: compact / avatar photo': '0e9355a476e3eeebd278694a8ad0d688a08b1f7996f23dbe8e22e522464c007c',
  'matrix: compact / avatar photoNoName': 'fbe31887d42a058aec0e0932a5d11677f4d82b1af92cdd65e9000553f10810ca',
  'matrix: default / every other prop': '97c39ce57deff287eb6b580026f5517896b7a93d73ed1cced416c8d882a014a6',
  'matrix: noSearchBar / every other prop': '32db0dec8287326caf0f7b3a1d6c219eb42487456456934a91bd88e9056426ac',
  'matrix: compact / every other prop': '1f63121f321d2905ee9f6d922a9538c330577826a17ab40e607c180075ad0bf7',
}

const sha = (html: string) => createHash('sha256').update(html).digest('hex')

const LABEL = 'Open settings'

// ── Stylesheet scan ─────────────────────────────────────────────────────────
// A brace-depth scan that records each rule's enclosing at-rules. HeaderBg.css
// holds one `@media (hover: hover)` block, so a flat scan would misread it.
type Rule = { selectors: string[]; context: string[]; decls: Map<string, string> }

const CSS = readFileSync(
  resolve(process.cwd(), 'src/components/Header/HeaderBg.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '')

function scan(css: string): Rule[] {
  const rules: Rule[] = []
  const context: string[] = []
  let from = 0
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') {
      const head = css.slice(from, i).trim()
      if (head.startsWith('@')) {
        context.push(head)
        from = i + 1
        continue
      }
      const close = css.indexOf('}', i)
      const decls = new Map<string, string>()
      for (const part of css.slice(i + 1, close).split(';')) {
        const c = part.indexOf(':')
        if (c < 0) continue
        decls.set(part.slice(0, c).trim(), part.slice(c + 1).trim())
      }
      rules.push({ selectors: head.split(',').map(s => s.trim()), context: [...context], decls })
      i = close
      from = close + 1
    } else if (css[i] === '}') {
      context.pop()
      from = i + 1
    }
  }
  return rules
}

const RULES = scan(CSS)
const rulesFor = (selector: string) => RULES.filter(r => r.selectors.includes(selector))
const only = (selector: string) => {
  const found = rulesFor(selector)
  if (found.length !== 1) throw new Error(`expected one rule for ${selector}, found ${found.length}`)
  return found[0]
}

const GLOBALS = readGlobals()
const LIGHT = environment(GLOBALS, 'light')
const DARK = environment(GLOBALS, 'dark')
const tokenOf = (value: string | undefined) => value?.match(/var\((--[a-z0-9-]+)\)/i)?.[1]

describe('HeaderBg avatar tap hook (v2.9.0)', () => {
  describe('no handler: v2.8.0 markup, byte for byte', () => {
    it('has a recorded v2.8.0 hash for exactly the cases rendered here', () => {
      expect(BASELINE_CASES.map(([name]) => name).sort()).toEqual(Object.keys(V2_8_0_MARKUP_SHA256).sort())
    })

    it.each(BASELINE_CASES)('renders %s exactly as v2.8.0 did', (name, props) => {
      expect(sha(renderToStaticMarkup(<HeaderBg {...props} />))).toBe(V2_8_0_MARKUP_SHA256[name])
    })

    it('renders no avatar button in any baseline case', () => {
      for (const [, props] of BASELINE_CASES) {
        const { container, unmount } = render(<HeaderBg {...props} />)
        expect(container.querySelector('.mn-header-bg__avatar')).toBeNull()
        expect(container.querySelectorAll('button')).toHaveLength(1) // Notifications only
        unmount()
      }
    })
  })

  describe('with a handler', () => {
    it.each(VARIANT_LIST)('wraps the avatar in a native button in the %s variant', variant => {
      const { container } = render(
        <HeaderBg background={TEST_BG} variant={variant} onAvatarClick={noop} avatarAriaLabel={LABEL} {...AVATARS.photo} />,
      )
      const button = container.querySelector('.mn-header-bg__avatar')
      expect(button).toBeInstanceOf(HTMLButtonElement)
      expect(button).toHaveAttribute('type', 'button')
      expect(button?.querySelector('.mn-avatar')).not.toBeNull()
    })

    it.each(VARIANT_LIST)('adds the button and alt="" in the %s variant, and changes nothing else', variant => {
      const props = { background: TEST_BG, variant, ...AVATARS.photo }
      // React hoists a preload <link> to the front of any root that renders an
      // <img src>, so a standalone Avatar render starts with one. Strip exactly
      // that prefix, asserted present, to get the Avatar's own markup.
      const PRELOAD = `<link rel="preload" as="image" href="${AVATARS.photo.avatarSrc}"/>`
      const avatarOnly = (html: string) => {
        expect(html.startsWith(PRELOAD)).toBe(true)
        return html.slice(PRELOAD.length)
      }
      const bare = avatarOnly(
        renderToStaticMarkup(<Avatar size="m" src={AVATARS.photo.avatarSrc} name={AVATARS.photo.avatarName} />),
      )
      const decorative = avatarOnly(
        renderToStaticMarkup(<Avatar size="m" src={AVATARS.photo.avatarSrc} name={AVATARS.photo.avatarName} alt="" />),
      )
      const without = renderToStaticMarkup(<HeaderBg {...props} />)
      expect(without.indexOf(bare)).toBeGreaterThan(-1)
      expect(without.indexOf(bare)).toBe(without.lastIndexOf(bare))
      const expected = without.replace(
        bare,
        () => `<button type="button" class="mn-header-bg__avatar" aria-label="${LABEL}">${decorative}</button>`,
      )
      expect(renderToStaticMarkup(<HeaderBg {...props} onAvatarClick={noop} avatarAriaLabel={LABEL} />)).toBe(expected)
    })

    it('calls onAvatarClick once per click, and not from the notifications button', () => {
      const onAvatarClick = vi.fn()
      render(<HeaderBg background={TEST_BG} onAvatarClick={onAvatarClick} avatarAriaLabel={LABEL} />)
      fireEvent.click(screen.getByRole('button', { name: 'Notifications' }))
      expect(onAvatarClick).not.toHaveBeenCalled()
      fireEvent.click(screen.getByRole('button', { name: LABEL }))
      expect(onAvatarClick).toHaveBeenCalledTimes(1)
    })

    // jsdom does not synthesize a click from Enter or Space on a button: the
    // browser does, for a native, enabled, focusable <button>. That platform
    // behaviour is what this asserts the preconditions of. The keypress itself
    // was exercised in a real browser (CLAUDE.md, Gate 86).
    it('is a native, enabled, focusable button, so Enter and Space activate it', () => {
      render(<HeaderBg background={TEST_BG} onAvatarClick={noop} avatarAriaLabel={LABEL} />)
      const button = screen.getByRole('button', { name: LABEL })
      expect(button.tagName).toBe('BUTTON')
      expect(button).not.toHaveAttribute('role')
      expect(button).not.toHaveAttribute('tabindex')
      expect(button).toBeEnabled()
      button.focus()
      expect(button).toHaveFocus()
    })

    it.each(Object.keys(AVATARS) as (keyof typeof AVATARS)[])(
      'takes its accessible name from avatarAriaLabel alone (avatar %s)',
      avatar => {
        const { container } = render(
          <HeaderBg background={TEST_BG} onAvatarClick={noop} avatarAriaLabel={LABEL} {...AVATARS[avatar]} />,
        )
        expect(container.querySelector('.mn-header-bg__avatar')).toHaveAccessibleName(LABEL)
      },
    )

    it('renders the avatar photo as decorative inside the button', () => {
      const { container } = render(
        <HeaderBg background={TEST_BG} onAvatarClick={noop} avatarAriaLabel={LABEL} {...AVATARS.photo} />,
      )
      const imgs = container.querySelectorAll('.mn-header-bg__avatar img')
      expect(imgs).toHaveLength(1)
      expect(imgs[0]).toHaveAttribute('alt', '')
      expect(screen.queryByRole('img', { name: 'Margaret Tan' })).toBeNull()
    })

    it('has no axe violations in any variant', async () => {
      for (const variant of VARIANT_LIST) {
        const { container, unmount } = render(
          <HeaderBg background={TEST_BG} variant={variant} onAvatarClick={noop} avatarAriaLabel={LABEL} {...AVATARS.photo} />,
        )
        expect(await axe(container)).toHaveNoViolations()
        unmount()
      }
    })
  })

  // Compiled by `tsc -b` (tsconfig.app.json includes src): if either pairing
  // ever type-checks, the directive is unused and the typecheck fails.
  it('requires onAvatarClick and avatarAriaLabel together, at compile time', () => {
    // @ts-expect-error a handler with no accessible name
    const handlerOnly = <HeaderBg background={TEST_BG} onAvatarClick={noop} />
    // @ts-expect-error an accessible name with nothing to name
    const labelOnly = <HeaderBg background={TEST_BG} avatarAriaLabel={LABEL} />
    const both = <HeaderBg background={TEST_BG} onAvatarClick={noop} avatarAriaLabel={LABEL} />
    expect([handlerOnly, labelOnly, both]).toHaveLength(3)
  })

  describe('states (undesigned in Figma; reused DS treatments)', () => {
    it('focus-visible: the notify button\'s outline, declaration for declaration', () => {
      const avatar = only('.mn-header-bg__avatar:focus-visible')
      const notify = only('.mn-header-bg__notify:focus-visible')
      expect(avatar.context).toEqual([])
      expect(avatar.decls.get('outline')).toBe('var(--brand-scale-50) solid var(--mapped-border-primary-default)')
      expect(avatar.decls.get('outline')).toBe(notify.decls.get('outline'))
      expect(avatar.decls.get('outline-offset')).toBe(notify.decls.get('outline-offset'))
    })

    it('pressed: the overlay-pressed wash, ungated, theme-invariant', () => {
      const pressed = only('.mn-header-bg__avatar:active::before')
      expect(pressed.context).toEqual([])
      const token = tokenOf(pressed.decls.get('background'))
      expect(token).toBe('--mapped-surface-overlay-label-pressed')
      expect(resolveToken(token!, LIGHT)).toBe(resolveToken(token!, DARK))
    })

    it('hover: the overlay-hover wash, only behind @media (hover: hover), theme-invariant', () => {
      const hovers = RULES.filter(r => r.selectors.some(s => s.startsWith('.mn-header-bg__avatar') && s.includes(':hover')))
      expect(hovers).toHaveLength(1)
      expect(hovers[0].context).toEqual(['@media (hover: hover)'])
      const token = tokenOf(hovers[0].decls.get('background'))
      expect(token).toBe('--mapped-surface-overlay-hover')
      expect(resolveToken(token!, LIGHT)).toBe(resolveToken(token!, DARK))
      // Pressed must win while both match: equal specificity, so it must come later.
      const order = (sel: string) => RULES.findIndex(r => r.selectors.includes(sel))
      expect(order('.mn-header-bg__avatar:active::before')).toBeGreaterThan(order('.mn-header-bg__avatar:hover::before'))
    })

    it('leaves the resting avatar unpainted: the wash layer has no background at rest', () => {
      const wash = only('.mn-header-bg__avatar::before')
      expect(wash.decls.has('background')).toBe(false)
      expect(wash.decls.get('pointer-events')).toBe('none')
      expect(only('.mn-header-bg__avatar').decls.get('background')).toBe('none')
    })

    it('offers a hit area of at least 44px without entering the layout', () => {
      const button = only('.mn-header-bg__avatar')
      // THE WRAPPER RULE: a flex box, so the button is the avatar's own size.
      expect(button.decls.get('display')).toBe('flex')
      expect(button.decls.get('align-items')).toBe('center')
      expect(button.decls.get('padding')).toBe('0')
      expect(button.decls.get('position')).toBe('relative')

      const hit = only('.mn-header-bg__avatar::after')
      expect(hit.decls.get('position')).toBe('absolute')
      const inset = hit.decls.get('inset')?.match(/^calc\(-1 \* var\((--brand-scale-\d+)\)\)$/)
      expect(inset).not.toBeNull()
      const outset = parseFloat(resolveToken(inset![1], LIGHT))
      // HeaderBg renders <Avatar size="m">; its width is read from Avatar.css.
      const avatarCss = readFileSync(resolve(process.cwd(), 'src/components/Avatar/Avatar.css'), 'utf8')
      const m = scan(avatarCss.replace(/\/\*[\s\S]*?\*\//g, '')).find(r => r.selectors.includes('.mn-avatar--m'))
      const avatarSize = parseFloat(resolveToken(tokenOf(m?.decls.get('width'))!, LIGHT))
      expect(avatarSize).toBe(32)
      expect(avatarSize + 2 * outset).toBeGreaterThanOrEqual(44)
    })
  })
})
