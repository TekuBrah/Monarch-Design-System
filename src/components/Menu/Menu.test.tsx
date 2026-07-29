import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Menu } from './Menu'

// Menu exports no variant union — searchBar and isOptionList are its axes.
describe('Menu', () => {
  it('renders without crashing', () => {
    const { container } = render(<Menu />)
    expect(container.firstChild).toHaveClass('mn-menu')
  })

  it('renders a listbox by default', () => {
    render(<Menu />)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('omits the listbox wrapper when isOptionList is false', () => {
    render(<Menu isOptionList={false} slotContent={<span>Anything</span>} />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByText('Anything')).toBeInTheDocument()
  })

  it('renders the search field by default and omits it when searchBar is false', () => {
    const { unmount } = render(<Menu />)
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument()
    unmount()

    render(<Menu searchBar={false} />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('renders its slot content', () => {
    render(<Menu slotContent={<div role="option" aria-selected={false}>Row</div>} />)
    expect(screen.getByRole('option', { name: 'Row' })).toBeInTheDocument()
  })

  // listAriaLabel is what names the role="listbox". It has no generated default
  // on purpose (a generic one would collide when several menus share a page),
  // so supplying it is the correct usage contract — not an optional extra.
  it('names its listbox from listAriaLabel', () => {
    render(<Menu listAriaLabel="Accounts" />)
    expect(screen.getByRole('listbox', { name: 'Accounts' })).toBeInTheDocument()
  })

  it('has no axe violations when correctly labelled', async () => {
    const { container } = render(<Menu listAriaLabel="Accounts" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
