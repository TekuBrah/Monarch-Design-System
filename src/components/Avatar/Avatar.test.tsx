import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Avatar } from './Avatar'
import type { AvatarSize } from './Avatar'

const SIZES: AvatarSize[] = ['s', 'm', 'l']

describe('Avatar', () => {
  it('renders without crashing', () => {
    const { container } = render(<Avatar />)
    expect(container.firstChild).toHaveClass('mn-avatar')
  })

  it.each(SIZES)('renders size %s', size => {
    const { container } = render(<Avatar size={size} />)
    expect(container.firstChild).toHaveClass(`mn-avatar--${size}`)
  })

  // Three mutually exclusive render branches, picked by which props are passed.
  it('renders the photo branch when src is given', () => {
    render(<Avatar src="/x.png" alt="Ada Lovelace" />)
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument()
  })

  it('renders the initials branch, deriving initials from name', () => {
    render(<Avatar name="Ada Lovelace" />)
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('renders the placeholder branch when given neither src nor name', () => {
    const { container } = render(<Avatar />)
    expect(container.firstChild).toHaveClass('mn-avatar--placeholder')
  })

  it('has no axe violations in its default state', async () => {
    const { container } = render(<Avatar />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
