import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { axe } from 'jest-axe'
import { createHash } from 'node:crypto'
import type { ReactElement } from 'react'
import { HeaderDefault } from './HeaderDefault'
import { readComponentCss, declaration } from '../../test/componentCss'

/* Gate 97 (v2.13.0), G65 with Decision 32 = A — `titleAccent`.

   Flow 5's header reads "Send Ethereum", one text node with a range fill on
   "Ethereum". Figma's fill is a raw #627eea with no variable; Teku ruled it
   onto text/primary/default (`--mapped-text-primary-default`). The accent is
   a nested span inside the title span, after exactly one space. */

const CSS = readComponentCss('src/components/Header/HeaderDefault.css')
const sha = (html: string) => createHash('sha256').update(html).digest('hex')

/* sha256 of renderToStaticMarkup for every existing HeaderDefault render in
   HeaderDefault.test.tsx and showcase/App.tsx, captured from the v2.12.0
   build (census copy of `fbc6e2f`) before the first source edit of Gate 97. */
const V2_12_0: [string, ReactElement, string][] = [
  ['test: title', <HeaderDefault title="Transfer" />, '1d097af2bc55936c6c0e5f2c22506293c6c81603cc75c53df8fad098cf07db46'],
  ['test: action', <HeaderDefault title="Transfer" actionLabel="Skip" />, '9b4ea7434dc016df4597bbc9557d7dd66ea6762630ef5947351509706e440ff5'],
  ['test: stepper', <HeaderDefault title="Transfer" isProgressStepper currentStep={2} totalSteps={5} />, '5cfb61b1707de70eb102ea28b4ab99d38ef34196e32bd6ac28456e1cf5430627'],
  ['showcase: title subtitle action', <HeaderDefault title="Title" subtitle="Subtitle" hasSubtitle actionLabel="Action" />, '736a6139a2302bb495dba9b5ac732e766c521f7fc0a6172cde1be4249c1eeb69'],
  ['showcase: title subtitle', <HeaderDefault title="Title" subtitle="Subtitle" hasSubtitle />, '7374470d026ad1f444dbd28e347528788418fb73d1537a2b249ac9fdb720eb26'],
  ['showcase: stepper subtitle', <HeaderDefault subtitle="Subtitle" hasSubtitle isProgressStepper currentStep={1} totalSteps={7} />, 'b6febd4dbe69b7f1c7b6ad462b124bb96dc00aa5d44ee4bd7a648e2916155507'],
  ['showcase: title only', <HeaderDefault title="Title" hasSubtitle={false} />, '84d73e66ed67e67d0f1cc9833de8b2e905bd4761431aa1874b03ed141ecb03d2'],
  ['showcase: stepper only', <HeaderDefault hasSubtitle={false} isProgressStepper currentStep={3} totalSteps={7} />, 'db08ede9ad40c9f9b0abc44e75b6d595349d8cce57161c397ffa0e928c77d7bf'],
  ['showcase: title action', <HeaderDefault title="Title" hasSubtitle={false} actionLabel="Action" />, 'c1a5f724b26010b0467399e920e1435e933cc25ebc2374dedc8f1a1107121526'],
]

const title = (container: HTMLElement) => container.querySelector('.mn-header-default__title') as HTMLElement

describe('HeaderDefault titleAccent (Gate 97, G65)', () => {
  it('renders the accent as a nested span with its class, inside the title span', () => {
    const { container } = render(<HeaderDefault title="Send" titleAccent="Ethereum" hasSubtitle={false} />)
    const accent = title(container).querySelector('span')!
    expect(accent).toHaveClass('mn-header-default__title-accent')
    expect(accent).toHaveTextContent('Ethereum')
    expect(accent.parentElement).toBe(title(container))
  })

  it('joins the title and the accent with exactly one space, and reads "Send Ethereum"', () => {
    const html = renderToStaticMarkup(<HeaderDefault title="Send" titleAccent="Ethereum" hasSubtitle={false} />)
    expect(html).toContain('<span class="mn-header-default__title type-body-m-semibold">Send <span class="mn-header-default__title-accent">Ethereum</span></span>')
    const { container } = render(<HeaderDefault title="Send" titleAccent="Ethereum" hasSubtitle={false} />)
    expect(title(container).textContent).toBe('Send Ethereum')
  })

  it("colours the accent with Decision 32's token and declares nothing else", () => {
    expect(declaration(CSS, '.mn-header-default__title-accent', 'color')).toBe('var(--mapped-text-primary-default)')
    const rules = CSS.filter(r => r.selectors.includes('.mn-header-default__title-accent'))
    expect(rules).toHaveLength(1)
    expect([...rules[0].decls.keys()]).toEqual(['color'])
  })

  it('keeps the nowrap + ellipsis on the whole title line', () => {
    expect(declaration(CSS, '.mn-header-default__title', 'white-space')).toBe('nowrap')
    expect(declaration(CSS, '.mn-header-default__title', 'overflow')).toBe('hidden')
    expect(declaration(CSS, '.mn-header-default__title', 'text-overflow')).toBe('ellipsis')
  })

  it('is ignored by the stepper variant, which renders no title', () => {
    const { container } = render(<HeaderDefault title="Send" titleAccent="Ethereum" isProgressStepper />)
    expect(container.querySelector('.mn-header-default__title')).toBeNull()
    expect(container.querySelector('.mn-header-default__title-accent')).toBeNull()
    expect(container.textContent).not.toContain('Ethereum')
  })

  it('renders an empty accent exactly as no accent: no span and no trailing space', () => {
    expect(renderToStaticMarkup(<HeaderDefault title="Send" titleAccent="" />)).toBe(renderToStaticMarkup(<HeaderDefault title="Send" />))
  })

  it('has no axe violations with an accent', async () => {
    const { container } = render(<HeaderDefault title="Send" titleAccent="Ethereum" hasSubtitle={false} actionLabel="Cancel" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders every existing path exactly as v2.12.0 did', () => {
    for (const [name, element, hash] of V2_12_0) {
      expect(`${name}: ${sha(renderToStaticMarkup(element))}`).toBe(`${name}: ${hash}`)
    }
  })
})
